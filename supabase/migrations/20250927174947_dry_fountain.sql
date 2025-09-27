/*
  # Fix profile INSERT policy conflict

  1. Security Updates
    - Remove conflicting INSERT policy that blocks the handle_new_user trigger
    - The trigger runs with SECURITY DEFINER privileges and doesn't need RLS bypass
    - Keep SELECT and UPDATE policies for user profile management

  2. Changes
    - Drop the "Users can insert their own profile" policy
    - Allow the handle_new_user trigger to create profiles automatically
*/

-- Drop the conflicting INSERT policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- The handle_new_user trigger will handle profile creation automatically
-- No INSERT policy needed since users don't manually insert profiles