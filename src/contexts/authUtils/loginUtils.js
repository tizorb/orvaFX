
    import { supabase } from '@/lib/supabaseClient';
    import { fetchUserProfile } from './userProfile';

    export const handleUserLogin = async (identifier, password) => {
      
      let emailToTry = identifier;

      if (!identifier.includes('@')) {
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('email')
          .eq('username', identifier)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile by username for login:', profileError);
          return { success: false, message: "Error looking up user." };
        }
        if (!userProfile || !userProfile.email) {
          return { success: false, message: "Invalid username or no email associated." };
        }
        emailToTry = userProfile.email;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToTry,
        password,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        if (profile) {
          return { success: true, user: data.user, profile: profile }; 
        } else {
          await supabase.auth.signOut(); 
          return { success: false, message: "Login successful but public profile not found." };
        }
      }
      return { success: false, message: "An unknown error occurred during login." };
    };
  