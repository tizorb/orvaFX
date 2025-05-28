
    import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
    import { motion } from 'framer-motion';
    import { CheckCircle, XCircle, CreditCard, User, CalendarDays, Hash, ListFilter } from 'lucide-react';
    import { useLanguage } from '@/contexts/LanguageContext';

    export function PaymentsManager({ payments = [], onApprove, onReject }) {
      const { t } = useLanguage();
      const safePayments = Array.isArray(payments) ? payments : [];
      const pendingPayments = safePayments.filter(p => p.status === 'pending');
      const processedPayments = safePayments.filter(p => p.status !== 'pending');

      const getStatusText = (status) => {
        if (status === 'pending') return t('admin_payments_status_pending');
        if (status === 'approved') return t('admin_payments_status_approved');
        if (status === 'rejected') return t('admin_payments_status_rejected');
        return status;
      };

      return (
        <Card className="bg-slate-800/70 border-slate-700 shadow-xl rounded-xl">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl text-green-400 flex items-center"><CreditCard className="mr-2 h-6 w-6 sm:h-7 sm:w-7"/>{t('admin_payments_title')}</CardTitle>
            <CardDescription className="text-slate-400 text-xs sm:text-sm mt-1">{t('admin_payments_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <section>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-slate-200 flex items-center">
                <ListFilter className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-green-400"/>
                {t('admin_payments_status_pending')}
              </h3>
              {pendingPayments.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8 sm:py-10"
                >
                  <CreditCard className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-slate-500 mb-3 sm:mb-4" />
                  <p className="text-slate-400 text-base sm:text-lg">{t('admin_payments_no_pending')}</p>
                </motion.div>
              ) : (
                <ul className="space-y-3 sm:space-y-4">
                  {pendingPayments.map(payment => (
                    <motion.li 
                      key={payment.id}
                      initial={{ opacity: 0, x: -20, scale: 0.98 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ duration: 0.3, type: "spring", stiffness: 150, damping: 20 }}
                    >
                      <Card className="bg-slate-700/50 border-slate-600 rounded-lg shadow-md hover:shadow-green-500/20 transition-shadow duration-300">
                        <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                          <CardTitle className="text-base sm:text-lg text-green-300 flex items-center"><User className="w-4 h-4 mr-1.5"/>{payment.username || payment.userId}</CardTitle>
                          <CardDescription className="text-xs text-slate-400 mt-0.5">
                            {t('admin_payments_plan_label')}: {payment.plan} | {t('admin_payments_amount_label')}: {payment.amount}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="text-xs sm:text-sm text-slate-300 space-y-1 px-3 sm:px-4 pb-2">
                          <p><CalendarDays className="w-3 h-3 mr-1.5 inline"/>{t('admin_payments_date_label')}: {new Date(payment.date).toLocaleString()}</p>
                          <p className="break-all"><Hash className="w-3 h-3 mr-1.5 inline"/>{t('admin_payments_tx_hash_label')}: {payment.transactionHash}</p>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2 pt-2 pb-3 px-3 sm:px-4 border-t border-slate-600/50">
                          <Button onClick={() => onApprove(payment.id)} size="sm" className="bg-green-500 hover:bg-green-600 h-8 px-3 text-xs">
                            <CheckCircle size={14} className="mr-1"/>{t('admin_payments_approve_button')}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => onReject(payment.id)} className="h-8 px-3 text-xs">
                            <XCircle size={14} className="mr-1"/>{t('admin_payments_reject_button')}
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.li>
                  ))}
                </ul>
              )}
            </section>
            <section className="mt-6 sm:mt-8">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-slate-200">{t('admin_withdrawals_history_title')}</h3>
              {processedPayments.length === 0 ? (
                 <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8 sm:py-10"
                >
                  <ListFilter className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-slate-500 mb-3 sm:mb-4" />
                  <p className="text-slate-400 text-base sm:text-lg">{t('admin_withdrawals_no_history')}</p>
                </motion.div>
              ) : (
                <ul className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                  {processedPayments.slice().reverse().map(payment => (
                     <motion.li 
                      key={payment.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                       <Card className={`bg-slate-700/40 border-slate-600/80 p-2.5 sm:p-3 text-xs rounded-md ${payment.status === 'approved' ? 'border-l-2 border-green-500' : 'border-l-2 border-red-500'}`}>
                          <p className="font-semibold text-slate-200 text-xs sm:text-sm">{payment.username || payment.userId} - {payment.plan} ({payment.amount})</p>
                          <p className="text-slate-400 text-xs mt-0.5">{t('admin_payments_date_label')}: {new Date(payment.date).toLocaleDateString()} | {t('admin_payments_status_label')}: <span className={payment.status === 'approved' ? 'text-green-400' : 'text-red-400'}>{getStatusText(payment.status)}</span></p>
                          <p className="text-slate-500 truncate text-xs mt-0.5">{t('admin_payments_tx_hash_label')}: {payment.transactionHash}</p>
                       </Card>
                     </motion.li>
                  ))}
                </ul>
              )}
            </section>
          </CardContent>
        </Card>
      );
    }
  