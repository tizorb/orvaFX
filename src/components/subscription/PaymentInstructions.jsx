
    import React from 'react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Copy } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { useLanguage } from '@/contexts/LanguageContext';

    const USDT_TRC20_WALLET = "TFMsBhZmphCqxdWFAVk6dSTp767ZP5pNHc";

    const PaymentInstructions = () => {
      const { t } = useLanguage();
      const { toast } = useToast();

      const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast({
          title: t('subscription_wallet_address_copied_title'),
          description: t('subscription_wallet_address_copied_desc'),
        });
      };

      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-16 text-center p-8 bg-slate-800/50 rounded-xl border border-slate-700"
        >
          <h3 className="text-2xl font-semibold text-sky-300 mb-4">{t('subscription_payment_info_title')}</h3>
          <p className="text-slate-300 mb-2">
            {t('subscription_payment_info_desc1')}
          </p>
          <p className="text-slate-400 text-sm mb-4">
            {t('subscription_payment_info_desc2')}
          </p>
          <p className="text-slate-200 font-semibold">{t('subscription_payment_info_our_wallet')}</p>
          <div className="flex items-center justify-center space-x-2 mt-2 bg-slate-700 p-3 rounded-md max-w-lg mx-auto">
            <span className="text-sky-400 break-all">{USDT_TRC20_WALLET}</span>
            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(USDT_TRC20_WALLET)} className="text-sky-400 hover:text-sky-300">
              <Copy className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-red-400 mt-3">
            {t('subscription_payment_info_warning')}
          </p>
        </motion.div>
      );
    };

    export default PaymentInstructions;
  