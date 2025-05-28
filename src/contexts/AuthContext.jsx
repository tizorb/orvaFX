
    import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
    import { useLanguage } from '@/contexts/LanguageContext';
    import { supabase } from '@/lib/supabaseClient';
    import { 
      loadInitialSession, 
      setupAuthListener,
      signUpWithEmailPassword,
      signInWithIdentifierPassword,
      signOutCurrentSession,
      enrollNewMfaFactor,
      createMfaChallenge,
      verifyMfaChallenge,
      unenrollMfaFactor,
      listUserMfaFactors,
      updateUserSubscriptionInSupabase,
      requestWithdrawalInSupabase,
      applyReferralCodeInSupabase,
      fetchUserProfile as fetchUserProfileUtil, 
      waitForPublicProfile, 
      purchasePlanRequest
    } from '@/contexts/authUtils';
    import { checkAndUpdateSubscriptionStatus } from '@/contexts/subscriptionUtils';
    import useSubscriptionManagement from '@/hooks/useSubscriptionManagement';
    import { STORAGE_KEYS } from '@/lib/authConstants';
    import { saveToLocalStorage, removeFromLocalStorage, getFromLocalStorage } from '@/lib/localStorageUtils';

    const AuthContext = createContext(null);

    const useAuthEffectsInternal = (setLoading, setUser, setMfaChallenge, performLogoutInternal, refreshUserProfileInternal) => {
      useEffect(() => {
        let isMounted = true;

        const performLoadInitialSession = async () => {
          if (isMounted) setLoading(true);
          console.log("AuthContext Effect: Calling loadInitialSession");
          await loadInitialSession(
            (newLoading) => { if (isMounted) setLoading(newLoading); }, 
            (newUser) => { if (isMounted) setUser(newUser); }, 
            (newMfaChallenge) => { if (isMounted) setMfaChallenge(newMfaChallenge); },
            performLogoutInternal 
          );
          if (isMounted) setLoading(false); 
        };
        
        performLoadInitialSession();
        
        const { data: authSubscription } = setupAuthListener(
            (newUser) => { if (isMounted) setUser(newUser); }, 
            (newMfaChallenge) => { if (isMounted) setMfaChallenge(newMfaChallenge); },
            performLogoutInternal,
            refreshUserProfileInternal
        );
        
        return () => {
          isMounted = false;
          if (authSubscription && typeof authSubscription.unsubscribe === 'function') {
            authSubscription.unsubscribe();
          }
        };
      }, [setLoading, setUser, setMfaChallenge, performLogoutInternal, refreshUserProfileInternal]);
    };

    const useAuthUserActionsInternal = (setLoading, setUser, setMfaChallenge, t) => {
      const loginUser = useCallback(async (identifier, password) => {
        setLoading(true);
        setMfaChallenge(null);
        removeFromLocalStorage(STORAGE_KEYS.MFA_CHALLENGE);
        const result = await signInWithIdentifierPassword(identifier, password, t);
        if (result.success && result.profile) {
          setUser(result.profile);
          saveToLocalStorage(STORAGE_KEYS.CURRENT_USER, result.profile);
        } else if (result.mfaRequired && result.aal2) {
          const mfaData = { factorId: result.factorId, aal2: result.aal2, userId: result.userId };
          setMfaChallenge(mfaData);
          saveToLocalStorage(STORAGE_KEYS.MFA_CHALLENGE, mfaData);
          setUser(null); 
          removeFromLocalStorage(STORAGE_KEYS.CURRENT_USER);
        } else {
          setUser(null);
          removeFromLocalStorage(STORAGE_KEYS.CURRENT_USER);
        }
        setLoading(false);
        return result;
      }, [setLoading, setUser, setMfaChallenge, t]);

      const registerUser = useCallback(async (username, email, password, referralCodeInput = null, role = 'user') => {
        setLoading(true);
        setMfaChallenge(null);
        removeFromLocalStorage(STORAGE_KEYS.MFA_CHALLENGE);
        const result = await signUpWithEmailPassword(username, email, password, referralCodeInput, role, t);
        if (result.success && result.profile) {
          setUser(result.profile);
          saveToLocalStorage(STORAGE_KEYS.CURRENT_USER, result.profile);
        } else {
           setUser(null);
           removeFromLocalStorage(STORAGE_KEYS.CURRENT_USER);
        }
        setLoading(false);
        return result;
      }, [setLoading, setUser, setMfaChallenge, t]);
      
      return { loginUser, registerUser };
    };
    
    const useAuthProfileActionsInternal = (setLoading, setUser, t) => {
       const updateUserSubscriptionCtx = useCallback(async (userId, subscriptionTier, isSubscribed, subscriptionEndDate) => {
        setLoading(true);
        const result = await updateUserSubscriptionInSupabase(userId, subscriptionTier, isSubscribed, subscriptionEndDate);
        if (result.success && result.updatedProfile) {
          setUser(prevUser => {
            if (prevUser?.id === userId || prevUser?.auth_user_id === userId) {
              const updatedUser = { ...prevUser, ...result.updatedProfile };
              saveToLocalStorage(STORAGE_KEYS.CURRENT_USER, updatedUser);
              return updatedUser;
            }
            return prevUser;
          });
        }
        setLoading(false);
        return result;
      }, [setLoading, setUser]);

      const requestWithdrawalCtx = useCallback(async (userId, amount, walletAddress) => {
        setLoading(true);
        const result = await requestWithdrawalInSupabase(userId, amount, walletAddress, t);
        if (result.success && result.updatedProfile) {
          setUser(prevUser => {
            if (prevUser?.id === userId || prevUser?.auth_user_id === userId) {
              const updatedUser = { ...prevUser, ...result.updatedProfile };
              saveToLocalStorage(STORAGE_KEYS.CURRENT_USER, updatedUser);
              return updatedUser;
            }
            return prevUser;
          });
        }
        setLoading(false);
        return result;
      }, [setLoading, setUser, t]);
      
      const addReferralCodeToExistingUserCtx = useCallback(async (userId, referralCodeInput) => {
        setLoading(true);
        const result = await applyReferralCodeInSupabase(userId, referralCodeInput, t);
         if (result.success && result.updatedProfile) {
          setUser(prevUser => {
            if (prevUser?.id === userId || prevUser?.auth_user_id === userId) {
              const updatedUser = { ...prevUser, ...result.updatedProfile };
              saveToLocalStorage(STORAGE_KEYS.CURRENT_USER, updatedUser);
              return updatedUser;
            }
            return prevUser;
          });
        }
        setLoading(false);
        return result;
      }, [setLoading, setUser, t]);

      const purchasePlanCtx = useCallback(async (userId, username, email, subscriptionTier, amount, transactionHash, paymentProofUrl) => {
        setLoading(true);
        const result = await purchasePlanRequest(userId, username, email, subscriptionTier, amount, transactionHash, paymentProofUrl, t);
        setLoading(false);
        return result;
      }, [setLoading, t]);

      return { updateUserSubscriptionCtx, requestWithdrawalCtx, addReferralCodeToExistingUserCtx, purchasePlanCtx };
    };

    const useAuthMfaActionsInternal = (setLoading, setMfaChallenge, t, refreshUserProfileInternal) => {
      const enrollMfa = useCallback(async () => {
        setLoading(true);
        const result = await enrollNewMfaFactor(t);
        setLoading(false);
        return result;
      }, [setLoading, t]);

      const challengeAndVerifyMfa = useCallback(async (factorId, code) => {
        setLoading(true);
        const challengeResult = await createMfaChallenge(factorId, t);
        if (!challengeResult.success) {
          setLoading(false);
          return challengeResult;
        }
        
        const verifyResult = await verifyMfaChallenge(factorId, challengeResult.challengeId, code, t);
        if (verifyResult.success) {
          setMfaChallenge(null);
          removeFromLocalStorage(STORAGE_KEYS.MFA_CHALLENGE);
          await refreshUserProfileInternal(); 
        }
        setLoading(false);
        return verifyResult;
      }, [setLoading, setMfaChallenge, t, refreshUserProfileInternal]);
      
      const unenrollMfa = useCallback(async (factorId) => {
        setLoading(true);
        const result = await unenrollMfaFactor(factorId, t);
        if (result.success) {
          await refreshUserProfileInternal();
        }
        setLoading(false);
        return result;
      }, [setLoading, t, refreshUserProfileInternal]);

      const listMfaFactors = useCallback(async () => {
        setLoading(true);
        const result = await listUserMfaFactors(t);
        setLoading(false);
        return result;
      }, [setLoading, t]);

      return { enrollMfa, challengeAndVerifyMfa, unenrollMfa, listMfaFactors };
    };


    export const AuthProvider = ({ children }) => {
      const [user, setUser] = useState(() => getFromLocalStorage(STORAGE_KEYS.CURRENT_USER));
      const [loading, setLoading] = useState(true);
      const [mfaChallenge, setMfaChallenge] = useState(() => getFromLocalStorage(STORAGE_KEYS.MFA_CHALLENGE));
      const { t } = useLanguage();
      
      const performLogoutInternal = useCallback(async (doNotSetLoading = false) => {
        console.log("AuthContext: performLogoutInternal called. doNotSetLoading:", doNotSetLoading);
        if (!doNotSetLoading) setLoading(true);
        await signOutCurrentSession();
        setUser(null);
        setMfaChallenge(null);
        removeFromLocalStorage(STORAGE_KEYS.CURRENT_USER);
        removeFromLocalStorage(STORAGE_KEYS.MFA_CHALLENGE);
        if (!doNotSetLoading) setLoading(false);
      }, [setLoading, setUser, setMfaChallenge]);
      
      const refreshUserProfileInternal = useCallback(async () => {
        console.log("AuthContext: refreshUserProfileInternal called.");
        let authIdToFetch = user?.auth_user_id;
        
        if (!authIdToFetch) {
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !sessionData?.session?.user) {
              console.error("AuthContext Refresh: Error getting session or no user in session:", sessionError?.message);
              await performLogoutInternal(true); 
              return;
            }
            authIdToFetch = sessionData.session.user.id;
            console.log("AuthContext Refresh: Fetched auth_user_id from current session:", authIdToFetch);
        } else {
            console.log("AuthContext Refresh: Using auth_user_id from current user state:", authIdToFetch);
        }
        
        if (authIdToFetch) { 
          setLoading(true);
          const profile = await fetchUserProfileUtil(authIdToFetch);
          if (profile) {
            setUser(profile);
            saveToLocalStorage(STORAGE_KEYS.CURRENT_USER, profile);
            console.log("AuthContext Refresh: Profile refreshed and saved for", authIdToFetch);
          } else {
            console.warn("AuthContext Refresh: Profile not found for auth_user_id:", authIdToFetch, ". Logging out.");
            await performLogoutInternal(true);
          }
          setLoading(false);
        } else {
           console.warn("AuthContext Refresh: No auth_user_id found. Current user state might be stale or session is invalid. Logging out.");
           await performLogoutInternal(true);
        }
      }, [user?.auth_user_id, performLogoutInternal, setLoading, setUser]);

      useAuthEffectsInternal(setLoading, setUser, setMfaChallenge, performLogoutInternal, refreshUserProfileInternal);
      
      const userActions = useAuthUserActionsInternal(setLoading, setUser, setMfaChallenge, t);
      const profileActions = useAuthProfileActionsInternal(setLoading, setUser, t);
      const mfaActions = useAuthMfaActionsInternal(setLoading, setMfaChallenge, t, refreshUserProfileInternal);
      
      useSubscriptionManagement(loading, user, profileActions.updateUserSubscriptionCtx, checkAndUpdateSubscriptionStatus);

      return (
        <AuthContext.Provider value={{ 
          user, 
          login: userActions.loginUser, 
          register: userActions.registerUser, 
          logout: performLogoutInternal, 
          updateUserSubscription: profileActions.updateUserSubscriptionCtx, 
          loading, 
          requestWithdrawal: profileActions.requestWithdrawalCtx, 
          addReferralCodeToExistingUser: profileActions.addReferralCodeToExistingUserCtx, 
          purchasePlan: profileActions.purchasePlanCtx,
          setUser, 
          refreshUserProfile: refreshUserProfileInternal,
          mfaChallenge,
          setMfaChallenge,
          enrollMfa: mfaActions.enrollMfa,
          challengeAndVerifyMfa: mfaActions.challengeAndVerifyMfa,
          unenrollMfa: mfaActions.unenrollMfa,
          listMfaFactors: mfaActions.listMfaFactors
        }}>
          {children}
        </AuthContext.Provider>
      );
    };

    export const useAuth = () => {
      const context = useContext(AuthContext);
      if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
      }
      return context;
    };
  