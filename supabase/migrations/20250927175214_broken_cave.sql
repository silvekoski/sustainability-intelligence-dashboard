@@ .. @@
 -- Create improved function to handle user creation
 CREATE OR REPLACE FUNCTION handle_new_user()
 RETURNS trigger AS $$
 BEGIN
+  -- Set search_path to ensure we can access public schema tables
+  SET search_path = public;
+  
   -- Insert profile with error handling
   INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
   VALUES (