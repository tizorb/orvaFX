
    import { useEffect, useCallback } from 'react';
    import { supabase, checkSupabaseConnection } from '@/lib/supabaseClient';
    import { fetchUserProfile } from '@/contexts/authUtils';
    import { STORAGE_KEYS } from '@/lib/authConstants';
    import { saveToLocalStorage, loadFromLocalStorage } from '@/lib/localStorageUtils';


    const useAuthInitialization = (setLoading, setUser) => {
       const initializeAuth = useCallback(async () => {
        setLoading(true);
        if (!checkSupabaseConnection()) {
          console.error("Supabase connection failed. Auth initialization skipped.");
          const localUser = loadFromLocalStorage(STORAGE_KEYS.CURRENT_USER);
          if (localUser) setUser(localUser);
          setLoading(false);
          return;
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Error getting session during init:', sessionError);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          if (profile) {
            setUser(profile);
            saveToLocalStorage(STORAGE_KEYS.CURRENT_USER, profile);
          } else {
            console.warn("User session found, but no public profile. Logging out.");
            await supabase.auth.signOut();
            setUser(null);
            saveToLocalStorage(STORAGE_KEYS.CURRENT_USER, null);
          }
        } else {
          setUser(null);
          saveToLocalStorage(STORAGE_KEYS.CURRENT_USER, null);
        }
        setLoading(false);
      }, [setLoading, setUser]);


      useEffect(() => {
        initializeAuth();
      }, [initializeAuth]);
    };

    export default useAuthInitialization;
  