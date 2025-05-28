
    import React from 'react';
    import { useAuth } from '@/contexts/AuthContext';
    import { useLanguage } from '@/contexts/LanguageContext';
    import { useToast } from '@/components/ui/use-toast';
    import { useAdminData } from '@/hooks/useAdminData';
    import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout';
    import AccessDeniedMessage from '@/components/admin/dashboard/AccessDeniedMessage';
    import AdminDataLoadingError from '@/components/admin/dashboard/AdminDataLoadingError';
    import AdminInitialLoading from '@/components/admin/dashboard/AdminInitialLoading';

    const AdminDashboardContent = ({ t, adminDataHook, toast }) => {
      const { 
        adminData,
        loading: dataLoading, 
        handleApprovePayment, 
        handleRejectPayment,
        updateWithdrawalStatusInUsers,
        updateProjections,
        updateNews,
        setAdminData,
        fetchAllData 
      } = adminDataHook;

      const combinedAdminData = {
        ...adminData,
        loading: dataLoading,
        setAdminData, 
        handleApprovePayment,
        handleRejectPayment,
        updateWithdrawalStatusInUsers,
        updateProjections,
        updateNews
      };
      
      return (
        <AdminDashboardLayout 
          t={t} 
          adminData={combinedAdminData} 
          toast={toast}
          fetchAllAdminData={fetchAllData} 
        />
      );
    };

    const AdminDashboardPage = () => {
      const { user, loading: authLoading } = useAuth();
      const { t } = useLanguage();
      const { toast } = useToast();
      
      const adminDataHook = useAdminData();
      const { adminData, loading: dataLoading, error: dataError } = adminDataHook;

      if (authLoading) {
        return <AdminInitialLoading t={t} messageKey="loading_app" />;
      }

      if (!user || user.role !== 'admin') {
        return <AccessDeniedMessage t={t} />;
      }

      if (dataLoading && (!adminData.users || adminData.users.length === 0) && (!adminData.pendingPayments || adminData.pendingPayments.length === 0)) {
        return <AdminInitialLoading t={t} messageKey="admin_dashboard_loading_data" defaultMessage="Loading dashboard data..." />;
      }

      if (dataError) {
        return <AdminDataLoadingError t={t} error={dataError} />;
      }
      
      return (
        <AdminDashboardContent
          t={t}
          adminDataHook={adminDataHook}
          toast={toast}
        />
      );
    };

    export default AdminDashboardPage;
  