/*
  # Create Organizations and Enhanced User Management

  1. New Tables
    - `organizations`
      - `id` (uuid, primary key)
      - `name` (text, organization name)
      - `slug` (text, unique identifier)
      - `license_type` (enum: trial, basic, premium, enterprise)
      - `license_expires_at` (timestamp)
      - `max_users` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `organization_users`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `role` (enum: owner, admin, user)
      - `invited_by` (uuid, foreign key to users)
      - `invited_at` (timestamp)
      - `joined_at` (timestamp)
      - `status` (enum: pending, active, suspended)

  2. Enhanced profiles table
    - Add organization context
    - Add user roles and permissions

  3. Security
    - Enable RLS on all tables
    - Add policies for organization-based access
    - Ensure users can only access their organization's data
*/

-- Create license type enum
CREATE TYPE license_type AS ENUM ('trial', 'basic', 'premium', 'enterprise');

-- Create user role enum
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'user');

-- Create user status enum
CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended');

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  license_type license_type DEFAULT 'trial',
  license_expires_at timestamptz DEFAULT (now() + interval '30 days'),
  max_users integer DEFAULT 5,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create organization_users junction table
CREATE TABLE IF NOT EXISTS organization_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'user',
  invited_by uuid REFERENCES auth.users(id),
  invited_at timestamptz DEFAULT now(),
  joined_at timestamptz,
  status user_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Update profiles table to include organization context
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'current_organization_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN current_organization_id uuid REFERENCES organizations(id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view organizations they belong to"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id 
      FROM organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Organization owners can update their organization"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT organization_id 
      FROM organization_users 
      WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  );

-- Organization users policies
CREATE POLICY "Users can view organization members of their organizations"
  ON organization_users
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Organization admins can manage users"
  ON organization_users
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_users 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin') 
      AND status = 'active'
    )
  );

CREATE POLICY "Users can update their own organization membership"
  ON organization_users
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Function to create organization with owner
CREATE OR REPLACE FUNCTION create_organization_with_owner(
  org_name text,
  org_slug text,
  owner_user_id uuid DEFAULT auth.uid()
)
RETURNS uuid AS $$
DECLARE
  new_org_id uuid;
BEGIN
  -- Create organization
  INSERT INTO organizations (name, slug)
  VALUES (org_name, org_slug)
  RETURNING id INTO new_org_id;
  
  -- Add owner to organization
  INSERT INTO organization_users (organization_id, user_id, role, status, joined_at)
  VALUES (new_org_id, owner_user_id, 'owner', 'active', now());
  
  -- Update user's current organization
  UPDATE profiles 
  SET current_organization_id = new_org_id, updated_at = now()
  WHERE id = owner_user_id;
  
  RETURN new_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to invite user to organization
CREATE OR REPLACE FUNCTION invite_user_to_organization(
  org_id uuid,
  user_email text,
  user_role user_role DEFAULT 'user'
)
RETURNS uuid AS $$
DECLARE
  target_user_id uuid;
  invitation_id uuid;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Create invitation
  INSERT INTO organization_users (organization_id, user_id, role, invited_by, status)
  VALUES (org_id, target_user_id, user_role, auth.uid(), 'pending')
  RETURNING id INTO invitation_id;
  
  RETURN invitation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept organization invitation
CREATE OR REPLACE FUNCTION accept_organization_invitation(invitation_id uuid)
RETURNS boolean AS $$
BEGIN
  UPDATE organization_users
  SET status = 'active', joined_at = now(), updated_at = now()
  WHERE id = invitation_id AND user_id = auth.uid() AND status = 'pending';
  
  IF FOUND THEN
    -- Update user's current organization if they don't have one
    UPDATE profiles
    SET current_organization_id = (
      SELECT organization_id FROM organization_users WHERE id = invitation_id
    ), updated_at = now()
    WHERE id = auth.uid() AND current_organization_id IS NULL;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organization_users_org_id ON organization_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_users_user_id ON organization_users(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_users_status ON organization_users(status);
CREATE INDEX IF NOT EXISTS idx_profiles_current_org ON profiles(current_organization_id);

-- Update the updated_at trigger for organizations
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update the updated_at trigger for organization_users
DROP TRIGGER IF EXISTS update_organization_users_updated_at ON organization_users;
CREATE TRIGGER update_organization_users_updated_at
  BEFORE UPDATE ON organization_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();