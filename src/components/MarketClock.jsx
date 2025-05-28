
    import React from 'react';
    import { motion } from 'framer-motion';
    import MarketDisplay from '@/components/market-clock/MarketDisplay';
    import { useLanguage } from '@/contexts/LanguageContext';
    import { useMarketData } from '@/hooks/useMarketData';

    export function MarketClock() {
      const { t } = useLanguage();
      const displayMarkets = useMarketData();

      return (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-5 p-3 bg-card/70 rounded-xl shadow-2xl border border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          {displayMarkets.map((status) => (
            <MarketDisplay key={status.nameKey} marketStatus={status} t={t} />
          ))}
        </motion.div>
      );
    }
  