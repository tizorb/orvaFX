
    import { supabase } from '@/lib/supabaseClient';
    import { waitForPublicProfile } from '@/contexts/authUtils/userProfile';

    const validateRegistrationInput = (username, email, password, t) => {
      if (!password || password.length < 6) {
        return { isValid: false, message: t?.('register_error_password_length') || "Password must be at least 6 characters." };
      }
      if (!email || !email.includes('@')) {
        return { isValid: false, message: t?.('register_error_invalid_email') || "A valid email is required." };
      }
      if (!username) {
        return { isValid: false, message: t?.('register_error_username_required_generic') || "Username is required."};
      }
      return { isValid: true };
    };

    const handleSupabaseSignUpError = (signUpError, t) => {
      console.error('Supabase signUp error details:', {
        name: signUpError.name,
        message: signUpError.message,
        status: signUpError.status,
        code: signUpError.code,
        details: signUpError.details, 
      });
      
      let clientMessage = signUpError.message;
      if (signUpError.message?.toLowerCase().includes("user already registered")) {
        clientMessage = t?.('register_error_email_exists') || "User already registered with this email.";
      } else if (signUpError.message?.toLowerCase().includes("rate limit exceeded")) {
        clientMessage = t?.('register_error_rate_limit') || "Rate limit exceeded. Please try again later.";
      } else if (signUpError.message === "Signup requires a valid password") {
        clientMessage = t?.('register_error_password_invalid_supa') || "Signup requires a valid password.";
      } else if (
        signUpError.message?.toLowerCase().includes("database error saving new user") || 
        signUpError.message?.toLowerCase().includes("database error") || 
        signUpError.message?.toLowerCase().includes("unexpected_failure") ||
        signUpError.status === 500
      ) {
        clientMessage = t?.('register_error_supabase_internal_db') || "Registration service encountered a database issue. Please try again later. If the problem persists, contact support.";
      } else {
        clientMessage = t?.('register_error_generic') || "Registration failed. Please try again.";
      }
      return { success: false, message: clientMessage, error: signUpError };
    };
    
    export const handleUserRegistration = async (username, email, password, referralCodeInput = null, role = 'user', t) => {
      try {
        const validation = validateRegistrationInput(username, email, password, t);
        if (!validation.isValid) {
          return { success: false, message: validation.message };
        }

        let referredByPublicUserId = null; 
        if (referralCodeInput && referralCodeInput.trim() !== "") {
          const { data: referrer, error: referrerError } = await supabase
            .from('users')
            .select('id') 
            .eq('referral_code', referralCodeInput.trim())
            .maybeSingle();

          if (referrerError && referrerError.code !== 'PGRST116') { 
            console.error('Error looking up referral code:', referrerError.message);
            return { success: false, message: t?.('register_error_referral_lookup_failed') || "Could not verify referral code. Please try again."};
          }
          if (!referrer) {
            console.warn('Referral code not found:', referralCodeInput);
            return { success: false, message: t?.('register_error_referral_invalid') || "Invalid referral code." };
          }
          referredByPublicUserId = referrer.id; 
        }

        const signUpOptionsData = {
          username: username.trim(),
          role: role 
        };
        if (referredByPublicUserId) {
          signUpOptionsData.referred_by_during_signup = referredByPublicUserId; 
        }

        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: signUpOptionsData
          }
        });

        if (signUpError) {
          return handleSupabaseSignUpError(signUpError, t);
        }
        
        if (!authData || (!authData.user && !authData.session)) {
           console.error("Supabase signUp call did not return user or session data.");
           return { success: false, message: t?.('register_error_generic_no_user_data') || "Registration seems to have succeeded but no user data was returned. Please try to login or contact support."};
        }
        
        const createdUser = authData.user;
        if (!createdUser || !createdUser.id) {
             console.error("Supabase signUp call did not return a valid user object with an ID in authData.");
             return { success: false, message: t?.('register_error_user_creation_no_id') || "User registration succeeded but essential user data is missing. Please contact support."};
        }
        
        console.log("User created in auth.users:", createdUser.id, "email:", createdUser.email, "with metadata:", signUpOptionsData);
        
        const profileResult = await waitForPublicProfile(createdUser.id, t); 
        if (!profileResult.success || !profileResult.profile) {
          console.error("CRITICAL: Profile not found after signup for user:", createdUser.id, "Message:", profileResult.message);
          console.warn("The auth user was created, but their public profile was not. This might require manual intervention or a backend process to resolve orphaned auth users.");
          return { success: false, message: profileResult.message || t?.('register_error_profile_creation_critical') || "Critical: Your account was created, but profile setup failed. Please contact support." };
        }

        let publicProfile = profileResult.profile;
        console.log("Public profile fetched/created after signup:", publicProfile);

        const updatePayload = {};
        if (publicProfile.username !== username.trim() && username.trim()) {
          updatePayload.username = username.trim();
        }
        
        if (referredByPublicUserId && publicProfile.referred_by !== referredByPublicUserId) {
            console.warn(`Referral Mismatch/Delay: Expected referred_by ${referredByPublicUserId} but public profile has ${publicProfile.referred_by} for user ${publicProfile.id} immediately after creation. This could be a trigger timing issue or misconfiguration. Assuming trigger will eventually align it or metadata is correct.`);
        }


        if (Object.keys(updatePayload).length > 0) {
          console.log(`Attempting to update public profile (username) for ${publicProfile.id} with payload:`, updatePayload);
          const {data: updatedP, error: updateErr} = await supabase
            .from('users')
            .update(updatePayload)
            .eq('id', publicProfile.id) 
            .select()
            .single();
    
          if(updateErr) {
            console.error(`Error updating username for new user ${publicProfile.id} in public.users:`, updateErr.message);
          } else if (updatedP) {
            publicProfile = updatedP;
            console.log(`Public profile for ${publicProfile.id} updated successfully with username:`, publicProfile);
          }
        }
        
        if (referredByPublicUserId && publicProfile && publicProfile.id && publicProfile.referred_by === referredByPublicUserId) {
           console.log("Attempting to create referral log for referrer:", referredByPublicUserId, "and referred user:", publicProfile.id);
           const { error: logError } = await supabase.from('referral_logs').insert({
            referrer_id: referredByPublicUserId,
            referred_user_id: publicProfile.id,
          });
          if (logError) console.error("Error creating referral log:", logError.message);
          else console.log("Referral log created successfully for referred user:", publicProfile.id);
        } else if (referredByPublicUserId && (!publicProfile || !publicProfile.id)) {
          console.warn("Cannot create referral log because publicProfile.id is missing. Public profile:", publicProfile);
        } else if (referredByPublicUserId && publicProfile && publicProfile.id && publicProfile.referred_by !== referredByPublicUserId) {
           console.warn("Referral log not created due to mismatch. User", publicProfile.id, "was referred by", referredByPublicUserId, "during signup, but profile (after possible trigger execution) shows referred_by:", publicProfile.referred_by, ". This might indicate a trigger issue if 'referred_by_during_signup' metadata was not correctly processed by the backend trigger to populate 'public.users.referred_by'.");
        }
    
        return { success: true, user: createdUser, profile: publicProfile };

      } catch (e) {
        console.error('Exception in handleUserRegistration:', e);
        let errorMessage = t?.('register_error_generic_exception') || "An unexpected error occurred during registration. Please try again.";
        if (e instanceof Error) {
          errorMessage = e.message;
        }
        return { success: false, message: errorMessage, error: e };
      }
    };
  