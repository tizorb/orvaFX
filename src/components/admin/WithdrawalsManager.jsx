
    import React, { useState, useEffect, useCallback } from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
    import { motion } from 'framer-motion';
    import { CheckCircle, XCircle, ListChecks, History, Eye, User, AlertTriangle, SendToBack } from 'lucide-react';
    import { useToast as useShadcnToast } from '@/components/ui/use-toast';
    import { useLanguage } from '@/contexts/LanguageContext';

    const STORAGE_USERS_KEY = 'orvafx_users_v3';

    const loadUsersFromLocalStorage = () => {
      try {
        const item = localStorage.getItem(STORAGE_USERS_KEY);
        return item ? JSON.parse(item) : [];
      } catch (error) {
        console.error("Error loading users from localStorage:", error);
        return [];
      }
    };
    
    const saveUsersToLocalStorage = (users) => {
        try {
            localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
        } catch (error) {
            console.error("Error saving users to localStorage:", error);
        }
    };

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } }
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 15, scale: 0.98 },
      visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 18 } }
    };
    
    export function WithdrawalsManager({ toast: parentToastProp, updateUserWithdrawalStatus }) {
      const [allWithdrawals, setAllWithdrawals] = useState([]);
      const internalToast = useShadcnToast();
      const toast = parentToastProp || internalToast.toast;
      const { t } = useLanguage();


      const fetchWithdrawals = useCallback(() => {
        const users = loadUsersFromLocalStorage();
        const withdrawalsData = users.reduce((acc, user) => {
          if (user.withdrawalHistory && user.withdrawalHistory.length > 0) {
            user.withdrawalHistory.forEach(wh => {
              acc.push({
                ...wh,
                userId: user.id,
                username: user.username,
                withdrawalId: wh.id || `${user.id}_${new Date(wh.date).getTime()}` 
              });
            });
          }
          return acc;
        }, []);
        setAllWithdrawals(withdrawalsData.sort((a, b) => new Date(b.date) - new Date(a.date)));
      }, []);

      useEffect(() => {
        fetchWithdrawals();
      }, [fetchWithdrawals]);

      const handleWithdrawalAction = (userId, withdrawalId, action) => {
        let users = loadUsersFromLocalStorage();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex !== -1) {
          const userToUpdate = { ...users[userIndex] };
          const withdrawalIndex = userToUpdate.withdrawalHistory.findIndex(wh => (wh.id || `${userToUpdate.id}_${new Date(wh.date).getTime()}`) === withdrawalId);

          if (withdrawalIndex !== -1) {
            userToUpdate.withdrawalHistory[withdrawalIndex].status = action;
            
            if (action === 'rejected_insufficient_funds_by_admin') {
              userToUpdate.walletBalanceUSDT = (userToUpdate.walletBalanceUSDT || 0) + userToUpdate.withdrawalHistory[withdrawalIndex].amount;
              userToUpdate.lastWithdrawalDate = null; 
            }
            
            users[userIndex] = userToUpdate;
            saveUsersToLocalStorage(users);

            const currentAuthUser = JSON.parse(localStorage.getItem('orvafx_currentUser_v3'));
            if (currentAuthUser && currentAuthUser.id === userId) {
                localStorage.setItem('orvafx_currentUser_v3', JSON.stringify(userToUpdate));
            }
            
            if(updateUserWithdrawalStatus) {
                updateUserWithdrawalStatus(userId, withdrawalId, action); 
            }
            fetchWithdrawals();
            const actionText = action === 'approved_by_admin' ? t('admin_withdrawals_action_approved') : t('admin_withdrawals_action_rejected');
            const usernameForToast = userToUpdate.username || userId;
            toast({ title: t('general_success_toast_title'), description: t('admin_withdrawals_toast_success_action', { username: usernameForToast, action: actionText }) });
          } else {
            toast({ title: t('general_error_toast_title'), description: t('admin_withdrawals_toast_error_not_found'), variant: "destructive" });
          }
        } else {
          toast({ title: t('general_error_toast_title'), description: t('admin_withdrawals_toast_error_user_not_found'), variant: "destructive" });
        }
      };

      const pendingWithdrawals = allWithdrawals.filter(w => w.status === 'pending_approval');
      const processedWithdrawals = allWithdrawals.filter(w => w.status !== 'pending_approval');

      const getStatusText = (status) => {
        if (status === 'pending_approval') return t('profile_status_pending');
        if (status === 'approved_by_admin' || status === 'approved') return t('profile_status_approved');
        if (status.startsWith('rejected')) return t('profile_status_rejected');
        return status.replace(/_/g, ' ');
      }
      
      return (
        <Card className="bg-slate-800/70 border-slate-700 shadow-xl overflow-hidden rounded-xl">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl font-bold text-sky-400 flex items-center">
              <SendToBack className="mr-2 sm:mr-3 h-6 w-6 sm:h-7 sm:w-7" />
              {t('admin_withdrawals_title')}
            </CardTitle>
            <CardDescription className="text-slate-400 mt-1 text-xs sm:text-sm">{t('admin_withdrawals_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <section>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-sky-300 flex items-center">
                <ListChecks className="mr-2 h-5 w-5 sm:h-6 sm:w-6"/>
                {t('admin_withdrawals_pending_title')}
              </h3>
              {pendingWithdrawals.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8 sm:py-10"
                >
                  <Eye className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-slate-500 mb-3 sm:mb-4" />
                  <p className="text-slate-400 text-base sm:text-lg">{t('admin_withdrawals_no_pending')}</p>
                </motion.div>
              ) : (
                <motion.ul variants={containerVariants} initial="hidden" animate="visible" className="space-y-3 sm:space-y-4">
                  {pendingWithdrawals.map(withdrawal => (
                    <motion.li key={withdrawal.withdrawalId} variants={itemVariants}>
                      <Card className="bg-slate-700/60 border-slate-600/80 shadow-md hover:shadow-sky-500/20 transition-shadow duration-300 rounded-lg">
                        <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                           <CardTitle className="text-base sm:text-lg font-semibold text-sky-300 flex items-center">
                             <User className="w-4 h-4 mr-1.5"/> {t('admin_withdrawals_user_info', { username: withdrawal.username, userId: withdrawal.userId })}
                           </CardTitle>
                          <CardDescription className="text-xs text-slate-400 mt-0.5">
                            {t('admin_withdrawals_request_date_label')}: {new Date(withdrawal.date).toLocaleString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-slate-200 space-y-1 px-3 sm:px-4 pb-2">
                          <p><strong>{t('admin_withdrawals_amount_label')}:</strong> <span className="text-lg font-bold text-green-400">{withdrawal.amount} USDT</span></p>
                        </CardContent>
                        <CardFooter className="flex flex-wrap justify-end gap-2 pt-3 pb-3 px-3 sm:px-4 border-t border-slate-600/50">
                          <Button onClick={() => handleWithdrawalAction(withdrawal.userId, withdrawal.withdrawalId, 'approved_by_admin')} size="sm" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold h-8 px-3 text-xs">
                            <CheckCircle className="mr-1.5 h-4 w-4" /> {t('admin_withdrawals_approve_button')}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleWithdrawalAction(withdrawal.userId, withdrawal.withdrawalId, 'rejected_by_admin')} className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold h-8 px-3 text-xs">
                            <XCircle className="mr-1.5 h-4 w-4" /> {t('admin_withdrawals_reject_button')}
                          </Button>
                           <Button variant="outline" size="sm" onClick={() => handleWithdrawalAction(withdrawal.userId, withdrawal.withdrawalId, 'rejected_insufficient_funds_by_admin')} className="border-amber-500 text-amber-400 hover:bg-amber-500/10 h-8 px-3 text-xs">
                            <AlertTriangle className="mr-1.5 h-4 w-4" /> {t('admin_withdrawals_reject_refund_button')}
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </section>

            <section className="mt-6 sm:mt-8">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-sky-300 flex items-center">
                <History className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                {t('admin_withdrawals_history_title')}
              </h3>
              {processedWithdrawals.length === 0 ? (
                 <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8 sm:py-10"
                >
                  <Eye className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-slate-500 mb-3 sm:mb-4" />
                  <p className="text-slate-400 text-base sm:text-lg">{t('admin_withdrawals_no_history')}</p>
                </motion.div>
              ) : (
                 <motion.ul variants={containerVariants} initial="hidden" animate="visible" className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                  {processedWithdrawals.map(withdrawal => (
                    <motion.li key={withdrawal.withdrawalId} variants={itemVariants}>
                      <Card className={`bg-slate-700/50 border-slate-600/70 rounded-lg shadow-sm p-2.5 sm:p-3 ${
                        withdrawal.status === 'approved_by_admin' ? 'border-l-4 border-green-500' : 
                        withdrawal.status.startsWith('rejected') ? 'border-l-4 border-red-500' :
                        'border-l-4 border-slate-500'
                      }`}>
                        <div className="flex justify-between items-start">
                           <CardTitle className={`text-xs sm:text-sm font-semibold ${
                             withdrawal.status === 'approved_by_admin' ? 'text-green-400' : 
                             withdrawal.status.startsWith('rejected') ? 'text-red-400' :
                             'text-slate-300'
                           }`}>
                            <User className="w-3.5 h-3.5 mr-1.5 inline-block"/> {withdrawal.username} - {withdrawal.amount} USDT
                          </CardTitle>
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                             withdrawal.status === 'approved_by_admin' ? 'bg-green-500/10 text-green-400' : 
                             withdrawal.status.startsWith('rejected') ? 'bg-red-500/10 text-red-400' :
                             'bg-slate-600/50 text-slate-400'
                           }`}>{getStatusText(withdrawal.status)}</span>
                        </div>
                          <CardDescription className="text-xs text-slate-400 mt-1">
                            {t('admin_payments_date_label')}: {new Date(withdrawal.date).toLocaleString()}
                          </CardDescription>
                      </Card>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </section>
          </CardContent>
        </Card>
      );
    }
  