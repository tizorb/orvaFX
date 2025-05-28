
    import { supabase } from '@/lib/supabaseClient';

    export const fetchUserProfile = async (authUserId) => {
      if (!authUserId) {
        console.warn("fetchUserProfile called with no authUserId");
        return null;
      }
      try {
        const { data, error, status } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', authUserId)
          .maybeSingle();
        
        if (error) {
          console.error(`Error fetching user profile for auth_user_id ${authUserId}:`, { 
            message: error.message, 
            details: error.details, 
            hint: error.hint,
            code: error.code,
            status: status 
          });
          if (error.code === '42P17' || error.message?.includes('infinite recursion')) {
            console.error("INFINITE RECURSION DETECTED IN RLS POLICY ON 'users' TABLE. Please check your Supabase Row Level Security policies.");
          }
          if (status === 404 || error.code === 'PGRST116') { 
            console.warn(`Profile not found for auth_user_id ${authUserId}. This might be a new user whose profile is still being created.`);
          }
          return null;
        }
        if (!data) {
            console.warn(`No profile data returned for auth_user_id ${authUserId}, though no explicit error. This could mean the profile doesn't exist yet.`);
            return null;
        }
        return data;
      } catch (e) {
        console.error(`Exception in fetchUserProfile for auth_user_id ${authUserId}:`, e);
        return null;
      }
    };

    export const fetchUserProfileByPublicId = async (publicUserId) => {
      if (!publicUserId) {
        console.warn("fetchUserProfileByPublicId called with no publicUserId");
        return null;
      }
      try {
        const { data, error, status } = await supabase
          .from('users')
          .select('*')
          .eq('id', publicUserId)
          .maybeSingle();
        
        if (error) {
          console.error(`Error fetching user profile by public id ${publicUserId}:`, {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            status: status
          });
          if (error.code === '42P17' || error.message?.includes('infinite recursion')) {
            console.error("INFINITE RECURSION DETECTED IN RLS POLICY ON 'users' TABLE. Please check your Supabase Row Level Security policies.");
          }
          return null;
        }
        return data;
      } catch (e) {
        console.error(`Exception in fetchUserProfileByPublicId for public_id ${publicUserId}:`, e);
        return null;
      }
    };

    export const waitForPublicProfile = async (authUserId, t, retries = 7, initialDelay = 1000, backoffFactor = 1.5) => {
      console.log(`Iniciando waitForPublicProfile para userId: ${authUserId}`);
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const { data, error, status } = await supabase
            .from('users')
            .select('id, auth_user_id, email, username, role, admin, created_at, is_subscribed, subscription_tier, subscription_end_date, referral_code, referred_by, referral_earnings_usdt, wallet_balance_usdt')
            .eq('auth_user_id', authUserId)
            .single(); 

          if (error) {
            console.error(`Intento ${attempt} de waitForPublicProfile falló: ${error.message} (code: ${error.code}, status: ${status})`);
            if (error.code === 'PGRST116') { 
              console.warn(`Perfil no encontrado para userId: ${authUserId} en intento ${attempt}. Esto es esperado si el perfil aún no se ha creado.`);
              if (attempt === retries) {
                console.error('Máximo de intentos alcanzado en waitForPublicProfile. Perfil no encontrado para:', authUserId);
                const errorMessage = typeof t === 'function' 
                  ? t('login_error_profile_fetch_critical', "User profile could not be retrieved after multiple attempts. Please contact support.") 
                  : "User profile could not be retrieved after multiple attempts. Please contact support.";
                return { success: false, profile: null, message: errorMessage };
              }
            } else {
              
              const errorMessage = typeof t === 'function' 
                ? t('login_error_profile_fetch_generic', "An error occurred while fetching your profile. Please try again.") 
                : "An error occurred while fetching your profile. Please try again.";
              return { success: false, profile: null, message: `${errorMessage} (Details: ${error.message})` };
            }
          } else if (data) {
            console.log(`Perfil encontrado en intento ${attempt} para userId ${authUserId}:`, data);
            return { success: true, profile: data };
          }
          
          const delay = initialDelay * Math.pow(backoffFactor, attempt > 1 ? attempt -1 : 0); 
          console.log(`Esperando ${delay.toFixed(0)}ms antes del siguiente intento (${attempt + 1}/${retries}) para userId: ${authUserId}`);
          await new Promise(resolve => setTimeout(resolve, delay));

        } catch (err) {
          console.error(`Excepción en intento ${attempt} de waitForPublicProfile para userId ${authUserId}:`, err);
          if (attempt === retries) {
            const errorMessage = typeof t === 'function' 
              ? t('login_error_profile_fetch_exception', "An unexpected error occurred while retrieving your profile. Please contact support.") 
              : "An unexpected error occurred while retrieving your profile. Please contact support.";
            return { success: false, profile: null, message: errorMessage };
          }
           const delay = initialDelay * Math.pow(backoffFactor, attempt > 1 ? attempt -1 : 0);
           await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      console.error('Máximo de intentos alcanzado en waitForPublicProfile (fuera del bucle). Perfil no encontrado para:', authUserId);
      const finalErrorMessage = typeof t === 'function' 
        ? t('login_error_profile_fetch_max_retries', "User profile could not be found after maximum retries. Please contact support.") 
        : "User profile could not be found after maximum retries. Please contact support.";
      return { success: false, profile: null, message: finalErrorMessage };
    };

    export const updateUserProfileInSupabase = async (authUserId, updates, t) => {
      if (!authUserId) {
        console.error("updateUserProfileInSupabase: authUserId is required.");
        return { success: false, message: t?.('profile_update_error_no_userid', "User ID is missing. Cannot update profile.") || "User ID is missing. Cannot update profile.", data: null };
      }
      if (!updates || Object.keys(updates).length === 0) {
        console.warn("updateUserProfileInSupabase: No updates provided.");
        return { success: false, message: t?.('profile_update_error_no_updates', "No information provided to update.") || "No information provided to update.", data: null };
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .update(updates)
          .eq('auth_user_id', authUserId)
          .select()
          .single();

        if (error) {
          console.error(`Error updating user profile for auth_user_id ${authUserId}:`, error);
          const errorMessage = t?.('profile_update_error_generic', "Failed to update profile. Please try again.") || "Failed to update profile. Please try again.";
          return { success: false, message: `${errorMessage} (Details: ${error.message})`, data: null, error };
        }
        
        console.log(`Profile updated successfully for auth_user_id ${authUserId}:`, data);
        return { success: true, message: t?.('profile_update_success', "Profile updated successfully!") || "Profile updated successfully!", data };
      } catch (e) {
        console.error(`Exception in updateUserProfileInSupabase for auth_user_id ${authUserId}:`, e);
        const errorMessage = t?.('profile_update_error_exception', "An unexpected error occurred while updating your profile.") || "An unexpected error occurred while updating your profile.";
        return { success: false, message: errorMessage, data: null, error: e };
      }
    };
  