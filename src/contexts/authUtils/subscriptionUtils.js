
    import { supabase } from '@/lib/supabaseClient';

    export const handleUserSubscriptionUpdate = async (userId, subscriptionTier, isSubscribed, subscriptionEndDate) => {
      const { data: updatedProfile, error } = await supabase
        .from('users')
        .update({
          is_subscribed: isSubscribed,
          subscription_tier: subscriptionTier,
          subscription_end_date: isSubscribed ? subscriptionEndDate : null,
        })
        .eq('id', userId) 
        .select()
        .single();

      if (error) {
        console.error('Error updating user subscription in DB:', error);
        return { success: false, message: error.message };
      }
      
      if (isSubscribed && updatedProfile) {
        const { data: paymentDetails, error: paymentError } = await supabase
          .from('payments')
          .select('amount, id')
          .eq('user_id', userId)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (paymentError) console.error("Error fetching payment for commission: ", paymentError);

        if (paymentDetails && paymentDetails.amount && updatedProfile.referred_by) {
          const commissionRate = 0.10;
          const commissionAmount = parseFloat(paymentDetails.amount) * commissionRate;
          
          const { error: rpcError } = await supabase.rpc('add_referral_commission', {
            p_referrer_id: updatedProfile.referred_by,
            p_commission_amount: commissionAmount
          });

          if (rpcError) {
            console.error('Error calling add_referral_commission RPC:', rpcError);
          } else {
            await supabase
              .from('referral_logs')
              .update({ commission_applied: true, commission_amount: commissionAmount, subscription_payment_id: paymentDetails.id })
              .eq('referred_user_id', userId)
              .eq('commission_applied', false);
          }
        }
      }
      return { success: true, user: updatedProfile };
    };
  