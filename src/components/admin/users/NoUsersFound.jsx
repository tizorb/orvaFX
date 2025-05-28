
    import React from 'react';
    import { motion } from 'framer-motion';
    import { Users as UsersIcon } from 'lucide-react';

    const NoUsersFound = ({ t }) => {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-10"
        >
          <UsersIcon className="mx-auto h-16 w-16 text-slate-500 mb-4" />
          <p className="text-slate-400 text-lg">{t('admin_users_no_users_found')}</p>
        </motion.div>
      );
    };

    export default NoUsersFound;
  