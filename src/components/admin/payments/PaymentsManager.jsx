
    import React, { useState } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { CreditCard, ListFilter, Edit3, XCircle } from 'lucide-react';
    import { useLanguage } from '@/contexts/LanguageContext';
    import PendingPaymentsList from '@/components/admin/payments/PendingPaymentsList';
    import ProcessedPaymentsList from '@/components/admin/payments/ProcessedPaymentsList';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Textarea } from '@/components/ui/textarea';
    import { Label } from '@/components/ui/label';
    import LoadingSpinner from '@/components/ui/LoadingSpinner';

    export function PaymentsManager({ payments = [], pendingPayments = [], processedPayments = [], onApprove, onReject }) {
      const { t } = useLanguage();
      const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
      const [currentPaymentToReject, setCurrentPaymentToReject] = useState(null);
      const [rejectionReason, setRejectionReason] = useState('');
      const [isProcessing, setIsProcessing] = useState(false);

      const openRejectModal = (payment) => {
        setCurrentPaymentToReject(payment);
        setRejectionReason('');
        setIsRejectModalOpen(true);
      };

      const handleConfirmReject = async () => {
        if (!currentPaymentToReject) return;
        setIsProcessing(true);
        await onReject(currentPaymentToReject.id, rejectionReason);
        setIsProcessing(false);
        setIsRejectModalOpen(false);
        setCurrentPaymentToReject(null);
        setRejectionReason('');
      };
      
      const handleConfirmApprove = async (paymentId) => {
        setIsProcessing(true);
        await onApprove(paymentId);
        setIsProcessing(false);
      };


      return (
        <>
          <Card className="bg-slate-800/70 border-slate-700 shadow-xl rounded-xl">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl text-green-400 flex items-center">
                <CreditCard className="mr-2 h-6 w-6 sm:h-7 sm:w-7"/>
                {t('admin_payments_title')}
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs sm:text-sm mt-1">
                {t('admin_payments_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <section>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-slate-200 flex items-center">
                  <ListFilter className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-green-400"/>
                  {t('admin_payments_status_pending')}
                </h3>
                <PendingPaymentsList 
                  pendingPayments={pendingPayments} 
                  onApprove={handleConfirmApprove} 
                  onReject={openRejectModal} 
                  t={t} 
                  isProcessing={isProcessing}
                  currentProcessingId={isProcessing && currentPaymentToReject ? currentPaymentToReject.id : null}
                />
              </section>
              <section className="mt-6 sm:mt-8">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-slate-200">
                  {t('admin_payments_history_title') || 'Processed Payments'}
                </h3>
                <ProcessedPaymentsList processedPayments={processedPayments} t={t} />
              </section>
            </CardContent>
          </Card>

          <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
            <DialogContent className="bg-slate-800 border-slate-700 text-slate-50 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl text-red-400">{t('admin_payments_reject_modal_title') || 'Reject Payment'}</DialogTitle>
                <DialogDescription className="text-slate-400">
                  {t('admin_payments_reject_modal_desc', { username: currentPaymentToReject?.username || currentPaymentToReject?.user_id }) || `You are about to reject the payment for ${currentPaymentToReject?.username || currentPaymentToReject?.user_id}.`}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="rejectionReason" className="text-slate-300">{t('admin_payments_reject_modal_reason_label') || 'Reason for Rejection (Optional)'}</Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-slate-50 focus:ring-red-500 mt-1"
                  placeholder={t('admin_payments_reject_modal_reason_placeholder') || 'Enter reason...'}
                  disabled={isProcessing}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRejectModalOpen(false)} className="text-slate-300 border-slate-600 hover:bg-slate-700" disabled={isProcessing}>
                  {t('admin_modal_cancel_button') || 'Cancel'}
                </Button>
                <Button onClick={handleConfirmReject} variant="destructive" disabled={isProcessing}>
                  {isProcessing ? <LoadingSpinner size="sm" /> : <><XCircle size={16} className="mr-2" /> {t('admin_payments_reject_confirm_button') || 'Confirm Rejection'}</>}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    }
  