
    export const marketsConfig = [
      { 
        nameKey: 'market_clock_london', 
        localOpen: '08:00', 
        localClose: '17:00', 
        daylightSavingZone: 'Europe/London',
        icon: '🇬🇧',
        baseColor: 'bg-blue-700',
        accentColor: 'text-blue-200',
        borderColor: 'border-blue-500',
        shadowColor: 'shadow-blue-600/30'
      },
      { 
        nameKey: 'market_clock_new_york', 
        localOpen: '09:30',
        localClose: '16:00',
        daylightSavingZone: 'America/New_York',
        icon: '🇺🇸',
        baseColor: 'bg-teal-700',
        accentColor: 'text-teal-200',
        borderColor: 'border-teal-500',
        shadowColor: 'shadow-teal-600/30'
      },
      { 
        nameKey: 'market_clock_tokyo', 
        localOpen: '09:00', 
        localClose: '15:00', 
        daylightSavingZone: 'Asia/Tokyo',
        icon: '🇯🇵',
        baseColor: 'bg-red-700',
        accentColor: 'text-red-200',
        borderColor: 'border-red-500',
        shadowColor: 'shadow-red-600/30'
      },
      { 
        nameKey: 'market_clock_sydney', 
        localOpen: '10:00', 
        localClose: '16:00', 
        daylightSavingZone: 'Australia/Sydney',
        icon: '🇦🇺',
        baseColor: 'bg-orange-700',
        accentColor: 'text-orange-200',
        borderColor: 'border-orange-500',
        shadowColor: 'shadow-orange-600/30'
      },
    ];
    
    const getOffset = (market, date) => {
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: market.daylightSavingZone,
          hour12: false,
          year: 'numeric', month: 'numeric', day: 'numeric',
          hour: 'numeric', minute: 'numeric', second: 'numeric'
        });
        const parts = formatter.formatToParts(date);
        let year, month, day, hour, minute, second;
        parts.forEach(part => {
          if (part.type === 'year') year = parseInt(part.value);
          if (part.type === 'month') month = parseInt(part.value);
          if (part.type === 'day') day = parseInt(part.value);
          if (part.type === 'hour') hour = parseInt(part.value === '24' ? '0' : part.value);
          if (part.type === 'minute') minute = parseInt(part.value);
          if (part.type === 'second') second = parseInt(part.value);
        });
    
        const localDateForOffset = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
        const utcDateForOffset = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()));
        
        return (localDateForOffset.getTime() - utcDateForOffset.getTime()) / (1000 * 60 * 60);
      } catch (e) {
        const now = new Date();
        const jan = new Date(now.getFullYear(), 0, 1);
        const jul = new Date(now.getFullYear(), 6, 1);
        const stdTimezoneOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
        const isDstObserved = now.getTimezoneOffset() < stdTimezoneOffset;

        if (market.daylightSavingZone === 'Europe/London') return isDstObserved ? 1 : 0;
        if (market.daylightSavingZone === 'America/New_York') return isDstObserved ? -4 : -5;
        if (market.daylightSavingZone === 'Asia/Tokyo') return 9;
        if (market.daylightSavingZone === 'Australia/Sydney') return isDstObserved ? 11 : 10;
        return 0;
      }
    };
    
    export const getMarketInfo = (market, currentGlobalTime) => {
      const currentOffset = getOffset(market, currentGlobalTime);
    
      const [openLocalH, openLocalM] = market.localOpen.split(':').map(Number);
      const [closeLocalH, closeLocalM] = market.localClose.split(':').map(Number);
    
      const currentDayOfWeekUTC = currentGlobalTime.getUTCDay(); 
      const currentHourUTC = currentGlobalTime.getUTCHours();
      const currentMinuteUTC = currentGlobalTime.getUTCMinutes();
      const currentTimeInMinutesUTC = currentHourUTC * 60 + currentMinuteUTC;
    
      const openTimeUTCMinutes = (openLocalH * 60 + openLocalM - currentOffset * 60 + 1440) % 1440;
      const closeTimeUTCMinutes = (closeLocalH * 60 + closeLocalM - currentOffset * 60 + 1440) % 1440;
    
      let isOpen = false;
      let isMarketDay = false;

      const dateInMarketTimezone = new Date(currentGlobalTime.toLocaleString('en-US', {timeZone: market.daylightSavingZone}));
      const marketDayOfWeek = dateInMarketTimezone.getDay(); 

      if (marketDayOfWeek >= 1 && marketDayOfWeek <= 5) { 
        isMarketDay = true;
      }

      if (isMarketDay) {
        if (openTimeUTCMinutes <= closeTimeUTCMinutes) { 
          isOpen = currentTimeInMinutesUTC >= openTimeUTCMinutes && currentTimeInMinutesUTC < closeTimeUTCMinutes;
        } else { 
          isOpen = currentTimeInMinutesUTC >= openTimeUTCMinutes || currentTimeInMinutesUTC < closeTimeUTCMinutes;
        }
      }
    
      let timeRemainingMs;
      let isEventOpening;
      let totalDurationMs = 0;
    
      if (isOpen) {
        isEventOpening = false; 
        if (openTimeUTCMinutes <= closeTimeUTCMinutes) {
          timeRemainingMs = (closeTimeUTCMinutes - currentTimeInMinutesUTC) * 60000;
          totalDurationMs = (closeTimeUTCMinutes - openTimeUTCMinutes) * 60000;
        } else { 
          timeRemainingMs = ((1440 - currentTimeInMinutesUTC) + closeTimeUTCMinutes) * 60000;
          totalDurationMs = ((1440 - openTimeUTCMinutes) + closeTimeUTCMinutes) * 60000;
        }
      } else {
        isEventOpening = true;
        let daysUntilNextOpen = 0;
        let nextOpenTimeUTCMinutes = openTimeUTCMinutes;
        
        let tempCurrentDayUTC = currentDayOfWeekUTC;
        let tempCurrentTimeMinutesUTC = currentTimeInMinutesUTC;

        while (true) {
          const marketDayForCalc = new Date(
            currentGlobalTime.getUTCFullYear(),
            currentGlobalTime.getUTCMonth(),
            currentGlobalTime.getUTCDate() + daysUntilNextOpen
          ).toLocaleString('en-US', { timeZone: market.daylightSavingZone });
          const marketDayOfWeekForCalc = new Date(marketDayForCalc).getDay();

          if (marketDayOfWeekForCalc >= 1 && marketDayOfWeekForCalc <= 5) { 
            if (daysUntilNextOpen === 0) { 
              if (tempCurrentTimeMinutesUTC < nextOpenTimeUTCMinutes) {
                break; 
              } else {
                daysUntilNextOpen++;
                tempCurrentTimeMinutesUTC = -1; 
              }
            } else {
              break; 
            }
          } else {
            daysUntilNextOpen++;
            tempCurrentTimeMinutesUTC = -1; 
          }
          if (daysUntilNextOpen > 7) break; 
        }

        if (daysUntilNextOpen === 0) {
            timeRemainingMs = (nextOpenTimeUTCMinutes - currentTimeInMinutesUTC) * 60000;
        } else {
            timeRemainingMs = ((daysUntilNextOpen * 1440) - currentTimeInMinutesUTC + nextOpenTimeUTCMinutes) * 60000;
        }
        totalDurationMs = 24 * 60 * 60000; 
      }
      
      if (timeRemainingMs < 0) timeRemainingMs = 0;

      return {
        ...market,
        isOpen,
        timeRemainingMs,
        isEventOpening,
        localOpen: market.localOpen,
        localClose: market.localClose,
        progress: totalDurationMs > 0 ? Math.max(0, Math.min(100, 100 - (timeRemainingMs / totalDurationMs) * 100)) : 0,
      };
    };
    
    export const formatTimeRemaining = (diffMs, t) => {
      const totalSeconds = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      const parts = [];
      if (days > 0) {
        parts.push({ value: String(days).padStart(2, '0'), unit: t(days === 1 ? 'market_clock_days_short_one' : 'market_clock_days_short_other', { count: days }) });
      }
      
      parts.push({ value: String(hours).padStart(2, '0'), unit: t(hours === 1 ? 'market_clock_hours_short_one' : 'market_clock_hours_short_other', { count: hours }) });
      parts.push({ value: String(minutes).padStart(2, '0'), unit: t(minutes === 1 ? 'market_clock_minutes_short_one' : 'market_clock_minutes_short_other', { count: minutes }) });
      
      if (days === 0) {
        parts.push({ value: String(seconds).padStart(2, '0'), unit: t(seconds === 1 ? 'market_clock_seconds_short_one' : 'market_clock_seconds_short_other', { count: seconds }) });
      }
      
      return parts;
    };
  