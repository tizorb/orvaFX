
    import React, { useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
    import { motion, AnimatePresence } from 'framer-motion';
    import { PlusCircle, Edit3, Trash2, TrendingUp, AlertTriangle, BarChart2 } from 'lucide-react';
    import { useLanguage } from '@/contexts/LanguageContext';

    const initialFormState = {
      id: null,
      currencyPair: '',
      entryPrice: '',
      stopLoss: '',
      takeProfit: '',
      analysis: '',
      timestamp: ''
    };

    export function ProjectionsManager({ projections = [], updateProjections, toast }) {
      const { t } = useLanguage();
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [currentProjection, setCurrentProjection] = useState(initialFormState);
      const [isEditing, setIsEditing] = useState(false);
      const [projectionToDelete, setProjectionToDelete] = useState(null);

      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentProjection(prev => ({ ...prev, [name]: value }));
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!currentProjection.currencyPair || !currentProjection.entryPrice || !currentProjection.stopLoss || !currentProjection.takeProfit || !currentProjection.analysis) {
          toast({ title: t('general_error_toast_title'), description: t('admin_projections_toast_fill_all_fields'), variant: "destructive" });
          return;
        }

        let updatedProjections;
        if (isEditing) {
          updatedProjections = (projections || []).map(p => p.id === currentProjection.id ? { ...currentProjection, timestamp: new Date().toISOString() } : p);
        } else {
          const newProjection = { ...currentProjection, id: `proj_${Date.now()}`, timestamp: new Date().toISOString() };
          updatedProjections = [...(projections || []), newProjection];
        }
        updateProjections(updatedProjections.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        toast({ title: t('general_success_toast_title'), description: t('admin_projections_toast_projection_saved') });
        setIsModalOpen(false);
        setCurrentProjection(initialFormState);
        setIsEditing(false);
      };

      const handleEdit = (projection) => {
        setCurrentProjection(projection);
        setIsEditing(true);
        setIsModalOpen(true);
      };

      const handleDelete = (id) => {
        const updatedProjections = (projections || []).filter(p => p.id !== id);
        updateProjections(updatedProjections);
        toast({ title: t('general_success_toast_title'), description: t('admin_projections_toast_projection_deleted') });
        setProjectionToDelete(null);
      };

      const openModalForNew = () => {
        setCurrentProjection(initialFormState);
        setIsEditing(false);
        setIsModalOpen(true);
      };
      
      const getProjectionStatusText = (analysisText) => {
        if (!analysisText) return t('projections_status_neutral');
        const lowerAnalysis = analysisText.toLowerCase();
        if (lowerAnalysis.includes('compra') || lowerAnalysis.includes('alcista') || lowerAnalysis.includes('buy') || lowerAnalysis.includes('bullish')) {
          return t('projections_status_bullish');
        }
        if (lowerAnalysis.includes('venta') || lowerAnalysis.includes('bajista') || lowerAnalysis.includes('sell') || lowerAnalysis.includes('bearish')) {
          return t('projections_status_bearish');
        }
        return t('projections_status_neutral');
      };

      return (
        <Card className="bg-slate-800/70 border-slate-700 shadow-xl rounded-xl">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6">
            <div className="mb-3 sm:mb-0">
              <CardTitle className="text-xl sm:text-2xl text-sky-400 flex items-center"><BarChart2 className="mr-2 h-6 w-6 sm:h-7 sm:w-7"/>{t('admin_projections_title')}</CardTitle>
              <CardDescription className="text-slate-400 text-xs sm:text-sm mt-1">{t('admin_projections_desc')}</CardDescription>
            </div>
            <Button onClick={openModalForNew} className="bg-sky-500 hover:bg-sky-600 text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4">
              <PlusCircle size={18} className="mr-1.5 sm:mr-2" />{t('admin_projections_add_new_button')}
            </Button>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {(projections || []).length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-10"
              >
                <TrendingUp className="mx-auto h-16 w-16 text-slate-500 mb-4" />
                <p className="text-slate-400 text-lg">{t('admin_projections_no_projections')}</p>
              </motion.div>
            ) : (
              <motion.ul layout className="space-y-4">
                <AnimatePresence>
                  {(projections || []).map(p => (
                    <motion.li
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: -15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -30, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 250, damping: 25 }}
                    >
                      <Card className="bg-slate-700/50 border-slate-600 rounded-lg shadow-md hover:shadow-sky-500/20 transition-shadow duration-300">
                        <CardHeader className="p-3 sm:p-4">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg sm:text-xl text-sky-300">{p.currencyPair}</CardTitle>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ (p.analysis || '').toLowerCase().includes('compra') || (p.analysis || '').toLowerCase().includes('alcista') || (p.analysis || '').toLowerCase().includes('buy') || (p.analysis || '').toLowerCase().includes('bullish') ? 'bg-green-500/20 text-green-300' : ((p.analysis || '').toLowerCase().includes('venta') || (p.analysis || '').toLowerCase().includes('bajista') || (p.analysis || '').toLowerCase().includes('sell') || (p.analysis || '').toLowerCase().includes('bearish') ? 'bg-red-500/20 text-red-300' : 'bg-slate-600 text-slate-300' ) }`}>
                              {getProjectionStatusText(p.analysis)}
                            </span>
                          </div>
                          <CardDescription className="text-xs text-slate-400 mt-1">{t('projections_published_label')}: {new Date(p.timestamp).toLocaleString()}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-xs sm:text-sm text-slate-200 space-y-1.5 p-3 sm:p-4">
                          <p><strong>{t('projections_entry_label')}:</strong> {p.entryPrice}</p>
                          <p><strong>{t('projections_stop_loss_label')}:</strong> {p.stopLoss}</p>
                          <p><strong>{t('projections_take_profit_label')}:</strong> {p.takeProfit}</p>
                          <p className="text-xs text-slate-300 max-h-20 overflow-y-auto custom-scrollbar pr-1 mt-1.5 pt-1.5 border-t border-slate-600/50"><strong>{t('projections_detailed_analysis_label')}:</strong> {p.analysis}</p>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2 p-3 sm:p-4 border-t border-slate-600/50">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(p)} className="text-amber-400 border-amber-500 hover:bg-amber-500/10 h-8 px-3 text-xs">
                            <Edit3 size={14} className="mr-1" />{t('admin_projections_edit_button')}
                          </Button>
                          <Dialog open={projectionToDelete === p.id} onOpenChange={(isOpen) => !isOpen && setProjectionToDelete(null)}>
                            <DialogTrigger asChild>
                              <Button variant="destructive" size="sm" onClick={() => setProjectionToDelete(p.id)} className="h-8 px-3 text-xs">
                                <Trash2 size={14} className="mr-1" />{t('admin_projections_delete_button')}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-800 border-slate-700 text-slate-50">
                              <DialogHeader>
                                <DialogTitle className="text-red-400 flex items-center"><AlertTriangle className="mr-2"/>{t('admin_projections_confirm_delete_title')}</DialogTitle>
                                <DialogDescription className="text-slate-400">{t('admin_projections_confirm_delete_desc')}</DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setProjectionToDelete(null)}>{t('admin_projections_cancel_button')}</Button>
                                <Button variant="destructive" onClick={() => handleDelete(p.id)}>{t('admin_projections_delete_confirm_button')}</Button>
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
                <DialogTitle className="text-xl sm:text-2xl text-sky-400">{isEditing ? t('admin_projections_form_title_edit') : t('admin_projections_form_title_add')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="currencyPair" className="text-slate-300 text-xs sm:text-sm">{t('admin_projections_currency_pair_label')}</Label>
                  <Input id="currencyPair" name="currencyPair" value={currentProjection.currencyPair} onChange={handleInputChange} className="bg-slate-700 border-slate-600 focus:ring-sky-500 h-9 sm:h-10 text-sm" />
                </div>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="entryPrice" className="text-slate-300 text-xs sm:text-sm">{t('admin_projections_entry_price_label')}</Label>
                    <Input id="entryPrice" name="entryPrice" type="number" step="any" value={currentProjection.entryPrice} onChange={handleInputChange} className="bg-slate-700 border-slate-600 focus:ring-sky-500 h-9 sm:h-10 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="stopLoss" className="text-slate-300 text-xs sm:text-sm">{t('admin_projections_stop_loss_label')}</Label>
                    <Input id="stopLoss" name="stopLoss" type="number" step="any" value={currentProjection.stopLoss} onChange={handleInputChange} className="bg-slate-700 border-slate-600 focus:ring-sky-500 h-9 sm:h-10 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="takeProfit" className="text-slate-300 text-xs sm:text-sm">{t('admin_projections_take_profit_label')}</Label>
                    <Input id="takeProfit" name="takeProfit" type="number" step="any" value={currentProjection.takeProfit} onChange={handleInputChange} className="bg-slate-700 border-slate-600 focus:ring-sky-500 h-9 sm:h-10 text-sm" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="analysis" className="text-slate-300 text-xs sm:text-sm">{t('admin_projections_analysis_label')}</Label>
                  <Textarea id="analysis" name="analysis" value={currentProjection.analysis} onChange={handleInputChange} rows={4} className="bg-slate-700 border-slate-600 focus:ring-sky-500 custom-scrollbar text-sm" />
                </div>
                <DialogFooter className="pt-3 sm:pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="h-9 sm:h-10 text-xs sm:text-sm">{t('admin_projections_cancel_button')}</Button>
                  <Button type="submit" className="bg-sky-500 hover:bg-sky-600 h-9 sm:h-10 text-xs sm:text-sm">{t('admin_projections_save_button')}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </Card>
      );
    }
  