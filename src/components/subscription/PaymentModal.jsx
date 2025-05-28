
    import React, { useState } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Copy, UploadCloud } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { useLanguage } from '@/contexts/LanguageContext';
    import { useAuth } from '@/contexts/AuthContext';
    import { purchasePlanRequest } from '@/contexts/authUtils/paymentUtils';
    import { supabase } from '@/lib/supabaseClient';
    import { v4 as uuidv4 } from 'uuid';
    import LoadingSpinner from '@/components/ui/LoadingSpinner';

    const USDT_TRC20_WALLET = "TFMsBhZmphCqxdWFAVk6dSTp767ZP5pNHc";

    const PaymentModal = ({ isOpen, onOpenChange, selectedPlan, onPaymentSubmitted }) => {
      const { t } = useLanguage();
      const { toast } = useToast();
      const { user } = useAuth();
      const [transactionHash, setTransactionHash] = useState('');
      const [paymentProofFile, setPaymentProofFile] = useState(null);
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [fileName, setFileName] = useState('');

      const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast({
          title: t('subscription_wallet_address_copied_title'),
          description: t('subscription_wallet_address_copied_desc'),
        });
      };

      const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
          if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast({ title: t('general_error_copy_toast_title'), description: t('subscription_error_file_too_large'), variant: "destructive" });
            setPaymentProofFile(null);
            setFileName('');
            return;
          }
          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
          if (!allowedTypes.includes(file.type)) {
            toast({ title: t('general_error_copy_toast_title'), description: t('subscription_error_invalid_file_type'), variant: "destructive" });
            setPaymentProofFile(null);
            setFileName('');
            return;
          }
          setPaymentProofFile(file);
          setFileName(file.name);
        }
      };
      
      const uploadPaymentProof = async () => {
        if (!paymentProofFile) return null;
        if (!user || !user.id) return null;

        const fileExt = paymentProofFile.name.split('.').pop();
        const uniqueFileName = `${user.id}_${uuidv4()}.${fileExt}`;
        const filePath = `payment_proofs/${uniqueFileName}`;

        const { error: uploadError } = await supabase.storage
          .from('payment-proofs') 
          .upload(filePath, paymentProofFile);

        if (uploadError) {
          console.error('Error uploading payment proof:', uploadError);
          toast({ title: t('general_error_copy_toast_title'), description: t('subscription_error_upload_failed'), variant: "destructive" });
          return null;
        }
        
        const { data: publicUrlData } = supabase.storage.from('payment-proofs').getPublicUrl(filePath);
        return publicUrlData.publicUrl;
      };


      const handleSubmitPayment = async () => {
        if (!transactionHash.trim()) {
          toast({ title: t('general_error_copy_toast_title'), description: t('subscription_error_tx_hash_required'), variant: "destructive" });
          return;
        }
        if (!user || !user.id || !user.email || !user.username) {
          toast({ title: t('general_error_copy_toast_title'), description: t('subscription_error_user_not_found'), variant: "destructive" });
          return;
        }
        if (!selectedPlan) {
          toast({ title: t('general_error_copy_toast_title'), description: t('subscription_error_plan_not_selected'), variant: "destructive" });
          return;
        }

        setIsSubmitting(true);
        let paymentProofUrl = null;
        if (paymentProofFile) {
          paymentProofUrl = await uploadPaymentProof();
          if (!paymentProofUrl) {
            setIsSubmitting(false);
            return; 
          }
        }
        
        const result = await purchasePlanRequest(
          user.auth_user_id, 
          user.username,
          user.email,
          t(selectedPlan.nameKey), 
          selectedPlan.priceNum, 
          transactionHash,
          paymentProofUrl,
          t
        );
        setIsSubmitting(false);

        if (result.success) {
          toast({
            title: t('subscription_payment_sent_toast_title'),
            description: t('subscription_payment_sent_toast_desc'),
            duration: 7000,
          });
          setTransactionHash('');
          setPaymentProofFile(null);
          setFileName('');
          onOpenChange(false);
          if(onPaymentSubmitted) onPaymentSubmitted();
        } else {
          toast({
            title: t('general_error_copy_toast_title'),
            description: result.message || t('subscription_error_payment_request_failed'),
            variant: "destructive",
          });
        }
      };

      if (!selectedPlan) return null;

      return (
        <Dialog open={isOpen} onOpenChange={(open) => {
          if (!isSubmitting) onOpenChange(open);
        }}>
          <DialogContent className="bg-slate-800 border-slate-700 text-slate-50 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl text-sky-400">{t('subscription_modal_title', { planName: t(selectedPlan.nameKey) })}</DialogTitle>
              <DialogDescription className="text-slate-400">
                {t('subscription_modal_desc', { price: t(selectedPlan.priceKey) })}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <Label className="text-slate-300">{t('subscription_wallet_address_label')}</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input 
                    type="text" 
                    readOnly 
                    value={USDT_TRC20_WALLET} 
                    className="bg-slate-700 border-slate-600 text-slate-200"
                  />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(USDT_TRC20_WALLET)} className="text-sky-400 border-sky-500 hover:bg-sky-500/20">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-amber-400 mt-1">{t('subscription_wallet_important_note')}</p>
              </div>
              <div>
                <Label htmlFor="transactionHash" className="text-slate-300">{t('subscription_tx_hash_label')}</Label>
                <Input 
                  id="transactionHash" 
                  type="text" 
                  value={transactionHash}
                  onChange={(e) => setTransactionHash(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-slate-50 focus:ring-sky-500 mt-1"
                  placeholder={t('subscription_tx_hash_placeholder')} 
                  disabled={isSubmitting}
                />
                <p className="text-xs text-slate-400 mt-1">{t('subscription_tx_hash_note')}</p>
              </div>
              <div>
                <Label htmlFor="paymentProof" className="text-slate-300">{t('subscription_payment_proof_label') || 'Payment Proof (Optional)'}</Label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md hover:border-sky-500 transition-colors">
                  <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-10 w-10 text-slate-400" />
                    <div className="flex text-sm text-slate-500">
                      <label
                        htmlFor="paymentProof"
                        className="relative cursor-pointer rounded-md font-medium text-sky-400 hover:text-sky-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-800 focus-within:ring-sky-500"
                      >
                        <span>{t('subscription_upload_file_button') || 'Upload a file'}</span>
                        <input id="paymentProof" name="paymentProof" type="file" className="sr-only" onChange={handleFileChange} disabled={isSubmitting} accept="image/jpeg,image/png,image/gif,application/pdf" />
                      </label>
                      <p className="pl-1">{t('subscription_drag_drop_text') || 'or drag and drop'}</p>
                    </div>
                    {fileName ? (
                      <p className="text-xs text-green-400">{t('subscription_file_selected_text') || 'File selected'}: {fileName}</p>
                    ) : (
                      <p className="text-xs text-slate-500">{t('subscription_file_types_note') || 'PNG, JPG, GIF, PDF up to 5MB'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} className="text-slate-300 border-slate-600 hover:bg-slate-700" disabled={isSubmitting}>{t('subscription_modal_cancel_button')}</Button>
              <Button onClick={handleSubmitPayment} className="bg-sky-500 hover:bg-sky-600" disabled={isSubmitting}>
                {isSubmitting ? <LoadingSpinner size="sm" /> : t('subscription_modal_submit_button')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default PaymentModal;
  