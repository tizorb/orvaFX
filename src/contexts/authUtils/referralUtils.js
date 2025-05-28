
    import { supabase } from '@/lib/supabaseClient';

    export const handleReferralLogic = async (referralCodeInput, userIdForExistingUser = null, t, context = 'signup') => {
      if (!referralCodeInput) {
        return { success: true, referrerId: null }; 
      }

      const { data: referrer, error: referrerError } = await supabase
        .from('users')
        .select('id, referral_code')
        .eq('referral_code', referralCodeInput)
        .maybeSingle();

      if (referrerError && referrerError.code !== 'PGRST116') {
        console.error("Error checking referrer code:", referrerError);
        return { success: false, message: t?.('register_error_generic') || "Error validating referral code." };
      }

      if (!referrer) {
        const messageKey = context === 'signup' ? 'register_error_referral_invalid' : 'profile_referral_error_invalid_code';
        return { success: false, message: t?(messageKey) : "Invalid referral code." };
      }
      
      if (userIdForExistingUser && referrer.id === userIdForExistingUser) {
        return { success: false, message: t?.('profile_referral_error_own_code') || "You cannot use your own referral code." };
      }

      return { success: true, referrerId: referrer.id };
    };


    export const applyReferralCodeToExistingUser = async (userId, referralCodeInput, t) => {
      try {
        const { data: userToUpdate, error: userError } = await supabase
          .from('users')
          .select('referred_by, referral_code')
          .eq('id', userId)
          .single();

        if (userError || !userToUpdate) {
          return { success: false, message: "User not found." };
        }
        if (userToUpdate.referred_by) {
          return { success: false, message: t('profile_referral_error_already_applied') };
        }
        if (userToUpdate.referral_code === referralCodeInput) {
          return { success: false, message: t('profile_referral_error_own_code') };
        }

        const referralResult = await handleReferralLogic(referralCodeInput, userId, t, 'apply_existing');
        if (!referralResult.success) {
          return { success: false, message: referralResult.message };
        }
        const referrerId = referralResult.referrerId;
        
        const { data: updatedProfile, error: updateError } = await supabase
          .from('users')
          .update({ referred_by: referrerId })
          .eq('id', userId)
          .select()
          .single();

        if (updateError) {
          console.error('Error applying referral code:', updateError);
          return { success: false, message: t('profile_referral_error_generic') };
        }

        await supabase.from('referral_logs').insert({
          referrer_id: referrerId,
          referred_user_id: userId,
        });

        return { success: true, message: t('profile_referral_success_message'), updatedProfile };
      } catch (e) {
        console.error('Exception in applyReferralCodeToExistingUser:', e);
        return { success: false, message: t ? t('profile_referral_error_generic') : "An unexpected error occurred while applying referral code." };
      }
    };
  