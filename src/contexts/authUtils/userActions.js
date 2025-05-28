
    import { supabase } from '@/lib/supabaseClient';
    import { fetchUserProfile } from './userProfile';
    import { applyReferralCodeToExistingUser } from './referralUtils';

    export const updateUserSubscriptionInSupabase = async (userId, subscriptionTier, isSubscribed, subscriptionEndDate) => {
      try {
        const { data, error } = await supabase
          .from('users')
          .update({ 
            subscription_tier: subscriptionTier,
            is_subscribed: isSubscribed,
            subscription_end_date: subscriptionEndDate 
          })
          .eq('id', userId)
          .select()
          .single();

        if (error) {
          console.error('Error updating user subscription:', error);
          return { success: false, message: error.message };
        }
        return { success: true, updatedProfile: data };
      } catch (e) {
        console.error('Exception in updateUserSubscriptionInSupabase:', e);
        return { success: false, message: "An unexpected error occurred while updating subscription." };
      }
    };

    export const requestWithdrawalInSupabase = async (userId, amount, walletAddress, t) => {
      try {
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('wallet_balance_usdt')
          .eq('id', userId)
          .single();

        if (profileError || !userProfile) {
          console.error('Error fetching user profile for withdrawal:', profileError);
          return { success: false, message: t('withdrawal_error_user_not_found') };
        }

        if (userProfile.wallet_balance_usdt < amount) {
          return { success: false, message: t('withdrawal_error_insufficient_funds') };
        }
        
        const { data: withdrawalRequest, error: withdrawalError } = await supabase
          .from('withdrawal_requests')
          .insert({
            user_id: userId,
            amount: amount,
            wallet_address: walletAddress,
            currency: 'USDT', 
            status: 'pending'
          })
          .select()
          .single();

        if (withdrawalError) {
          console.error('Error creating withdrawal request:', withdrawalError);
          return { success: false, message: t('withdrawal_error_request_failed') };
        }
        
        const newBalance = userProfile.wallet_balance_usdt - parseFloat(amount);
        const { data: updatedProfile, error: updateError } = await supabase
          .from('users')
          .update({ wallet_balance_usdt: newBalance })
          .eq('id', userId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating user balance after withdrawal request:', updateError);
        }

        return { success: true, message: t('withdrawal_success_message'), withdrawalRequest, updatedProfile };

      } catch (e) {
        console.error('Exception in requestWithdrawalInSupabase:', e);
        return { success: false, message: t('withdrawal_error_generic') };
      }
    };

    export const applyReferralCodeInSupabase = async (userId, referralCodeInput, t) => {
      return await applyReferralCodeToExistingUser(userId, referralCodeInput, t);
    };
  