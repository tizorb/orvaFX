
    import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { motion } from 'framer-motion';
    import { User, CalendarDays, Hash, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
    import LoadingSpinner from '@/components/ui/LoadingSpinner';

    const PaymentCard = ({ payment, onApprove, onReject, t, isPending = true, isProcessing = false }) => {
      const getStatusText = (status) => {
        if (status === 'pending' || status === 'pending_approval') return t('admin_payments_status_pending');
        if (status === 'approved') return t('admin_payments_status_approved');
        if (status === 'rejected') return t('admin_payments_status_rejected');
        return status;
      };

      const paymentUsername = payment.username || payment.user_id?.substring(0,8) + '...' || 'N/A';
      const paymentEmail = payment.email || 'N/A';

      return (
        <motion.li
          key={payment.id}
          initial={{ opacity: 0, x: isPending ? -20 : 0, y: isPending ? 0 : 5, scale: isPending ? 0.98 : 1 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          transition={{ duration: isPending ? 0.3 : 0.2, type: isPending ? "spring" : "tween", stiffness: isPending ? 150 : undefined, damping: isPending ? 20 : undefined }}
        >
          <Card className={`
            ${isPending ? 'bg-slate-700/50 border-slate-600 rounded-lg shadow-md hover:shadow-green-500/20 transition-shadow duration-300' 
                       : `bg-slate-700/40 border-slate-600/80 p-2.5 sm:p-3 text-xs rounded-md ${payment.status === 'approved' ? 'border-l-2 border-green-500' : 'border-l-2 border-red-500'}`}
          `}>
            {isPending ? (
              <>
                <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                  <CardTitle className="text-base sm:text-lg text-green-300 flex items-center">
                    <User className="w-4 h-4 mr-1.5"/>{paymentUsername}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400 mt-0.5">
                    {t('admin_payments_email_label') || 'Email'}: {paymentEmail} <br/>
                    {t('admin_payments_plan_label')}: {payment.tier} | {t('admin_payments_amount_label')}: ${payment.amount}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs sm:text-sm text-slate-300 space-y-1 px-3 sm:px-4 pb-2">
                  <p><CalendarDays className="w-3 h-3 mr-1.5 inline"/>{t('admin_payments_date_label')}: {new Date(payment.created_at).toLocaleString()}</p>
                  <p className="break-all"><Hash className="w-3 h-3 mr-1.5 inline"/>{t('admin_payments_tx_hash_label')}: {payment.tx_hash}</p>
                  {payment.payment_proof_url && (
                    <p className="break-all">
                      <a href={payment.payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 underline inline-flex items-center">
                        {t('admin_payments_view_proof_label') || 'View Payment Proof'} <ExternalLink size={12} className="ml-1" />
                      </a>
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end space-x-2 pt-2 pb-3 px-3 sm:px-4 border-t border-slate-600/50">
                  <Button onClick={() => onApprove(payment.id)} size="sm" className="bg-green-500 hover:bg-green-600 h-8 px-3 text-xs" disabled={isProcessing}>
                    {isProcessing ? <LoadingSpinner size="xs" /> : <CheckCircle size={14} className="mr-1"/>}
                    {t('admin_payments_approve_button')}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onReject(payment)} className="h-8 px-3 text-xs" disabled={isProcessing}>
                     {isProcessing ? <LoadingSpinner size="xs" /> : <XCircle size={14} className="mr-1"/>}
                    {t('admin_payments_reject_button')}
                  </Button>
                </CardFooter>
              </>
            ) : (
              <>
                <p className="font-semibold text-slate-200 text-xs sm:text-sm">{paymentUsername} - {payment.tier} (${payment.amount})</p>
                <p className="text-slate-400 text-xs mt-0.5">{t('admin_payments_date_label')}: {new Date(payment.updated_at || payment.created_at).toLocaleDateString()} | {t('admin_payments_status_label')}: <span className={payment.status === 'approved' ? 'text-green-400' : 'text-red-400'}>{getStatusText(payment.status)}</span></p>
                <p className="text-slate-500 truncate text-xs mt-0.5">{t('admin_payments_tx_hash_label')}: {payment.tx_hash}</p>
                {payment.approved_by?.username && <p className="text-slate-500 text-xs mt-0.5">{t('admin_payments_processed_by_label') || 'Processed by'}: {payment.approved_by.username}</p>}
                 {payment.payment_proof_url && (
                    <p className="break-all text-xs mt-0.5">
                      <a href={payment.payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 underline inline-flex items-center">
                        {t('admin_payments_view_proof_label') || 'View Payment Proof'} <ExternalLink size={12} className="ml-1" />
                      </a>
                    </p>
                  )}
              </>
            )}
          </Card>
        </motion.li>
      );
    };

    export default PaymentCard;
  