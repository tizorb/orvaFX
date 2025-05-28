
    import { useEffect } from 'react';

    const useSubscriptionManagement = (loading, user, updateUserSubscription, checkAndUpdateSubscriptionStatus) => {
      useEffect(() => {
        if (!loading && user) { 
          checkAndUpdateSubscriptionStatus(user, updateUserSubscription);
          const interval = setInterval(() => checkAndUpdateSubscriptionStatus(user, updateUserSubscription), 1000 * 60 * 60); 
          return () => clearInterval(interval);
        }
      }, [loading, user, updateUserSubscription, checkAndUpdateSubscriptionStatus]);
    };

    export default useSubscriptionManagement;
  