
    import { supabase } from '@/lib/supabaseClient';
    import { fetchUserProfile } from '@/contexts/authUtils/userProfile';
    import { STORAGE_KEYS } from '@/lib/authConstants';
    import { getFromLocalStorage, removeFromLocalStorage, saveToLocalStorage } from '@/lib/localStorageUtils';

    export const loadInitialSession = async (setLoading, setUser, setMfaChallenge, performLogout) => {
      console.log("loadInitialSession: Starting session load...");
      setLoading(true);
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("loadInitialSession: Error fetching session:", sessionError.message);
          await performLogout(true);
          return;
        }

        if (session && session.user) {
          const authUser = session.user;
          console.log("loadInitialSession: Session found for user:", authUser.id, "AAL:", authUser.aal);

          const profileResult = await fetchUserProfile(authUser.id);

          if (profileResult) {
            console.log("loadInitialSession: Profile fetched successfully for", authUser.id);
            setUser(profileResult);
            saveToLocalStorage(STORAGE_KEYS.CURRENT_USER, profileResult);
            
            const mfaRequiredForSession = authUser.aal === 'aal1' && (authUser.factors && authUser.factors.some(f => f.status === 'verified'));
            const activeMfaChallenge = getFromLocalStorage(STORAGE_KEYS.MFA_CHALLENGE);

            if (mfaRequiredForSession && !activeMfaChallenge) {
              console.log("loadInitialSession: AAL1 session, but verified factors exist. Potential MFA step missed or completed. Clearing any stale challenge.");
              removeFromLocalStorage(STORAGE_KEYS.MFA_CHALLENGE);
              setMfaChallenge(null);
            } else if (activeMfaChallenge) {
              console.log("loadInitialSession: Active MFA challenge found in local storage.", activeMfaChallenge);
              setMfaChallenge(activeMfaChallenge);
              setUser(null); 
              removeFromLocalStorage(STORAGE_KEYS.CURRENT_USER);
            } else {
              console.log("loadInitialSession: No active MFA challenge, user profile loaded.");
              removeFromLocalStorage(STORAGE_KEYS.MFA_CHALLENGE);
              setMfaChallenge(null);
            }
          } else {
            console.warn("loadInitialSession: Session active, but no public profile found for user:", authUser.id, ". Logging out.");
            await performLogout(true);
          }
        } else {
          console.log("loadInitialSession: No active Supabase session found. User is logged out.");
          await performLogout(true);
        }
      } catch (e) {
        console.error("loadInitialSession: Exception during initial session load:", e);
        await performLogout(true);
      } finally {
        console.log("loadInitialSession: Finished session load. Setting loading to false.");
        setLoading(false);
      }
    };

    export const setupAuthListener = (setUser, setMfaChallenge, performLogout, refreshUserProfile) => {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("AuthListener: Event -", event, "Session User ID -", session?.user?.id, "AAL -", session?.user?.aal);

        switch (event) {
          case 'SIGNED_IN':
            if (session && session.user) {
              const authUser = session.user;
              console.log("AuthListener: SIGNED_IN - User ID:", authUser.id, "AAL:", authUser.aal);
              
              const profile = await fetchUserProfile(authUser.id);
              if (profile) {
                setUser(profile);
                saveToLocalStorage(STORAGE_KEYS.CURRENT_USER, profile);
                
                if (authUser.aal === 'aal2' || !(authUser.factors && authUser.factors.some(f => f.status === 'verified'))) {
                  console.log("AuthListener: SIGNED_IN - AAL2 or no verified factors. Clearing MFA challenge.");
                  removeFromLocalStorage(STORAGE_KEYS.MFA_CHALLENGE);
                  setMfaChallenge(null);
                } else {
                  console.log("AuthListener: SIGNED_IN - AAL1 with verified factors. MFA challenge might be next.");
                }
              } else {
                console.warn("AuthListener: SIGNED_IN but profile not found for user:", authUser.id, ". Logging out.");
                await performLogout();
              }
            } else {
              console.warn("AuthListener: SIGNED_IN event but no session.user. Logging out.");
              await performLogout();
            }
            break;

          case 'SIGNED_OUT':
            console.log("AuthListener: SIGNED_OUT event. Performing logout.");
            await performLogout();
            break;

          case 'TOKEN_REFRESHED':
            console.log("AuthListener: TOKEN_REFRESHED event.");
            if (session && session.user) {
              await refreshUserProfile(); 
            } else {
              console.warn("AuthListener: TOKEN_REFRESHED but no session or user. Logging out.");
              await performLogout();
            }
            break;

          case 'USER_UPDATED':
            console.log("AuthListener: USER_UPDATED event.");
            if (session && session.user) {
              await refreshUserProfile();
            }
            break;
          
          case 'PASSWORD_RECOVERY':
            console.log("AuthListener: PASSWORD_RECOVERY event. User may need to re-authenticate.");
            break;

          case 'MFA_CHALLENGE_VERIFIED':
            console.log("AuthListener: MFA_CHALLENGE_VERIFIED event. Session AAL should be aal2.");
            if (session && session.user && session.user.aal === 'aal2') {
              const profile = await fetchUserProfile(session.user.id);
              if (profile) {
                setUser(profile);
                saveToLocalStorage(STORAGE_KEYS.CURRENT_USER, profile);
                removeFromLocalStorage(STORAGE_KEYS.MFA_CHALLENGE);
                setMfaChallenge(null);
                console.log("AuthListener: MFA_CHALLENGE_VERIFIED - Profile loaded, AAL is aal2.");
              } else {
                 console.warn("AuthListener: MFA_CHALLENGE_VERIFIED, but profile not found for user:", session.user.id, ". Logging out.");
                 await performLogout();
              }
            } else {
               console.warn("AuthListener: MFA_CHALLENGE_VERIFIED, but session.user.aal is not aal2 or session/user is missing. Session:", session);
               
               if (session && session.user) {
                  console.log("AuthListener: Attempting to refresh profile anyway after MFA_CHALLENGE_VERIFIED despite AAL mismatch warning.");
                  await refreshUserProfile();
               } else {
                  await performLogout();
               }
            }
            break;

          default:
            console.log("AuthListener: Unhandled auth event:", event);
        }
      });
      return authListener;
    };
  