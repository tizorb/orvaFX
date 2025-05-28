
    import { supabase } from '@/lib/supabaseClient';
    import { waitForPublicProfile, fetchUserProfile } from './userProfile';
    import { checkPwnedPassword } from '@/lib/passwordUtils';
    import { handleUserRegistration } from './registrationUtils'; 
    import { handleSupabaseAuthError, resolveEmailFromIdentifier } from './authErrorUtils';
    import { performSupabaseSignOut } from './sessionManager';
    import { saveToLocalStorage, removeFromLocalStorage } from '@/lib/localStorageUtils';
    import { STORAGE_KEYS } from '@/lib/authConstants';
        
    export const signUpWithEmailPassword = async (username, email, password, referralCodeInput = null, role = 'user', t) => {
      try {
        const pwnedCheckResult = await checkPwnedPassword(password, t);
        if (pwnedCheckResult.isCompromised) {
          return { success: false, message: pwnedCheckResult.message };
        }
        if (pwnedCheckResult.error && !pwnedCheckResult.skipped) {
          return { success: false, message: pwnedCheckResult.message };
        }
        if (pwnedCheckResult.skipped) {
          console.warn("Pwned password check was skipped:", pwnedCheckResult.message);
        }
        
        const registrationResult = await handleUserRegistration(username, email, password, referralCodeInput, role, t);

        if (!registrationResult.success) {
          return { success: false, message: registrationResult.message };
        }
    
        return { success: true, user: registrationResult.user, profile: registrationResult.profile };

      } catch (e) {
        console.error('Exception in signUpWithEmailPassword (outer function):', e);
        const errorMessage = typeof t === 'function' 
          ? t('register_error_generic_outer_exception', "An unexpected error occurred during the registration process.") 
          : "An unexpected error occurred during the registration process.";
        return { success: false, message: errorMessage };
      }
    };
        
    export const signInWithIdentifierPassword = async (identifier, password, t) => {
      try {
        if (!identifier || !password) {
          const errorMessage = typeof t === 'function' 
            ? t('login_error_fields_required', "Email/Username and password are required.") 
            : "Email/Username and password are required.";
          return { success: false, message: errorMessage };
        }

        const emailResolution = await resolveEmailFromIdentifier(identifier, t);
        if (!emailResolution.success) {
          return { success: false, message: emailResolution.message };
        }
        const emailToTry = emailResolution.email;
    
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailToTry,
          password,
        });
    
        if (error) {
          const clientMessage = handleSupabaseAuthError(error, t, 'login');
          if (error.message?.toLowerCase().includes("aal2 required") || error.message?.toLowerCase().includes("mfa")) {
            const { data: mfaData, error: mfaError } = await supabase.auth.mfa.listFactors();
            if (mfaError) {
                console.error("signInWithIdentifierPassword: Error listing MFA factors:", mfaError);
                return { success: false, message: "MFA is required, but there was an error checking your MFA setup." };
            }
            const totpFactor = mfaData?.all?.find(f => f.factor_type === 'totp' && f.status === 'verified');
            if (totpFactor) {
              console.log("signInWithIdentifierPassword: MFA required, verified TOTP factor found:", totpFactor.id);
              return { success: false, mfaRequired: true, factorId: totpFactor.id, aal2: true, userId: data?.user?.id, message: clientMessage };
            }
            const mfaSetupErrorMessage = typeof t === 'function' 
              ? t('login_error_mfa_setup_issue', "MFA is required but no verified TOTP factor found.") 
              : "MFA is required but no verified TOTP factor found.";
            return { success: false, message: mfaSetupErrorMessage };
          }
          return { success: false, message: clientMessage };
        }
        if (data && data.user) {
          const profile = await fetchUserProfile(data.user.id); 
          if (profile) {
            return { success: true, user: data.user, profile: profile };
          }
          
          console.warn(`Login successful for ${data.user.id} but profile fetch failed.`);
          
          await performSupabaseSignOut(); 
          const profileFetchErrorMessage = (typeof t === 'function' 
            ? t('login_error_profile_fetch_critical', "Login successful but user profile could not be loaded. Please try again.") 
            : "Login successful but user profile could not be loaded. Please try again.");
          return { success: false, message: profileFetchErrorMessage };
        }
        const noUserReturnedMessage = typeof t === 'function' 
          ? t('login_error_no_user_returned', "Sign in did not return a user object.") 
          : "Sign in did not return a user object.";
        return { success: false, message: noUserReturnedMessage };
      } catch (e) {
        console.error('Exception in signInWithIdentifierPassword:', e);
        const exceptionMessage = typeof t === 'function' 
          ? t('login_error_exception', "An unexpected error occurred during login.") 
          : "An unexpected error occurred during login.";
        return { success: false, message: exceptionMessage };
      }
    };
    
    export const signOutCurrentSession = async () => {
      const result = await performSupabaseSignOut();
      if(result.success) {
        removeFromLocalStorage(STORAGE_KEYS.CURRENT_USER);
        removeFromLocalStorage(STORAGE_KEYS.MFA_CHALLENGE);
      }
      return result;
    };
  