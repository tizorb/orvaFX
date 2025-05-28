
    import React from 'react';
    import { motion } from 'framer-motion';
    import { ShieldCheck } from 'lucide-react';
    import { useLanguage } from '@/contexts/LanguageContext';

    const SubscribedMessage = ({ user }) => {
      const { t } = useLanguage();

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-8"
        >
          <ShieldCheck className="w-24 h-24 text-green-400 mb-6" />
          <h2 className="text-3xl font-bold text-slate-100 mb-4">{t('subscription_already_subscribed_title')}</h2>
          <p className="text-slate-300 mb-8 max-w-md">
            {t('subscription_already_subscribed_desc', { tier: user.subscriptionTier || t('subscription_tier_unknown') })}
          </p>
          <p className="text-xs text-slate-500">{t('subscription_already_subscribed_contact')}</p>
        </motion.div>
      );
    };

    export default SubscribedMessage;
  