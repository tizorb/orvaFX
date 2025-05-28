
    import React from 'react';
    import { motion } from 'framer-motion';
    import { ShieldAlert } from 'lucide-react';

    const AccessDeniedMessage = ({ t }) => (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto p-4 sm:p-8 text-center flex flex-col items-center justify-center h-[calc(100vh-200px)]"
      >
        <ShieldAlert className="w-20 h-20 sm:w-24 sm:h-24 text-red-500 mb-4 sm:mb-6" />
        <h1 className="text-3xl sm:text-4xl font-bold text-red-400 mb-3 sm:mb-4">{t('admin_dashboard_access_denied_title')}</h1>
        <p className="text-slate-300 text-base sm:text-lg max-w-md">
          {t('admin_dashboard_access_denied_desc')}
        </p>
      </motion.div>
    );

    export default AccessDeniedMessage;
  