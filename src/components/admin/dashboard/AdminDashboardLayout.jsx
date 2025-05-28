
    import React from 'react';
    import { motion } from 'framer-motion';
    import AdminTabs from '@/components/admin/AdminTabs';
    import UsersManager from '@/components/admin/UsersManager';
    import { ProjectionsManager } from '@/components/admin/ProjectionsManager';
    import { NewsManager } from '@/components/admin/NewsManager';
    import { PaymentsManager } from '@/components/admin/PaymentsManager';
    import { WithdrawalsManager } from '@/components/admin/WithdrawalsManager';
    import { SupportMessagesManager } from '@/components/admin/SupportMessagesManager';

    const AdminDashboardLayout = ({ t, adminData, toast }) => {
      const tabComponents = {
        users: <UsersManager users={adminData.users || []} setUsers={adminData.setUsers} t={t} toast={toast} />,
        projections: <ProjectionsManager projections={adminData.projections || []} updateProjections={adminData.updateProjections} toast={toast} />,
        news: <NewsManager newsItems={adminData.newsItems || []} updateNews={adminData.updateNews} toast={toast} />,
        payments: <PaymentsManager payments={adminData.payments || []} onApprove={adminData.handleApprovePayment} onReject={adminData.handleRejectPayment} />,
        withdrawals: <WithdrawalsManager 
                        toast={toast} 
                        updateUserWithdrawalStatus={adminData.updateWithdrawalStatusInUsers}
                      />,
        support: <SupportMessagesManager />,
      };

      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="container mx-auto px-2 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 sm:mb-8 md:mb-10 text-center bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 text-transparent bg-clip-text pb-2">
            {t('admin_dashboard_title')}
          </h1>
          <AdminTabs t={t} tabComponents={tabComponents} />
        </motion.div>
      );
    };

    export default AdminDashboardLayout;
  