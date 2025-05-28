
    import React from 'react';
    import { motion } from 'framer-motion';
    import { Sun, Moon, TrendingUp, TrendingDown } from 'lucide-react';
    import { formatTimeRemaining } from './marketUtils';

    const MarketDisplay = ({ marketStatus, t }) => {
      const { 
        nameKey, 
        isOpen, 
        timeRemainingMs, 
        isEventOpening, 
        localOpen, 
        localClose, 
        icon, 
        progress,
        baseColor,
        accentColor,
        borderColor,
        shadowColor
      } = marketStatus;

      const timeParts = formatTimeRemaining(timeRemainingMs, t);
      
      const formattedTime = timeParts.map((part, index) => (
        <React.Fragment key={index}>
          <span className="text-2xl font-bold tracking-tight">
            {part.value}
          </span>
          <span className="text-sm font-medium text-slate-300/80 ml-0.5 mr-1.5">
            {part.unit}
          </span>
        </React.Fragment>
      ));


      return (
        <motion.div
          className={`p-4 rounded-xl shadow-lg ${baseColor} text-white border-2 ${isOpen ? borderColor : 'border-slate-700'} ${shadowColor} flex flex-col justify-between min-h-[220px] sm:min-h-[210px] relative overflow-hidden`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold tracking-wide flex items-center">
                <span className="text-2xl mr-2">{icon}</span>
                {t(nameKey)}
              </h3>
              <p className={`text-sm font-semibold mt-1 ${isOpen ? accentColor : 'text-slate-300'}`}>
                {isOpen ? t('market_clock_status_open') : t('market_clock_status_closed')}
              </p>
            </div>
            <div className={`p-2 rounded-full ${isOpen ? 'bg-yellow-400/30' : 'bg-slate-800/40'}`}>
              {isOpen ? 
                <Sun className="w-6 h-6 text-yellow-300" /> : 
                <Moon className="w-6 h-6 text-slate-400" />}
            </div>
          </div>

          <div className="my-3 text-center">
            <p className="text-xs text-slate-200/90">{localOpen} - {localClose} ({t('market_clock_local_time')})</p>
            <p className="text-md font-semibold mt-1.5">
              {isEventOpening 
                ? <span className="flex items-center justify-center"><TrendingUp size={18} className="mr-1.5 text-green-300"/> {t('market_clock_opens_in')}</span>
                : <span className="flex items-center justify-center"><TrendingDown size={18} className="mr-1.5 text-red-300"/> {t('market_clock_closes_in')}</span>}
            </p>
            <div className="flex justify-center items-baseline mt-0.5">
              {formattedTime}
            </div>
          </div>
          
          <div className="w-full h-2.5 bg-black/30 rounded-full overflow-hidden relative">
            <motion.div 
              className={`h-full ${isOpen ? 'bg-green-400' : 'bg-red-400'}`}
              initial={{ width: "0%" }}
              animate={{ width: `${isOpen ? progress : (100-progress)}%` }}
              transition={{ duration: 0.5, ease: "circOut" }}
            />
          </div>

        </motion.div>
      );
    };

    export default MarketDisplay;
  