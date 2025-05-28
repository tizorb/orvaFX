
    import { createClient } from '@supabase/supabase-js';

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iadsmjdstxdncqvqdtny.supabase.co';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZHNtamRzdHhkbmNxdnFkdG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyOTI0NjcsImV4cCI6MjA2Mjg2ODQ2N30.WaMxDdtZpR44m9mr48V-BrxbUNKw0d11G84Aj38GCJA';

    export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });

    export const checkSupabaseConnection = async () => {
      if (!supabase) {
        console.warn("Supabase client is not initialized.");
        return false;
      }
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Supabase connection check failed (auth.getSession):", error.message);
          return false;
        }
        console.log("Supabase connection/auth service check successful.");
        return true;
      } catch (e) {
        console.error("Exception during Supabase connection check:", e);
        return false;
      }
    };
  