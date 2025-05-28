
    import React, { useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
    import { motion, AnimatePresence } from 'framer-motion';
    import { PlusCircle, Edit3, Trash2, Newspaper, AlertTriangle } from 'lucide-react';
    import { useLanguage } from '@/contexts/LanguageContext';

    const initialFormState = {
      id: null,
      title: '',
      content: '',
      timestamp: ''
    };

    export function NewsManager({ newsItems = [], updateNews, toast }) {
      const { t } = useLanguage();
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [currentNewsItem, setCurrentNewsItem] = useState(initialFormState);
      const [isEditing, setIsEditing] = useState(false);
      const [newsToDelete, setNewsToDelete] = useState(null);

      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentNewsItem(prev => ({ ...prev, [name]: value }));
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!currentNewsItem.title || !currentNewsItem.content) {
          toast({ title: t('general_error_toast_title'), description: t('general_error_fill_all_fields'), variant: "destructive" });
          return;
        }

        let updatedNewsItems;
        if (isEditing) {
          updatedNewsItems = (newsItems || []).map(n => n.id === currentNewsItem.id ? { ...currentNewsItem, timestamp: new Date().toISOString() } : n);
        } else {
          const newNewsItem = { ...currentNewsItem, id: `news_${Date.now()}`, timestamp: new Date().toISOString() };
          updatedNewsItems = [...(newsItems || []), newNewsItem];
        }
        updateNews(updatedNewsItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        toast({ title: t('general_success_toast_title'), description: t('admin_news_toast_news_saved') });
        setIsModalOpen(false);
        setCurrentNewsItem(initialFormState);
        setIsEditing(false);
      };

      const handleEdit = (newsItem) => {
        setCurrentNewsItem(newsItem);
        setIsEditing(true);
        setIsModalOpen(true);
      };

      const handleDelete = (id) => {
        const updatedNewsItems = (newsItems || []).filter(n => n.id !== id);
        updateNews(updatedNewsItems);
        toast({ title: t('general_success_toast_title'), description: t('admin_news_toast_news_deleted') });
        setNewsToDelete(null);
      };

      const openModalForNew = () => {
        setCurrentNewsItem(initialFormState);
        setIsEditing(false);
        setIsModalOpen(true);
      };

      return (
        <Card className="bg-slate-800/70 border-slate-700 shadow-xl rounded-xl">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6">
            <div className="mb-3 sm:mb-0">
              <CardTitle className="text-xl sm:text-2xl text-amber-400 flex items-center"><Newspaper className="mr-2 h-6 w-6 sm:h-7 sm:w-7"/>{t('admin_news_title')}</CardTitle>
              <CardDescription className="text-slate-400 text-xs sm:text-sm mt-1">{t('admin_news_desc')}</CardDescription>
            </div>
            <Button onClick={openModalForNew} className="bg-amber-500 hover:bg-amber-600 text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4">
              <PlusCircle size={18} className="mr-1.5 sm:mr-2" />{t('admin_news_add_new_button')}
            </Button>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {(newsItems || []).length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-10"
              >
                <Newspaper className="mx-auto h-16 w-16 text-slate-500 mb-4" />
                <p className="text-slate-400 text-lg">{t('admin_news_no_news')}</p>
              </motion.div>
            ) : (
              <motion.ul layout className="space-y-4">
                <AnimatePresence>
                  {(newsItems || []).map(n => (
                    <motion.li
                      key={n.id}
                      layout
                      initial={{ opacity: 0, y: -15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -30, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 250, damping: 25 }}
                    >
                      <Card className="bg-slate-700/50 border-slate-600 rounded-lg shadow-md hover:shadow-amber-500/20 transition-shadow duration-300">
                        <CardHeader className="p-3 sm:p-4">
                          <CardTitle className="text-lg sm:text-xl text-amber-300">{n.title}</CardTitle>
                          <CardDescription className="text-xs text-slate-400 mt-1">{t('projections_published_label')}: {new Date(n.timestamp).toLocaleString()}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-xs sm:text-sm text-slate-200 max-h-24 overflow-y-auto custom-scrollbar pr-1 p-3 sm:p-4">
                          {n.content}
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2 p-3 sm:p-4 border-t border-slate-600/50">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(n)} className="text-sky-400 border-sky-500 hover:bg-sky-500/10 h-8 px-3 text-xs">
                            <Edit3 size={14} className="mr-1" />{t('admin_projections_edit_button')}
                          </Button>
                           <Dialog open={newsToDelete === n.id} onOpenChange={(isOpen) => !isOpen && setNewsToDelete(null)}>
                            <DialogTrigger asChild>
                              <Button variant="destructive" size="sm" onClick={() => setNewsToDelete(n.id)} className="h-8 px-3 text-xs">
                                <Trash2 size={14} className="mr-1" />{t('admin_projections_delete_button')}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-800 border-slate-700 text-slate-50">
                              <DialogHeader>
                                <DialogTitle className="text-red-400 flex items-center"><AlertTriangle className="mr-2"/>{t('admin_projections_confirm_delete_title')}</DialogTitle>
                                <DialogDescription className="text-slate-400">{t('admin_projections_confirm_delete_desc')}</DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setNewsToDelete(null)}>{t('admin_projections_cancel_button')}</Button>
                                <Button variant="destructive" onClick={() => handleDelete(n.id)}>{t('admin_projections_delete_confirm_button')}</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </CardFooter>
                      </Card>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            )}
          </CardContent>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="bg-slate-800 border-slate-700 text-slate-50 sm:max-w-lg p-5 sm:p-6 rounded-lg">
              <DialogHeader className="mb-3 sm:mb-4">
                <DialogTitle className="text-xl sm:text-2xl text-amber-400">{isEditing ? t('admin_news_form_title_edit') : t('admin_news_form_title_add')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="title" className="text-slate-300 text-xs sm:text-sm">{t('admin_news_item_title_label')}</Label>
                  <Input id="title" name="title" value={currentNewsItem.title} onChange={handleInputChange} className="bg-slate-700 border-slate-600 focus:ring-amber-500 h-9 sm:h-10 text-sm" />
                </div>
                <div>
                  <Label htmlFor="content" className="text-slate-300 text-xs sm:text-sm">{t('admin_news_content_label')}</Label>
                  <Textarea id="content" name="content" value={currentNewsItem.content} onChange={handleInputChange} rows={6} className="bg-slate-700 border-slate-600 focus:ring-amber-500 custom-scrollbar text-sm" />
                </div>
                <DialogFooter className="pt-3 sm:pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="h-9 sm:h-10 text-xs sm:text-sm">{t('admin_projections_cancel_button')}</Button>
                  <Button type="submit" className="bg-amber-500 hover:bg-amber-600 h-9 sm:h-10 text-xs sm:text-sm">{t('admin_news_save_button')}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </Card>
      );
    }
  