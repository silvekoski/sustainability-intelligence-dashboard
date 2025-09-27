/*
  # Fix INSERT policy for profiles table

  1. Security
    - Drop existing INSERT policy if it exists
    - Create new INSERT policy for authenticated users to insert their own profile
*/

-- Drop the policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Add INSERT policy for profiles table
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);