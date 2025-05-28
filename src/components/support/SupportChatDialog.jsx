
    import React, { useState, useEffect } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Label } from '@/components/ui/label';
    import { useAuth } from '@/contexts/AuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { useLanguage } from '@/contexts/LanguageContext';
    import { supabase } from '@/lib/supabaseClient';
    import { motion, AnimatePresence } from 'framer-motion';

    const SupportChatDialog = ({ isOpen, onClose }) => {
      const { user } = useAuth();
      const { toast } = useToast();
      const { t } = useLanguage();
      const [name, setName] = useState('');
      const [email, setEmail] = useState('');
      const [message, setMessage] = useState('');
      const [isSubmitting, setIsSubmitting] = useState(false);

      useEffect(() => {
        if (user) {
          setName(user.username);
          setEmail(user.email || ''); 
        } else {
          setName('');
          setEmail('');
        }
      }, [user, isOpen]);

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) {
          toast({
            variant: "destructive",
            title: t('support_chat_toast_error_title'),
            description: t('support_chat_toast_error_empty_message_desc'),
          });
          return;
        }
        setIsSubmitting(true);

        try {
          const currentUser = await supabase.auth.getUser();
          let creatorId = null;
          let userProfileId = null;

          if (currentUser.data.user && currentUser.data.user.id) {
            creatorId = currentUser.data.user.id;
            if (user && user.id) { 
              userProfileId = user.id;
            }
          }
          
          const supportMessageData = {
            content: message.trim(),
            creator_id: creatorId, 
            user_id: userProfileId, 
            username: name || (user ? user.username : t('support_chat_anonymous_user')),
            email: email || (user ? user.email : null),
            status: 'new',
            message: message.trim(),
          };

          const { error } = await supabase
            .from('support_messages')
            .insert(supportMessageData);

          if (error) {
            console.error('Error submitting support message to Supabase:', error);
            toast({
              variant: "destructive",
              title: t('support_chat_toast_error_submit_title'),
              description: error.message || t('support_chat_toast_error_submit_desc'),
            });
          } else {
            toast({
              title: t('support_chat_toast_success_title'),
              description: t('support_chat_toast_success_desc_v2'),
            });
            setMessage('');
            if (!user) {
              setName('');
              setEmail('');
            }
            onClose();
          }
        } catch (error) {
          console.error('Exception during support message submission:', error);
          toast({
            variant: "destructive",
            title: t('support_chat_toast_error_unexpected_title'),
            description: t('support_chat_toast_error_unexpected_desc'),
          });
        } finally {
          setIsSubmitting(false);
        }
      };

      return (
        <AnimatePresence>
          {isOpen && (
            <Dialog open={isOpen} onOpenChange={onClose}>
              <DialogContent className="sm:max-w-[480px] bg-slate-800 border-slate-700 text-slate-100 shadow-2xl rounded-lg">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-sky-400">{t('support_chat_dialog_title')}</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      {t('support_chat_dialog_desc_v2')}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 py-6">
                      <div className="grid gap-2">
                        <Label htmlFor="name" className="text-slate-300">{t('support_chat_label_name')}</Label>
                        <Input 
                          id="name" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                          placeholder={t('support_chat_placeholder_name')}
                          className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:ring-sky-500"
                          disabled={!!user}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email" className="text-slate-300">{t('support_chat_label_email')}</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          placeholder={t('support_chat_placeholder_email')}
                          className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:ring-sky-500"
                          disabled={!!user && !!user.email}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="message" className="text-slate-300">{t('support_chat_label_message')}</Label>
                        <Textarea 
                          id="message" 
                          value={message} 
                          onChange={(e) => setMessage(e.target.value)} 
                          placeholder={t('support_chat_placeholder_message')} 
                          rows={5}
                          className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:ring-sky-500"
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter className="sm:justify-between gap-2">
                       <Button type="button" variant="outline" onClick={onClose} className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100">
                        {t('support_chat_button_cancel')}
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white transition-all"
                      >
                        {isSubmitting ? t('support_chat_button_submitting') : t('support_chat_button_send')}
                      </Button>
                    </DialogFooter>
                  </form>
                </motion.div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      );
    };

    export default SupportChatDialog;
  