
    import { useState, useEffect, useCallback } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import { 
      fetchPendingPaymentRequests, 
      fetchProcessedPaymentRequests,
      approveSubscriptionPayment,
      rejectSubscriptionPayment
    } from '@/contexts/authUtils/paymentUtils';
    import { useToast } from '@/components/ui/use-toast';
    import { useLanguage } from '@/contexts/LanguageContext';

    export const useAdminData = () => {
      const { t } = useLanguage();
      const { toast } = useToast();
      const [adminData, setAdminData] = useState({
        users: [],
        projections: [],
        news: [],
        payments: [],
        pendingPayments: [],
        processedPayments: [],
        withdrawals: [],
        supportMessages: [],
        loading: true,
      });
      const [error, setError] = useState(null);

      const fetchData = useCallback(async (tableName, selectQuery = '*') => {
        const { data, error } = await supabase.from(tableName).select(selectQuery).order('created_at', { ascending: false });
        if (error) {
          console.error(`Error fetching ${tableName}:`, error);
          throw error;
        }
        return data;
      }, []);

      const fetchAllAdminData = useCallback(async () => {
        setAdminData(prev => ({ ...prev, loading: true }));
        setError(null);
        try {
          const [
            users, 
            projections, 
            news, 
            rawPayments, 
            withdrawals, 
            supportMessages,
            pendingPaymentsResult,
            processedPaymentsResult
          ] = await Promise.all([
            fetchData('users', '*, approved_by:users!users_approved_by_fkey(username), referred_by_user:users!users_referred_by_fkey(username)'),
            fetchData('projections', '*, user:users(username, email)'),
            fetchData('news_items', '*, user:users(username, email)'),
            fetchData('payments', '*, user:users(username, email), approved_by_user:users!payments_approved_by_fkey(username), processed_by_user:users!payments_processed_by_fkey(username)'),
            fetchData('withdrawal_requests', '*, user:users(username, email), processed_by_user:users!withdrawal_requests_processed_by_fkey(username)'),
            fetchData('support_messages', '*, user:users(username, email), responded_by_user:users!support_messages_responded_by_fkey(username)'),
            fetchPendingPaymentRequests(),
            fetchProcessedPaymentRequests()
          ]);

          setAdminData({
            users: users || [],
            projections: projections || [],
            news: news || [],
            payments: rawPayments || [],
            pendingPayments: pendingPaymentsResult.success ? pendingPaymentsResult.data : [],
            processedPayments: processedPaymentsResult.success ? processedPaymentsResult.data : [],
            withdrawals: withdrawals || [],
            supportMessages: supportMessages || [],
            loading: false,
          });
        } catch (err) {
          console.error("Failed to fetch all admin data:", err);
          setError(err);
          setAdminData(prev => ({ ...prev, loading: false }));
          toast({
            title: t('admin_toast_error_data_fetch_title'),
            description: t('admin_toast_error_data_fetch_desc') + ` ${err.message}`,
            variant: "destructive",
          });
        }
      }, [fetchData, t, toast]);

      useEffect(() => {
        fetchAllAdminData();
      }, [fetchAllAdminData]);
      
      const handleApprovePayment = async (paymentId) => {
        const { data: adminUser } = await supabase.auth.getUser();
        if (!adminUser.user) {
            toast({ title: t('admin_toast_error_generic_title'), description: t('admin_error_no_admin_user'), variant: "destructive" });
            return { success: false, message: t('admin_error_no_admin_user') };
        }
        const result = await approveSubscriptionPayment(paymentId, adminUser.user.id, t);
        if (result.success) {
          toast({ title: t('admin_toast_success_payment_approved_title'), description: result.message });
          fetchAllAdminData(); 
        } else {
          toast({ title: t('admin_toast_error_payment_approved_title'), description: result.message, variant: "destructive" });
        }
        return result;
      };

      const handleRejectPayment = async (paymentId, adminNotes = '') => {
        const { data: adminUser } = await supabase.auth.getUser();
         if (!adminUser.user) {
            toast({ title: t('admin_toast_error_generic_title'), description: t('admin_error_no_admin_user'), variant: "destructive" });
            return { success: false, message: t('admin_error_no_admin_user') };
        }
        const result = await rejectSubscriptionPayment(paymentId, adminUser.user.id, adminNotes, t);
        if (result.success) {
          toast({ title: t('admin_toast_success_payment_rejected_title'), description: result.message });
          fetchAllAdminData();
        } else {
          toast({ title: t('admin_toast_error_payment_rejected_title'), description: result.message, variant: "destructive" });
        }
        return result;
      };
      
      const updateWithdrawalStatusInUsers = async (withdrawalId, userId, status, adminNotes = '') => {
        try {
          const { data: adminUser } = await supabase.auth.getUser();
          if (!adminUser.user) throw new Error("Admin user not found");

          const { error: updateError } = await supabase
            .from('withdrawal_requests')
            .update({ 
              status: status, 
              processed_by: adminUser.user.id, 
              updated_at: new Date().toISOString(),
              notes: adminNotes
            })
            .eq('id', withdrawalId);

          if (updateError) throw updateError;
          
          toast({
            title: t('admin_toast_success_withdrawal_updated_title'),
            description: t('admin_toast_success_withdrawal_updated_desc', { withdrawalId, status }),
          });
          fetchAllAdminData();
        } catch (error) {
          console.error('Error updating withdrawal status:', error);
          toast({
            title: t('admin_toast_error_withdrawal_updated_title'),
            description: t('admin_toast_error_withdrawal_updated_desc', { error: error.message }),
            variant: "destructive",
          });
        }
      };

      const updateProjections = async (updatedProjections) => {
        setAdminData(prev => ({ ...prev, projections: updatedProjections, loading: true }));
        try {
          const { error } = await supabase.from('projections').upsert(updatedProjections);
          if (error) throw error;
          toast({ title: t('admin_toast_success_projections_updated_title') });
        } catch (err) {
          console.error("Error updating projections:", err);
          toast({ title: t('admin_toast_error_projections_updated_title'), description: err.message, variant: "destructive" });
        } finally {
          fetchAllAdminData();
        }
      };

      const updateNews = async (updatedNews) => {
        setAdminData(prev => ({ ...prev, news: updatedNews, loading: true }));
        try {
          const { error } = await supabase.from('news_items').upsert(updatedNews);
          if (error) throw error;
          toast({ title: t('admin_toast_success_news_updated_title') });
        } catch (err) {
          console.error("Error updating news:", err);
          toast({ title: t('admin_toast_error_news_updated_title'), description: err.message, variant: "destructive" });
        } finally {
          fetchAllAdminData();
        }
      };


      return { adminData, loading: adminData.loading, error, fetchAllAdminData, handleApprovePayment, handleRejectPayment, updateWithdrawalStatusInUsers, updateProjections, updateNews, setAdminData };
    };
  