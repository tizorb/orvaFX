
    import React, { useState, useEffect, useCallback } from 'react';
    import { useAuth } from '@/contexts/AuthContext';
    import { useLanguage } from '@/contexts/LanguageContext';
    import { supabase } from '@/lib/supabaseClient';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Badge } from '@/components/ui/badge';
    import { motion, AnimatePresence } from 'framer-motion';
    import { MessageCircle, CornerDownRight, UserCircle } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';


    const UserSupportMessages = () => {
      const { user } = useAuth();
      const { t } = useLanguage();
      const { toast } = useToast();
      const [userMessages, setUserMessages] = useState([]);
      const [selectedThread, setSelectedThread] = useState(null);
      const [loadingMessages, setLoadingMessages] = useState(false);

      const fetchUserMessages = useCallback(async () => {
        if (!user || !user.auth_user_id) {
          setUserMessages([]);
          return;
        }
        setLoadingMessages(true);
        try {
          const { data, error } = await supabase
            .from('support_messages')
            .select(`
              id, 
              message, 
              created_at, 
              status,
              admin_response,
              updated_at
            `)
            .eq('creator_id', user.auth_user_id)
            .order('created_at', { ascending: false });

          if (error) {
            console.error("Error fetching support messages:", error);
            toast({
              variant: "destructive",
              title: t('profile_support_fetch_error_title'),
              description: error.message,
            });
            setUserMessages([]);
          } else {
            const formattedMessages = data.map(msg => ({
              id: msg.id,
              message: msg.message,
              timestamp: msg.created_at,
              status: msg.status || 'new',
              replies: msg.admin_response ? [{ 
                id: `reply-${msg.id}`, 
                content: msg.admin_response, 
                author: 'admin', 
                timestamp: msg.updated_at 
              }] : []
            }));
            setUserMessages(formattedMessages);
          }
        } catch (e) {
          console.error("Exception fetching support messages:", e);
           toast({
              variant: "destructive",
              title: t('profile_support_fetch_error_title'),
              description: t('profile_support_fetch_error_desc_exception'),
            });
          setUserMessages([]);
        } finally {
          setLoadingMessages(false);
        }
      }, [user, t, toast]);

      useEffect(() => {
        fetchUserMessages();
      }, [fetchUserMessages]);

      const getStatusBadgeVariant = (status) => {
        switch (status) {
          case 'new': return 'default';
          case 'in_progress': 
          case 'answered':
            return 'secondary';
          case 'resolved': return 'outline';
          default: return 'destructive';
        }
      };

      if (!user) {
        return (
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl mt-2">
            <CardHeader>
              <CardTitle className="text-2xl text-sky-400">{t('profile_support_messages_title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-center py-6">{t('profile_support_login_required')}</p>
            </CardContent>
          </Card>
        );
      }

      return (
        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl mt-2 min-h-[400px]">
          <CardHeader>
            <CardTitle className="text-2xl text-sky-400 flex items-center">
              <MessageCircle size={28} className="mr-2"/>{t('profile_support_messages_title')}
            </CardTitle>
            <CardDescription className="text-muted-foreground">{t('profile_support_messages_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 h-[400px] overflow-y-auto custom-scrollbar pr-2 border-r border-slate-700/50">
              {loadingMessages ? (
                 <div className="flex justify-center items-center h-full">
                    <div className="w-8 h-8 border-4 border-t-primary border-slate-700 rounded-full animate-spin"></div>
                 </div>
              ) : userMessages.length === 0 ? (
                <p className="text-slate-400 text-center py-6">{t('profile_support_no_messages')}</p>
              ) : (
                <ul className="space-y-3">
                  {userMessages.map(msg => (
                    <motion.li
                      key={msg.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => setSelectedThread(msg)}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${selectedThread?.id === msg.id ? 'bg-sky-600/30 ring-2 ring-sky-500' : 'bg-slate-700/50 hover:bg-slate-700'}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-semibold text-sky-300 truncate w-4/5">{msg.message.substring(0,30)}...</p>
                        <Badge variant={getStatusBadgeVariant(msg.status)} className="text-xs">{t(`admin_support_status_${msg.status}`)}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{new Date(msg.timestamp).toLocaleString()}</p>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
            <div className="md:col-span-2 h-[400px] flex flex-col">
              {selectedThread ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedThread.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-slate-700/40 p-4 rounded-lg shadow-inner flex-grow flex flex-col"
                  >
                    <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 mb-4 space-y-3">
                      <div className="bg-sky-600/40 p-3 rounded-md self-end ml-auto" style={{maxWidth: '85%'}}>
                        <div className="flex items-center mb-1">
                            <UserCircle size={14} className="mr-1 text-sky-200"/>
                            <span className="text-xs font-semibold text-sky-200">{t('profile_support_you')}</span>
                            <span className="text-xs text-slate-400 ml-2">{new Date(selectedThread.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-slate-100 whitespace-pre-wrap">{selectedThread.message}</p>
                      </div>
                      
                      {selectedThread.replies.map(reply => (
                        <div key={reply.id} className={`p-3 rounded-md ${reply.author === 'admin' ? 'bg-purple-600/30 mr-auto' : 'bg-sky-600/40 ml-auto'}`} style={{maxWidth: '85%'}}>
                           <div className="flex items-center mb-1">
                            {reply.author === 'admin' ? <CornerDownRight size={14} className="mr-1 text-purple-300"/> : <UserCircle size={14} className="mr-1 text-sky-200"/>}
                            <span className={`text-xs font-semibold ${reply.author === 'admin' ? 'text-purple-300' : 'text-sky-200'}`}>
                              {reply.author === 'admin' ? t('admin_support_reply_author_admin') : t('profile_support_you')}
                            </span>
                            <span className="text-xs text-slate-400 ml-2">{new Date(reply.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-slate-100 whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      ))}
                       {selectedThread.replies.length === 0 && (
                         <p className="text-sm text-slate-400 text-center py-4">{t('profile_support_no_replies_yet')}</p>
                       )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <MessageCircle size={48} className="mb-4"/>
                  <p>{t('profile_support_select_thread_prompt')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    };

    export default UserSupportMessages;
  