
    import React, { useState } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { useLanguage } from '@/contexts/LanguageContext';
    import { DollarSign, Hash, Mail, FileText, Send } from 'lucide-react';
    import LoadingSpinner from '@/components/ui/LoadingSpinner';

    const ManualPaymentForm = ({ onPaymentRegistered }) => {
      const [userEmail, setUserEmail] = useState('');
      const [amount, setAmount] = useState('');
      const [txHash, setTxHash] = useState('');
      const [notes, setNotes] = useState('');
      const [loading, setLoading] = useState(false);
      const { toast } = useToast();
      const { t } = useLanguage();

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userEmail || !amount || !txHash) {
          toast({
            title: t('general_error_toast_title'),
            description: t('admin_manual_payment_form_error_all_fields'),
            variant: "destructive",
          });
          return;
        }
        setLoading(true);
        
        try {
          const { data, error } = await supabase.rpc('process_manual_usdt_payment', {
            p_user_email: userEmail,
            p_amount: parseFloat(amount),
            p_tx_hash: txHash,
            p_notes: notes || null 
          });

          if (error) throw error;

          if (data && data.status === 'success') {
            toast({
              title: t('admin_manual_payment_form_success_title'),
              description: `${t('admin_manual_payment_form_success_desc')} ID: ${data.payment_id}. ${t('admin_manual_payment_form_new_balance')}: ${data.new_balance} USDT`,
            });
            setUserEmail('');
            setAmount('');
            setTxHash('');
            setNotes('');
            if (onPaymentRegistered) {
              onPaymentRegistered();
            }
          } else if (data && data.status === 'error') {
             throw new Error(data.message || t('admin_manual_payment_form_error_generic_rpc'));
          } else {
            throw new Error(t('admin_manual_payment_form_error_unknown_rpc'));
          }

        } catch (error) {
          console.error('Error processing payment:', error);
          toast({
            title: t('general_error_toast_title'),
            description: error.message || t('admin_manual_payment_form_error_generic_submission'),
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };

      return (
        <Card className="bg-slate-700/50 border-slate-600 shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="text-lg text-sky-300 flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              {t('admin_manual_payment_form_title')}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {t('admin_manual_payment_form_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="userEmail" className="text-slate-300 flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-sky-400" />
                  {t('admin_manual_payment_form_email_label')}
                </Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder={t('admin_manual_payment_form_email_placeholder')}
                  className="mt-1 bg-slate-600 border-slate-500 text-slate-100 placeholder:text-slate-400"
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount" className="text-slate-300 flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-sky-400" />
                  {t('admin_manual_payment_form_amount_label')} (USDT)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  placeholder="e.g., 50.00"
                  className="mt-1 bg-slate-600 border-slate-500 text-slate-100 placeholder:text-slate-400"
                  required
                />
              </div>
              <div>
                <Label htmlFor="txHash" className="text-slate-300 flex items-center">
                  <Hash className="mr-2 h-4 w-4 text-sky-400" />
                  {t('admin_manual_payment_form_txhash_label')}
                </Label>
                <Input
                  id="txHash"
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder={t('admin_manual_payment_form_txhash_placeholder')}
                  className="mt-1 bg-slate-600 border-slate-500 text-slate-100 placeholder:text-slate-400"
                  required
                />
              </div>
              <div>
                <Label htmlFor="notes" className="text-slate-300 flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-sky-400" />
                  {t('admin_manual_payment_form_notes_label')}
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('admin_manual_payment_form_notes_placeholder')}
                  className="mt-1 bg-slate-600 border-slate-500 text-slate-100 placeholder:text-slate-400"
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white" disabled={loading}>
                {loading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {loading ? t('admin_manual_payment_form_processing_button') : t('admin_manual_payment_form_submit_button')}
              </Button>
            </form>
          </CardContent>
        </Card>
      );
    };

    export default ManualPaymentForm;
  