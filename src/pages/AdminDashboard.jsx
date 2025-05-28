
    import React from 'react';
    import { useAuth } from '@/contexts/AuthContext';
    import { useLanguage } from '@/contexts/LanguageContext';
    import { useToast } from '@/components/ui/use-toast';
    import { useAdminData } from '@/hooks/useAdminData';
    import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout';
    import AccessDeniedMessage from '@/components/admin/dashboard/AccessDeniedMessage';
    import LoadingSpinner from '@/components/ui/LoadingSpinner';
    import { motion } from 'framer-motion';
    import AdminDataLoadingError from '@/components/admin/dashboard/AdminDataLoadingError';
    import AdminInitialLoading from '@/components/admin/dashboard/AdminInitialLoading';

    const AdminDashboard = () => {
      const { user, loading: authLoading } = useAuth();
      const { t } = useLanguage();
      const { toast } = useToast();
      
      const { 
        adminData, 
        loading: dataLoading, 
        error: dataError, 
        fetchAllData, 
        handleApprovePayment, 
        handleRejectPayment,
        updateWithdrawalStatusInUsers,
        updateProjections,
        updateNews,
        setAdminData 
      } = useAdminData();

      if (authLoading) {
        return <AdminInitialLoading t={t} messageKey="loading_app" />;
      }

      if (!user || user.role !== 'admin') {
        return <AccessDeniedMessage t={t} />;
      }

      // Show loading spinner if data is loading and there are no users yet (initial load)
      if (dataLoading && (!adminData.users || adminData.users.length === 0)) {
        return <AdminInitialLoading t={t} messageKey="admin_dashboard_loading_data" defaultMessage="Loading dashboard data..." />;
      }

      if (dataError) {
        return <AdminDataLoadingError t={t} error={dataError} />;
      }
      
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

    export default AdminDashboard;
  