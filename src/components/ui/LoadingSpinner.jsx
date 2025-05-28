
    import React from 'react';
    import { motion } from 'framer-motion';
    import { cn } from '@/lib/utils';

    const LoadingSpinner = ({ size = 'md', className }) => {
      const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-10 h-10 border-4',
        lg: 'w-16 h-16 border-[6px]',
      };

      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={cn(
            "rounded-full border-t-primary border-slate-700",
            sizeClasses[size] || sizeClasses['md'],
            className
          )}
        />
      );
    };

    export default LoadingSpinner;
  