
    import React, { useState, useMemo, useEffect } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Button } from '@/components/ui/button';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { motion, AnimatePresence } from 'framer-motion';
    import { DollarSign, ListFilter, Search, RotateCcw, AlertTriangle, PlusCircle } from 'lucide-react';
    import { useLanguage } from '@/contexts/LanguageContext';
    import { usePagos } from '@/hooks/usePagos'; 
    import ManualPaymentCard from './ManualPaymentCard';
    import ManualPaymentForm from './ManualPaymentForm'; 
    import LoadingSpinner from '@/components/ui/LoadingSpinner';
    import {
      Accordion,
      AccordionContent,
      AccordionItem,
      AccordionTrigger,
    } from "@/components/ui/accordion";

    export function ManualPaymentsManager({ onRefresh: globalOnRefresh }) {
      const { t } = useLanguage();
      const { pagos: manualPaymentsData, loading: isLoadingData, error: dataError, refetchPagos } = usePagos();
      
      const [searchTerm, setSearchTerm] = useState('');
      const [statusFilter, setStatusFilter] = useState('all');
      const [sortOrder, setSortOrder] = useState('desc');
      const [showPaymentForm, setShowPaymentForm] = useState(false);

      const handleRefresh = () => {
        refetchPagos();
        if (globalOnRefresh) {
          globalOnRefresh(); 
        }
      };

      const handlePaymentRegistered = () => {
        refetchPagos(); // Refresca la lista de pagos después de registrar uno nuevo
        setShowPaymentForm(false); // Opcional: cierra el formulario
      };
      
      const safeManualPayments = Array.isArray(manualPaymentsData) ? manualPaymentsData : [];

      const filteredAndSortedPayments = useMemo(() => {
        return safeManualPayments
          .filter(payment => {
            const term = searchTerm.toLowerCase();
            const statusMatch = statusFilter === 'all' || payment.status?.toLowerCase() === statusFilter;
            const searchMatch = (
              payment.email?.toLowerCase().includes(term) ||
              payment.username?.toLowerCase().includes(term) ||
              payment.comprobante?.toLowerCase().includes(term) ||
              payment.user_id?.toLowerCase().includes(term) || 
              payment.usuario_id?.toLowerCase().includes(term) || 
              payment.monto?.toString().includes(term)
            );
            return statusMatch && searchMatch;
          })
          .sort((a, b) => {
            const dateA = new Date(a.fecha_pago);
            const dateB = new Date(b.fecha_pago);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
          });
      }, [safeManualPayments, searchTerm, statusFilter, sortOrder]);

      if (isLoadingData && safeManualPayments.length === 0) {
        return (
          <div className="flex justify-center items-center py-10 min-h-[300px]">
            <LoadingSpinner size="lg" />
          </div>
        );
      }

      if (dataError) {
        return (
          <Card className="bg-red-900/30 border-red-700 shadow-xl rounded-xl">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center">
                <AlertTriangle className="mr-2"/> {t('error_loading_payments_title') || "Error Loading Payments"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-300">{t('error_loading_payments_message') || "Could not load manual payments."}</p>
              {dataError.message && <p className="text-xs text-red-400 mt-2">{dataError.message}</p>}
              <Button onClick={handleRefresh} variant="destructive" className="mt-4">
                {t('try_again_button_label') || "Try Again"}
              </Button>
            </CardContent>
          </Card>
        );
      }

      return (
        <Card className="bg-slate-800/70 border-slate-700 shadow-xl rounded-xl">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <CardTitle className="text-xl sm:text-2xl text-cyan-400 flex items-center">
                  <DollarSign className="mr-2 h-6 w-6 sm:h-7 sm:w-7"/>
                  {t('admin_manual_payments_title')}
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs sm:text-sm mt-1">
                  {t('admin_manual_payments_desc')}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowPaymentForm(prev => !prev)} variant="outline" size="sm" className="text-sky-400 border-sky-400 hover:bg-sky-400/10">
                  <PlusCircle size={16} className="mr-2"/> {showPaymentForm ? t('admin_manual_payment_form_hide_button') : t('admin_manual_payment_form_show_button')}
                </Button>
                <Button onClick={handleRefresh} variant="outline" size="sm" className="text-cyan-400 border-cyan-400 hover:bg-cyan-400/10">
                  <RotateCcw size={16} className="mr-2"/> {isLoadingData ? t('loading_short') : t('refresh_button_label')}
                </Button>
              </div>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder={t('admin_manual_payments_search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bg-slate-700 border-slate-600 focus:border-cyan-500 text-slate-200"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-slate-700 border-slate-600 text-slate-200">
                  <SelectValue placeholder={t('admin_manual_payments_filter_status_placeholder')} />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600 text-slate-200">
                  <SelectItem value="all">{t('admin_manual_payments_filter_all')}</SelectItem>
                  <SelectItem value="completado">{t('admin_manual_payments_filter_completed')}</SelectItem>
                  <SelectItem value="pendiente">{t('admin_manual_payments_filter_pending')}</SelectItem>
                  <SelectItem value="rechazado">{t('admin_manual_payments_filter_rejected')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-full sm:w-[180px] bg-slate-700 border-slate-600 text-slate-200">
                  <SelectValue placeholder={t('admin_manual_payments_sort_placeholder')} />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600 text-slate-200">
                  <SelectItem value="desc">{t('admin_manual_payments_sort_desc')}</SelectItem>
                  <SelectItem value="asc">{t('admin_manual_payments_sort_asc')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <AnimatePresence>
              {showPaymentForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden mb-6"
                >
                  <ManualPaymentForm onPaymentRegistered={handlePaymentRegistered} />
                </motion.div>
              )}
            </AnimatePresence>

            {filteredAndSortedPayments.length > 0 ? (
              <ul className="space-y-3 sm:space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
                <AnimatePresence>
                  {filteredAndSortedPayments.map(payment => (
                    <ManualPaymentCard 
                      key={payment.id || payment.pago_id} 
                      payment={payment} 
                      t={t} 
                    />
                  ))}
                </AnimatePresence>
              </ul>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8 sm:py-10"
              >
                <ListFilter className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-slate-500 mb-3 sm:mb-4" />
                <p className="text-slate-400 text-base sm:text-lg">{t('admin_manual_payments_no_data')}</p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      );
    }
  