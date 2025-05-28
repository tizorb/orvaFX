
    import React from 'react';

    export const checkAndUpdateSubscriptionStatus = (user, updateUserSubscriptionCallback) => {
      if (user && user.isSubscribed && user.subscriptionEndDate) {
        const endDate = new Date(user.subscriptionEndDate);
        if (endDate < new Date()) {
          updateUserSubscriptionCallback(user.id, user.subscriptionTier, false, user.subscriptionEndDate);
        }
      }
    };
  