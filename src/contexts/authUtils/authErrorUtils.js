
    import { supabase } from '@/lib/supabaseClient';

    export const handleSupabaseAuthError = (error, t, context) => {
      console.error(`Supabase auth error (${context}):`, {
        name: error.name,
        message: error.message,
        status: error.status,
        code: error.code,
      });
    
      if (error.message?.toLowerCase().includes("user already registered")) {
        return t?.('register_error_email_exists') || "User already registered";
      }
      if (error.message?.toLowerCase().includes("rate limit exceeded")) {
        return t?.('register_error_rate_limit') || "Rate limit exceeded. Please try again later.";
      }
      if (error.message === "Signup requires a valid password") {
        return t?.('register_error_password_invalid_supa') || "Signup requires a valid password.";
      }
      if (
        error.message?.toLowerCase().includes("database error saving new user") || 
        error.message?.toLowerCase().includes("database error") ||
        error.message?.toLowerCase().includes("unexpected_failure") ||
        error.status === 500
      ) {
        return t?.('register_error_supabase_internal_db') || "Registration service encountered a database issue. Please try again later. If the problem persists, contact support.";
      }
      if (error.message?.toLowerCase().includes("invalid login credentials")) {
        return t?.('login_error_toast_desc') || "Invalid login credentials.";
      }
      if (error.message?.toLowerCase().includes("aal2 required")) {
        return t?.('login_mfa_required_trigger') || "MFA code required to complete login.";
      }
    
      return error.message || (t?.(`${context}_error_generic`) || "An unexpected error occurred.");
    };

    export const resolveEmailFromIdentifier = async (identifier, t) => {
      if (!identifier || typeof identifier !== 'string') {
        return { success: false, message: t?.('login_error_identifier_missing') || "Identifier (username or email) is required." };
      }
      if (identifier.includes('@')) {
        return { success: true, email: identifier };
      }
    
      const { data: userProfileByUsername, error: profileError } = await supabase
        .from('users')
        .select('email, auth_user_id')
        .eq('username', identifier)
        .maybeSingle();
    
      if (profileError && profileError.code !== 'PGRST116') { 
        console.error('Error fetching profile by username during sign in:', profileError);
        return { success: false, message: t?.('login_error_toast_desc_generic_lookup') || "Error looking up user." };
      }
      if (!userProfileByUsername || !userProfileByUsername.email) {
        return { success: false, message: t?.('login_error_username_not_found') || "Invalid username or no email associated." };
      }
      return { success: true, email: userProfileByUsername.email };
    };
  