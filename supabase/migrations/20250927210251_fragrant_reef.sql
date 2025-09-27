/*
  # Create EU Emissions Permits Table

  1. New Tables
    - `eu_permits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `active_permits` (integer, number of active permits)
      - `company_name` (text, optional company name)
      - `permit_year` (integer, year for the permits)
      - `notes` (text, optional notes)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `eu_permits` table
    - Add policy for users to manage their own permit data
*/

CREATE TABLE IF NOT EXISTS eu_permits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  active_permits integer NOT NULL DEFAULT 0 CHECK (active_permits >= 0),
  company_name text,
  permit_year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE eu_permits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own permits"
  ON eu_permits
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_eu_permits_user_id ON eu_permits(user_id);
CREATE INDEX IF NOT EXISTS idx_eu_permits_year ON eu_permits(permit_year);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_eu_permits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_eu_permits_updated_at
  BEFORE UPDATE ON eu_permits
  FOR EACH ROW
  EXECUTE FUNCTION update_eu_permits_updated_at();