
    import { supabase, checkSupabaseConnection as checkSupabaseConnectionFunc } from '@/lib/supabaseClient';
    import { fetchUserProfile } from '@/contexts/authUtils/userProfile';
    import { STORAGE_KEYS } from '@/lib/authConstants';
    import { saveToLocalStorage, getFromLocalStorage, removeFromLocalStorage } from '@/lib/localStorageUtils';

    export const getSupabaseSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting Supabase session:', error);
          return { session: null, error };
        }
        return { session: data.session, error: null };
      } catch (e) {
        console.error('Exception during getSupabaseSession:', e);
        return { session: null, error: e };
      }
    };

    const attemptToFetchProfileWithRetries = async (authUserId, retries = 3, delay = 1000) => {
      for (let i = 0; i < retries; i++) {
        const profile = await fetchUserProfile(authUserId);
        if (profile) return profile;
        console.warn(`Profile fetch attempt ${i + 1} for ${authUserId} failed. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
      console.error(`Failed to fetch profile for ${authUserId} after ${retries} retries.`);
      return null;
    };

    export const performSupabaseSignOut = async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Error signing out from Supabase:', error);
          return { success: false, error };
        }
        return { success: true };
      } catch (e) {
        console.error('Exception during Supabase sign out:', e);
        return { success: false, error: e };
      }
    };

    export const handleUserSession = async (sessionUser, setUserState, setMfaChallengeState, logoutFunction) => {
      if (sessionUser) {
        const currentAuthLevel = sessionUser.aal;
        const mfaRequiredState = getFromLocalStorage(STORAGE_KEYS.MFA_CHALLENGE);

        if (currentAuthLevel === 'aal2' || (!mfaRequiredState && sessionUser.user_metadata?.mfa_verified !== false)) {
          let profile = await attemptToFetchProfileWithRetries(sessionUser.id);
          
          if (profile) {
            setUserState(profile);
            saveToLocalStorage(STORAGE_KEYS.CURRENT_USER, profile);
            setMfaChallengeState(null);
            removeFromLocalStorage(STORAGE_KEYS.MFA_CHALLENGE);
          } else {
            console.warn(`No public profile found for auth user ${sessionUser.id} after retries. User will be logged out.`);
            if (logoutFunction) await logoutFunction(true); 
            else {
                await performSupabaseSignOut();
                setUserState(null);
                setMfaChallengeState(null);
                removeFromLocalStorage(STORAGE_KEYS.CURRENT_USER);
                removeFromLocalStorage(STORAGE_KEYS.MFA_CHALLENGE);
            }
          }
        } else if (mfaRequiredState && currentAuthLevel !== 'aal2') {
          setUserState(null); 
          setMfaChallengeState(mfaRequiredState);
          console.log("User session loaded, MFA pending based on stored MFA challenge state.");
        } else if (sessionUser.user_metadata?.mfa_verified === false && currentAuthLevel !== 'aal2') {
            console.log("User session loaded, but MFA was previously initiated and not completed. Setting MFA challenge.");
            const { data: mfaFactorsData, error: mfaFactorsError } = await supabase.auth.mfa.listFactors();
            if (mfaFactorsError) {
                console.error("Error listing MFA factors:", mfaFactorsError);
                if (logoutFunction) await logoutFunction(true); else { 
                  await performSupabaseSignOut();
                  setUserState(null); setMfaChallengeState(null); 
                  removeFromLocalStorage(STORAGE_KEYS.CURRENT_USER); removeFromLocalStorage(STORAGE_KEYS.MFA_CHALLENGE);
                }
                return;
            }
            const totpFactor = mfaFactorsData?.all?.find(f => f.factor_type === 'totp' && f.status === 'verified');
            if (totpFactor) {
                const mfaData = { factorId: totpFactor.id, aal2: true };
                setMfaChallengeState(mfaData);
                saveToLocalStorage(STORAGE_KEYS.MFA_CHALLENGE, mfaData);
                setUserState(null);
                removeFromLocalStorage(STORAGE_KEYS.CURRENT_USER);
            } else {
                 console.warn("MFA was pending but no TOTP factor found. Logging out.");
                 if (logoutFunction) await logoutFunction(true);
                 else {
                    await performSupabaseSignOut();
                    setUserState(null);
                    setMfaChallengeState(null);
                    removeFromLocalStorage(STORAGE_KEYS.CURRENT_USER);
                    removeFromLocalStorage(STORAGE_KEYS.MFA_CHALLENGE);
                 }
            }
        } else {
             console.log("User session found, but conditions for full login or MFA challenge not met. Defaulting to signed out state.");
             if (logoutFunction) await logoutFunction(true);
             else {
                await performSupabaseSignOut();
                setUserState(null);
                setMfaChallengeState(null);
                removeFromLocalStorage(STORAGE_KEYS.CURRENT_USER);
                removeFromLocalStorage(STORAGE_KEYS.MFA_CHALLENGE);
             }
        }

      } else {
        setUserState(null);
        setMfaChallengeState(null);
        removeFromLocalStorage(STORAGE_KEYS.CURRENT_USER);
        removeFromLocalStorage(STORAGE_KEYS.MFA_CHALLENGE);
      }
    };

    export const loadInitialSession = async (setLoadingState, setUserState, setMfaChallengeState, logoutFunction) => {
      setLoadingState(true);
      const isConnected = await checkSupabaseConnectionFunc();

      if (!isConnected) {
        console.warn("Supabase connection failed. Auth operations may not work. Attempting to load from localStorage.");
        const localUser = getFromLocalStorage(STORAGE_KEYS.CURRENT_USER);
        const localMfaChallenge = getFromLocalStorage(STORAGE_KEYS.MFA_CHALLENGE);
        if (localUser && !localMfaChallenge) { 
          setUserState(localUser);
        } else if (localMfaChallenge) {
          setMfaChallengeState(localMfaChallenge);
          setUserState(null); 
        } else {
          setUserState(null);
          setMfaChallengeState(null);
        }
        setLoadingState(false);
        return;
      }

      try {
        const { session, error: sessionError } = await getSupabaseSession();

        if (sessionError) {
          console.error('Error getting session during initial load:', sessionError.message);
          const localUser = getFromLocalStorage(STORAGE_KEYS.CURRENT_USER);
          const localMfaChallenge = getFromLocalStorage(STORAGE_KEYS.MFA_CHALLENGE);
          if (localUser && !localMfaChallenge) setUserState(localUser);
          else if (localMfaChallenge) setMfaChallengeState(localMfaChallenge);
          else { setUserState(null); setMfaChallengeState(null); }
        } else {
          await handleUserSession(session?.user, setUserState, setMfaChallengeState, logoutFunction);
        }
      } catch (e) {
        console.error("Exception during loadInitialSession:", e);
        const localUser = getFromLocalStorage(STORAGE_KEYS.CURRENT_USER);
        const localMfaChallenge = getFromLocalStorage(STORAGE_KEYS.MFA_CHALLENGE);
        if (localUser && !localMfaChallenge) setUserState(localUser);
        else if (localMfaChallenge) setMfaChallengeState(localMfaChallenge);
        else { setUserState(null); setMfaChallengeState(null); }
      } finally {
        setLoadingState(false);
      }
    };

    export const setupAuthListener = (setUserState, setMfaChallengeState, logoutFunction) => {
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log(`Auth event: ${event}`, session ? { userId: session.user?.id, aal: session.user?.aal, metadata: session.user?.user_metadata } : 'No session');
        
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED' || event === 'MFA_CHALLENGE_VERIFIED') {
          await handleUserSession(session?.user, setUserState, setMfaChallengeState, logoutFunction);
        } else if (event === "SIGNED_OUT") {
          setUserState(null);
          setMfaChallengeState(null);
          removeFromLocalStorage(STORAGE_KEYS.CURRENT_USER);
          removeFromLocalStorage(STORAGE_KEYS.MFA_CHALLENGE);
        } else if (event === "PASSWORD_RECOVERY") {
            setUserState(null);
            setMfaChallengeState(null);
            removeFromLocalStorage(STORAGE_KEYS.CURRENT_USER);
            removeFromLocalStorage(STORAGE_KEYS.MFA_CHALLENGE);
        }
      });
      return listener?.subscription;
    };

    export const clearMfaChallengeAndRedirect = (setMfaChallengeState, navigate) => {
      setMfaChallengeState(null);
      removeFromLocalStorage(STORAGE_KEYS.MFA_CHALLENGE);
      if (navigate) {
        navigate('/login');
      }
    };
  