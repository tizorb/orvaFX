
    import React from 'react';
    import PaymentCard from './PaymentCard';
    import { motion } from 'framer-motion';
    import { ListFilter } from 'lucide-react';

    const ProcessedPaymentsList = ({ processedPayments, t }) => {
      if (processedPayments.length === 0) {
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 sm:py-10"
          >
            <ListFilter className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-slate-500 mb-3 sm:mb-4" />
            <p className="text-slate-400 text-base sm:text-lg">{t('admin_withdrawals_no_history')}</p> {/* Assuming this key is for generic processed history */}
          </motion.div>
        );
      }

      return (
        <ul className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
          {processedPayments.slice().reverse().map(payment => (
            <PaymentCard 
              key={payment.id} 
              payment={payment} 
              t={t} 
              isPending={false}
            />
          ))}
        </ul>
      );
    };

    export default ProcessedPaymentsList;
  