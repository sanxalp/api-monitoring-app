-- Disable email confirmation requirement for new signups
-- This allows users to sign in immediately after registration without confirming their email

-- Note: This is configured in Supabase project settings
-- Go to Authentication -> Providers -> Email
-- Disable "Confirm email" option in the Supabase dashboard
-- Or set confirm_email to false in the auth configuration

-- For now, we document that this needs to be done in the Supabase dashboard
-- The configuration is not available via SQL directly, but can be set via Supabase API or UI
