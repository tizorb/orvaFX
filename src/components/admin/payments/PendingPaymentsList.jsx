
    import React from 'react';
    import PaymentCard from './PaymentCard';
    import { motion } from 'framer-motion';
    import { CreditCard } from 'lucide-react';

    const PendingPaymentsList = ({ pendingPayments, onApprove, onReject, t, isProcessing, currentProcessingId }) => {
      if (pendingPayments.length === 0) {
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 sm:py-10"
          >
            <CreditCard className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-slate-500 mb-3 sm:mb-4" />
            <p className="text-slate-400 text-base sm:text-lg">{t('admin_payments_no_pending')}</p>
          </motion.div>
        );
      }

      return (
        <ul className="space-y-3 sm:space-y-4">
          {pendingPayments.map(payment => (
            <PaymentCard 
              key={payment.id} 
              payment={payment} 
              onApprove={onApprove} 
              onReject={onReject} 
              t={t} 
              isPending={true}
              isProcessing={isProcessing && currentProcessingId === payment.id}
            />
          ))}
        </ul>
      );
    };

    export default PendingPaymentsList;
  