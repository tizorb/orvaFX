
    import { supabase } from '@/lib/supabaseClient';

    export const handleWithdrawalRequest = async (userId, amount, walletAddress, t) => {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('wallet_balance_usdt, last_withdrawal_date')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        return { success: false, message: t('profile_withdrawal_error_user_not_found') };
      }

      if (user.wallet_balance_usdt < amount) {
        return { success: false, message: t('profile_withdrawal_error_insufficient_funds') };
      }

      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (user.last_withdrawal_date && new Date(user.last_withdrawal_date) > twentyFourHoursAgo) {
        return { success: false, message: t('profile_withdrawal_error_24h_limit') };
      }

      const { data: withdrawalRequest, error: insertError } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: userId,
          amount: amount,
          wallet_address: walletAddress,
          status: 'pending_admin_approval'
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating withdrawal request in DB:', insertError);
        return { success: false, message: t('profile_withdrawal_error_generic') };
      }

      const newBalance = user.wallet_balance_usdt - amount;
      const { data: updatedProfile, error: updateError } = await supabase
        .from('users')
        .update({ wallet_balance_usdt: newBalance, last_withdrawal_date: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      
      if (updateError) {
         console.error('Error updating user balance after withdrawal request in DB:', updateError);
      }

      return { success: true, message: t('profile_withdrawal_success_message'), withdrawalRequest, user: updatedProfile };
    };
  