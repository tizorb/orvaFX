
    import { supabase } from '@/lib/supabaseClient';

    export const purchasePlanRequest = async (userId, username, email, subscriptionTier, amount, transactionHash, paymentProofUrl, t) => {
      try {
        if (!userId || !subscriptionTier || !amount || !transactionHash) {
          console.error('Missing required fields for payment request.');
          return { success: false, message: t?.('payment_request_error_missing_fields') || 'Missing required fields for payment request.' };
        }

        const { data, error } = await supabase
          .from('payments')
          .insert({
            user_id: userId,
            username: username,
            email: email,
            tier: subscriptionTier,
            amount: amount,
            tx_hash: transactionHash,
            payment_proof_url: paymentProofUrl, 
            status: 'pending_approval', 
            currency: 'USDT',
            payment_method: 'TRC20',
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating payment request:', error);
          let userMessage = t?.('payment_request_error_generic') || 'Could not process payment request.';
          if (error.message.includes('payment_requests_user_id_fkey')) {
            userMessage = t?.('payment_request_error_user_not_found_db') || 'User not found for payment request.';
          }
          return { success: false, message: userMessage, error };
        }
        
        console.log('Payment request created:', data);
        
        try {
          const { error: functionError } = await supabase.functions.invoke('notify-admin-on-payment-request', {
            body: { 
              requestId: data.id, 
              userId: data.user_id, 
              username: data.username,
              email: data.email,
              subscriptionTier: data.tier, 
              amount: data.amount,
              transactionHash: data.tx_hash
            }
          });
          if (functionError) {
            console.warn('Failed to invoke notify-admin-on-payment-request function:', functionError);
          } else {
            console.log('Admin notification function invoked successfully for payment request:', data.id);
          }
        } catch (e) {
          console.warn('Exception invoking notify-admin function:', e);
        }

        return { success: true, data };
      } catch (err) {
        console.error('Unexpected error in purchasePlanRequest:', err);
        return { success: false, message: t?.('payment_request_error_unexpected') || 'An unexpected error occurred.', error: err };
      }
    };

    export const fetchPendingPaymentRequests = async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('id, user_id, username, email, tier, amount, status, created_at, tx_hash, payment_proof_url')
        .in('status', ['pending_approval', 'pending']) 
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching pending payment requests:', error);
        return { success: false, data: [], error };
      }
      return { success: true, data };
    };
    
    export const fetchProcessedPaymentRequests = async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('id, user_id, username, email, tier, amount, status, created_at, updated_at, tx_hash, payment_proof_url, approved_by(username)')
        .not('status', 'in', '("pending_approval", "pending")')
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching processed payment requests:', error);
        return { success: false, data: [], error };
      }
      return { success: true, data };
    };


    export const approveSubscriptionPayment = async (paymentId, adminUserId, t) => {
      try {
        const { data: payment, error: fetchError } = await supabase
          .from('payments')
          .select('id, user_id, tier, amount')
          .eq('id', paymentId)
          .single();

        if (fetchError || !payment) {
          console.error('Error fetching payment request for approval:', fetchError);
          return { success: false, message: t?.('payment_approval_error_fetch_request') || 'Could not fetch payment request for approval.' };
        }

        const { error: requestError } = await supabase
          .from('payments')
          .update({ 
            status: 'approved', 
            updated_at: new Date().toISOString(),
            approved_by: adminUserId,
            processed_by: adminUserId 
          })
          .eq('id', paymentId);

        if (requestError) {
          console.error('Error updating payment request status to approved:', requestError);
          return { success: false, message: t?.('payment_approval_error_update_request_status') || 'Failed to update payment request status.' };
        }

        const subscriptionEndDate = new Date();
        if (payment.tier?.toLowerCase().includes('annual') || payment.tier?.toLowerCase().includes('anual')) {
          subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
        } else if (payment.tier?.toLowerCase().includes('monthly') || payment.tier?.toLowerCase().includes('mensual')) {
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
        } else {
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1); 
        }
        
        const { data: updatedUser, error: userError } = await supabase
          .from('users')
          .update({
            is_subscribed: true,
            subscription_tier: payment.tier,
            subscription_end_date: subscriptionEndDate.toISOString(),
          })
          .eq('auth_user_id', payment.user_id)
          .select()
          .single();

        if (userError) {
          console.error('Error activating user subscription:', userError);
          return { success: false, message: t?.('payment_approval_error_activate_subscription') || 'Failed to activate user subscription.' };
        }
        
        if (updatedUser && updatedUser.referred_by) {
          const commissionRate = 0.10; 
          const commissionAmount = parseFloat(payment.amount) * commissionRate;
          
          const { error: rpcError } = await supabase.rpc('add_referral_commission', {
            p_referrer_id: updatedUser.referred_by,
            p_commission_amount: commissionAmount
          });

          if (rpcError) {
            console.error('Error calling add_referral_commission RPC:', rpcError);
          } else {
            await supabase
              .from('referral_logs')
              .update({ 
                commission_applied: true, 
                commission_amount: commissionAmount, 
                subscription_payment_id: payment.id 
              })
              .eq('referred_user_id', updatedUser.id) 
              .is('commission_applied', false); 
          }
        }


        console.log('Payment request approved and user subscription activated:', paymentId, payment.user_id);
        return { success: true, message: t?.('payment_approval_success') || 'Payment approved and subscription activated.', updatedUser };
      } catch (err) {
        console.error('Unexpected error in approveSubscriptionPayment:', err);
        return { success: false, message: t?.('payment_approval_error_unexpected') || 'An unexpected error occurred during approval.' };
      }
    };

    export const rejectSubscriptionPayment = async (paymentId, adminUserId, adminNotes, t) => {
      try {
        const { error } = await supabase
          .from('payments')
          .update({ 
            status: 'rejected', 
            updated_at: new Date().toISOString(),
            approved_by: adminUserId, 
            processed_by: adminUserId,
            notes: adminNotes 
          })
          .eq('id', paymentId);

        if (error) {
          console.error('Error updating payment request status to rejected:', error);
          return { success: false, message: t?.('payment_rejection_error_update_status') || 'Failed to update payment request status to rejected.' };
        }

        console.log('Payment request rejected:', paymentId);
        return { success: true, message: t?.('payment_rejection_success') || 'Payment request rejected.' };
      } catch (err) {
        console.error('Unexpected error in rejectSubscriptionPayment:', err);
        return { success: false, message: t?.('payment_rejection_error_unexpected') || 'An unexpected error occurred during rejection.' };
      }
    };
  