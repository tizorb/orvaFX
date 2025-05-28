
    import React from 'react';
    import { motion } from 'framer-motion';

    const AdminDataLoadingError = ({ t, error }) => {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-h-[calc(100vh-150px)] flex flex-col items-center justify-center p-4 text-center"
        >
          <h2 className="text-2xl font-semibold text-red-400 mb-3">{t('error_fetching_data_title') || "Error Fetching Data"}</h2>
          <p className="text-slate-400 mb-4">{t('error_fetching_data_message') || "Could not load administrative data. Please try again later."}</p>
          {error && error.message && (
            <pre className="text-xs text-slate-500 bg-slate-800 p-3 rounded-md max-w-md overflow-auto">{error.message}</pre>
          )}
        </motion.div>
      );
    };

    export default AdminDataLoadingError;
  