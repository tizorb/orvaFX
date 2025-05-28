
    import React, { useState } from 'react';
    import { MessageSquare } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import SupportChatDialog from '@/components/support/SupportChatDialog';
    import { useLanguage } from '@/contexts/LanguageContext';
    import { motion } from 'framer-motion';

    const SupportChatWidget = () => {
      const [isChatOpen, setIsChatOpen] = useState(false);
      const { t } = useLanguage();

      return (
        <>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, duration: 0.5, type: 'spring', stiffness: 150 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsChatOpen(true)}
              className="rounded-full w-16 h-16 bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-xl hover:from-sky-400 hover:to-blue-500 transform transition-all duration-300 hover:scale-110 focus:ring-4 focus:ring-sky-300"
              aria-label={t('support_chat_widget_button_label')}
            >
              <MessageSquare size={30} />
            </Button>
          </motion.div>
          <SupportChatDialog isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </>
      );
    };

    export default SupportChatWidget;
  