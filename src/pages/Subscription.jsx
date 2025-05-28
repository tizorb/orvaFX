
    import React, { useState } from 'react';
    import { motion } from 'framer-motion';
    import { useAuth } from '@/contexts/AuthContext';
    import { useLanguage } from '@/contexts/LanguageContext';
    import SubscriptionPlans from '@/components/subscription/SubscriptionPlans';
    import PaymentModal from '@/components/subscription/PaymentModal';
    import SubscribedMessage from '@/components/subscription/SubscribedMessage';
    import PaymentInstructions from '@/components/subscription/PaymentInstructions';
    import LoadingSpinner from '@/components/ui/LoadingSpinner';

    export function Subscription() {
      const { user, loading: authLoading } = useAuth();
      const { t } = useLanguage();
      const [selectedPlan, setSelectedPlan] = useState(null);
      const [isModalOpen, setIsModalOpen] = useState(false);

      const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
        setIsModalOpen(true);
      };

      const handlePaymentSubmitted = () => {
        setSelectedPlan(null); 
      };

      if (authLoading) {
        return (
          <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        );
      }

      if (user && user.isSubscribed) {
        return <SubscribedMessage user={user} />;
      }

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto p-4 md:p-8"
        >
          <h1 className="text-4xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
            {t('subscription_page_title')}
          </h1>
          <p className="text-lg text-slate-300 text-center mb-12 max-w-2xl mx-auto">
            {t('subscription_page_subtitle')}
          </p>

          <SubscriptionPlans onSelectPlan={handleSelectPlan} />
          
          <PaymentModal 
            isOpen={isModalOpen} 
            onOpenChange={setIsModalOpen} 
            selectedPlan={selectedPlan}
            onPaymentSubmitted={handlePaymentSubmitted}
          />

          <PaymentInstructions />
          
        </motion.div>
      );
    }
  