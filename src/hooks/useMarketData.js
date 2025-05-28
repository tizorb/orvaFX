
    import { useState, useEffect } from 'react';
    import { marketsConfig, getMarketInfo } from '@/components/market-clock/marketUtils';
    import { useMarketClockUpdater } from '@/hooks/useMarketClockUpdater';

    export const useMarketData = () => {
      const currentTime = useMarketClockUpdater();
      const [marketStatuses, setMarketStatuses] = useState([]);

      useEffect(() => {
        const calculateMarketStatuses = () => {
          const statuses = marketsConfig.map(market => getMarketInfo(market, currentTime));
          setMarketStatuses(statuses);
        };
        calculateMarketStatuses();
      }, [currentTime]);

      return marketStatuses;
    };
  