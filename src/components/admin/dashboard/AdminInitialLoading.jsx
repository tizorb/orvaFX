
    import React from 'react';
    import LoadingSpinner from '@/components/ui/LoadingSpinner';

    const AdminInitialLoading = ({ t, messageKey, defaultMessage = "Loading..." }) => {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-lg text-slate-300">{t(messageKey) || defaultMessage}</p>
        </div>
      );
    };

    export default AdminInitialLoading;
  