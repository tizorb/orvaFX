
    import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Textarea } from '@/components/ui/textarea';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
    import { Badge } from '@/components/ui/badge';
    import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Mail, MessageSquare, Send, Trash2, AlertTriangle, CheckCircle, Clock, UserCircle, CornerDownRight } from 'lucide-react';
    import { useLanguage } from '@/contexts/LanguageContext';
    import { useToast } from '@/components/ui/use-toast';
    import { getFromLocalStorage, saveToLocalStorage } from '@/lib/localStorageUtils';
    import { v4 as uuidv4 } from 'uuid';

    const SUPPORT_MESSAGES_KEY = 'orvafx_support_messages_v1';

    export function SupportMessagesManager() {
      const { t } = useLanguage();
      const { toast } = useToast();
      const [messages, setMessages] = useState([]);
      const [selectedMessage, setSelectedMessage] = useState(null);
      const [replyContent, setReplyContent] = useState('');
      const [messageToDelete, setMessageToDelete] = useState(null);

      useEffect(() => {
        const loadedMessages = getFromLocalStorage(SUPPORT_MESSAGES_KEY, []);
        setMessages(loadedMessages.map(msg => ({ ...msg, replies: msg.replies || [] })).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));
      }, []);

      const updateMessageStatus = (messageId, newStatus) => {
        const updatedMessages = messages.map(msg =>
          msg.id === messageId ? { ...msg, status: newStatus } : msg
        );
        setMessages(updatedMessages.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));
        saveToLocalStorage(SUPPORT_MESSAGES_KEY, updatedMessages);
        setSelectedMessage(prev => prev && prev.id === messageId ? { ...prev, status: newStatus } : prev);
        toast({
          title: t('admin_support_toast_status_updated_title'),
          description: `${t('admin_support_toast_message_id_desc')} ${messageId} ${t('admin_support_toast_status_updated_to_desc')} ${t(`admin_support_status_${newStatus}`)}.`,
        });
      };

      const handleSendReply = () => {
        if (!replyContent.trim() || !selectedMessage) return;
        const newReply = {
          id: uuidv4(),
          content: replyContent.trim(),
          timestamp: new Date().toISOString(),
          author: 'admin',
        };
        const updatedMessages = messages.map(msg =>
          msg.id === selectedMessage.id ? { ...msg, replies: [...(msg.replies || []), newReply], status: 'in_progress', timestamp: new Date().toISOString() } : msg
        );
        setMessages(updatedMessages.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));
        saveToLocalStorage(SUPPORT_MESSAGES_KEY, updatedMessages);
        setSelectedMessage(prev => ({ ...prev, replies: [...(prev.replies || []), newReply], status: 'in_progress', timestamp: new Date().toISOString() }));
        setReplyContent('');
        toast({
          title: t('admin_support_reply_sent_title'),
          description: t('admin_support_reply_sent_desc', { messageId: selectedMessage.id }),
        });
      };
      
      const handleDeleteMessage = (messageId) => {
        const updatedMessages = messages.filter(msg => msg.id !== messageId);
        setMessages(updatedMessages.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));
        saveToLocalStorage(SUPPORT_MESSAGES_KEY, updatedMessages);
        if (selectedMessage && selectedMessage.id === messageId) {
          setSelectedMessage(null);
        }
        setMessageToDelete(null);
        toast({
          title: t('admin_support_toast_message_deleted_title'),
          description: `${t('admin_support_toast_message_id_desc')} ${messageId} ${t('admin_support_toast_message_deleted_desc')}`,
        });
      };

      const getStatusBadgeVariant = (status) => {
        switch (status) {
          case 'new': return 'default';
          case 'in_progress': return 'secondary';
          case 'resolved': return 'outline';
          default: return 'destructive';
        }
      };
      
      const getStatusBadgeClasses = (status) => {
        switch (status) {
          case 'new': return 'bg-blue-500/20 text-blue-300 border-blue-500';
          case 'in_progress': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500';
          case 'resolved': return 'bg-green-500/20 text-green-300 border-green-500';
          default: return 'bg-slate-600 text-slate-300 border-slate-500';
        }
      };


      return (
        <Card className="bg-slate-800/70 border-slate-700 shadow-xl min-h-[calc(100vh-280px)] sm:min-h-[calc(100vh-320px)] flex flex-col rounded-xl">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6">
            <div className="mb-3 sm:mb-0">
              <CardTitle className="text-xl sm:text-2xl text-purple-400 flex items-center"><MessageSquare className="mr-2 h-6 w-6 sm:h-7 sm:w-7"/>{t('admin_tab_support')}</CardTitle>
              <CardDescription className="text-slate-400 text-xs sm:text-sm mt-1">{t('admin_support_desc')}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 p-4 sm:p-6">
            <div className="md:col-span-4 lg:col-span-3 h-[calc(100vh-400px)] sm:h-auto md:max-h-[calc(100vh-380px)] overflow-y-auto custom-scrollbar pr-2 border-r border-slate-700/70">
              <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-2 sm:mb-3 sticky top-0 bg-slate-800/70 py-1 z-10">{t('admin_support_messages_list_title')}</h3>
              {messages.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-10"
                >
                  <Mail className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-slate-500 mb-3 sm:mb-4" />
                  <p className="text-slate-400 text-base sm:text-lg">{t('admin_support_no_messages_desc')}</p>
                </motion.div>
              ) : (
                <ul className="space-y-2 sm:space-y-3">
                  {messages.map(msg => (
                    <motion.li
                      key={msg.id}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25 }}
                      onClick={() => setSelectedMessage(msg)}
                      className={`p-2.5 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 ${selectedMessage?.id === msg.id ? 'bg-purple-600/30 ring-1 ring-purple-500 shadow-md' : 'bg-slate-700/50 hover:bg-slate-700/80'}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs sm:text-sm font-semibold text-purple-300 truncate w-3/5 sm:w-4/5">{msg.name}</p>
                        <Badge variant="outline" className={`text-xs px-1.5 py-0.5 border ${getStatusBadgeClasses(msg.status)}`}>{t(`admin_support_status_${msg.status}`)}</Badge>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{msg.message}</p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(msg.timestamp).toLocaleString()}</p>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
            <div className="md:col-span-8 lg:col-span-9 h-[calc(100vh-400px)] sm:h-auto md:max-h-[calc(100vh-380px)] flex flex-col">
              {selectedMessage ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedMessage.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className="bg-slate-700/40 p-3 sm:p-4 rounded-lg shadow-inner flex-grow flex flex-col h-full"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 pb-3 border-b border-slate-600/70">
                      <div className="mb-2 sm:mb-0">
                        <h4 className="text-base sm:text-lg font-semibold text-purple-200">{selectedMessage.name}</h4>
                        {selectedMessage.email && <p className="text-xs text-slate-400 flex items-center"><Mail size={12} className="mr-1"/>{selectedMessage.email}</p>}
                        <p className="text-xs text-slate-500">{new Date(selectedMessage.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center space-x-1.5 sm:space-x-2 self-start sm:self-center">
                        {selectedMessage.status !== 'in_progress' && (
                          <Button size="xs" variant="outline" className="text-yellow-400 border-yellow-500 hover:bg-yellow-500/10" onClick={() => updateMessageStatus(selectedMessage.id, 'in_progress')}>
                            <Clock size={12} className="mr-1"/>{t('admin_support_action_mark_in_progress')}
                          </Button>
                        )}
                        {selectedMessage.status !== 'resolved' && (
                          <Button size="xs" variant="outline" className="text-green-400 border-green-500 hover:bg-green-500/10" onClick={() => updateMessageStatus(selectedMessage.id, 'resolved')}>
                            <CheckCircle size={12} className="mr-1"/>{t('admin_support_action_mark_resolved')}
                          </Button>
                        )}
                        <Dialog open={messageToDelete === selectedMessage.id} onOpenChange={(isOpen) => !isOpen && setMessageToDelete(null)}>
                          <DialogTrigger asChild>
                            <Button size="iconXs" variant="destructive" onClick={() => setMessageToDelete(selectedMessage.id)}>
                              <Trash2 size={12}/>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-800 border-slate-700 text-slate-50">
                            <DialogHeader>
                              <DialogTitle className="text-red-400 flex items-center"><AlertTriangle className="mr-2"/>{t('admin_support_delete_confirm_title')}</DialogTitle>
                              <DialogDescription className="text-slate-400">{t('admin_support_delete_confirm_desc')}</DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setMessageToDelete(null)}>{t('admin_support_delete_confirm_cancel')}</Button>
                              <Button variant="destructive" onClick={() => handleDeleteMessage(selectedMessage.id)}>{t('admin_support_delete_confirm_delete')}</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 mb-3 sm:mb-4 space-y-2.5 sm:space-y-3">
                      <div className="bg-slate-600/50 p-2.5 sm:p-3 rounded-md">
                        <p className="text-xs sm:text-sm text-slate-100 whitespace-pre-wrap">{selectedMessage.message}</p>
                      </div>
                      {(selectedMessage.replies || []).map(reply => (
                        <div key={reply.id} className={`p-2.5 sm:p-3 rounded-md ${reply.author === 'admin' ? 'bg-purple-600/30 ml-auto' : 'bg-slate-600/50 mr-auto'}`} style={{maxWidth: '90%'}}>
                           <div className="flex items-center mb-1">
                            {reply.author === 'admin' ? <UserCircle size={12} className="mr-1 text-purple-300"/> : <CornerDownRight size={12} className="mr-1 text-slate-400"/>}
                            <span className={`text-xs font-semibold ${reply.author === 'admin' ? 'text-purple-300' : 'text-slate-300'}`}>
                              {reply.author === 'admin' ? t('admin_support_reply_author_admin') : selectedMessage.name}
                            </span>
                            <span className="text-xs text-slate-500 ml-1.5 sm:ml-2">{new Date(reply.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-100 whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto pt-3 border-t border-slate-600/70">
                      <Label htmlFor="replyContent" className="text-xs sm:text-sm font-medium text-slate-300 mb-1 block">{t('admin_support_reply_label')}</Label>
                      <Textarea
                        id="replyContent"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={t('admin_support_reply_placeholder')}
                        rows={2}
                        className="bg-slate-600 border-slate-500 focus:ring-purple-500 custom-scrollbar text-xs sm:text-sm h-16 sm:h-20"
                      />
                      <Button onClick={handleSendReply} disabled={!replyContent.trim()} className="mt-2 w-full bg-purple-500 hover:bg-purple-600 h-8 sm:h-9 text-xs sm:text-sm">
                        <Send size={14} className="mr-1.5 sm:mr-2"/>{t('admin_support_reply_button_send')}
                      </Button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <Mail size={40} className="mb-3 sm:mb-4"/>
                  <p className="text-sm sm:text-base">{t('admin_support_select_message_prompt')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }
  