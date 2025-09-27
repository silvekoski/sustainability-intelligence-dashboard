/*
  # Fix profiles table INSERT policy

  1. Security Updates
    - Add INSERT policy for authenticated users to create their own profiles
    - Ensure users can only insert profiles with their own auth.uid()
    - Fix RLS policy violation during user registration

  2. Changes
    - Add "Users can insert their own profile" policy
    - Allow authenticated users to INSERT with proper user ID validation
*/

-- Add INSERT policy for profiles table
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);