
    import React from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
    import { Button } from "@/components/ui/button";
    import { Input } from "@/components/ui/input";
    import { Label } from "@/components/ui/label";
    import { Checkbox } from "@/components/ui/checkbox.jsx"; 
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { motion } from 'framer-motion';
    import { format } from 'date-fns';
    import { es } from 'date-fns/locale';
    import { useLanguage } from '@/contexts/LanguageContext';

    const UserEditDialog = ({ editingUser, onClose, onSave, onInputChange, t, isLoading, availableRoles = ['user', 'admin', 'manager', 'superadmin'] }) => {
      const { language } = useLanguage(); // Moved to the top

      if (!editingUser) return null;

      const currentUserRole = editingUser.role || 'user';

      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
          // Ensure the date string is valid before attempting to format
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return ''; // Invalid date
          return format(date, "yyyy-MM-dd'T'HH:mm");
        } catch (error) {
          console.error("Error formatting date for input:", error);
          return ''; 
        }
      };
      
      const formatCurrencyForInput = (amount) => {
        if (amount === null || typeof amount === 'undefined' || isNaN(parseFloat(amount))) return '0.00';
        return parseFloat(amount).toFixed(2);
      };

      return (
        <Dialog open={!!editingUser} onOpenChange={(isOpen) => !isOpen && onClose()}>
          <DialogContent className="bg-slate-800 border-slate-700 text-slate-50 sm:max-w-md md:max-w-lg p-6 rounded-xl shadow-2xl">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                {t('admin_user_edit_dialog_title')}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {t('admin_user_edit_dialog_desc')}
              </DialogDescription>
            </DialogHeader>
            
            <motion.form 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              onSubmit={(e) => { e.preventDefault(); onSave(); }} 
              className="space-y-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="username" className="text-slate-300 text-sm font-medium">{t('admin_user_edit_dialog_username_label')}</Label>
                  <Input 
                    id="username" 
                    value={editingUser.username || ''} 
                    onChange={(e) => onInputChange(e, 'username')} 
                    className="bg-slate-700 border-slate-600 text-white mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-slate-300 text-sm font-medium">{t('admin_user_edit_dialog_email_label')}</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={editingUser.email || ''} 
                    onChange={(e) => onInputChange(e, 'email')} 
                    className="bg-slate-700 border-slate-600 text-white mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="role" className="text-slate-300 text-sm font-medium">{t('admin_user_edit_dialog_role_label')}</Label>
                 <Select 
                  value={currentUserRole} 
                  onValueChange={(value) => onInputChange(value, 'role')} // Pass value directly for Shadcn Select
                >
                  <SelectTrigger id="role" className="w-full bg-slate-700 border-slate-600 text-white mt-1.5 focus:ring-pink-500 focus:border-pink-500">
                    <SelectValue placeholder={t('admin_user_edit_dialog_select_role_placeholder')} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600 text-slate-100">
                    {availableRoles.map(roleValue => (
                      <SelectItem key={roleValue} value={roleValue} className="hover:bg-slate-600 focus:bg-slate-600">
                        {t(`roles_${roleValue.toLowerCase()}`, roleValue.charAt(0).toUpperCase() + roleValue.slice(1))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="walletBalanceUSDT" className="text-slate-300 text-sm font-medium">{t('admin_user_edit_dialog_wallet_balance_label')}</Label>
                  <Input 
                    id="walletBalanceUSDT" 
                    type="number" 
                    step="0.01"
                    value={formatCurrencyForInput(editingUser.wallet_balance_usdt)} 
                    onChange={(e) => onInputChange(e, 'wallet_balance_usdt')} 
                    className="bg-slate-700 border-slate-600 text-white mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="referralEarningsUSDT" className="text-slate-300 text-sm font-medium">{t('admin_user_edit_dialog_referral_earnings_label')}</Label>
                  <Input 
                    id="referralEarningsUSDT" 
                    type="number" 
                    step="0.01"
                    value={formatCurrencyForInput(editingUser.referral_earnings_usdt)} 
                    onChange={(e) => onInputChange(e, 'referral_earnings_usdt')} 
                    className="bg-slate-700 border-slate-600 text-white mt-1.5"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3 pt-2">
                <Checkbox 
                  id="isSubscribed" 
                  checked={editingUser.is_subscribed || false} 
                  onCheckedChange={(checked) => onInputChange({ target: { type: 'checkbox', checked, name: 'is_subscribed' } }, 'is_subscribed')}
                  className="data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 border-slate-600"
                />
                <Label htmlFor="isSubscribed" className="text-slate-300 text-sm font-medium cursor-pointer">{t('admin_user_edit_dialog_subscribed_label')}</Label>
              </div>

              {editingUser.is_subscribed && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <Label htmlFor="subscriptionTier" className="text-slate-300 text-sm font-medium">{t('admin_user_edit_dialog_subscription_tier_label')}</Label>
                        <Input 
                            id="subscriptionTier" 
                            value={editingUser.subscription_tier || ''} 
                            onChange={(e) => onInputChange(e, 'subscription_tier')} 
                            className="bg-slate-700 border-slate-600 text-white mt-1.5"
                        />
                    </div>
                    <div>
                        <Label htmlFor="subscriptionEndDate" className="text-slate-300 text-sm font-medium">{t('user_details_subscription_end_date')}</Label>
                        <Input 
                            id="subscriptionEndDate" 
                            type="datetime-local"
                            value={formatDateForInput(editingUser.subscription_end_date)} 
                            onChange={(e) => onInputChange(e, 'subscription_end_date')} 
                            className="bg-slate-700 border-slate-600 text-white mt-1.5"
                        />
                    </div>
                </div>
              )}
              
              <DialogFooter className="pt-8">
                <Button type="button" variant="outline" onClick={onClose} className="text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white transition-colors duration-200" disabled={isLoading}>
                  {t('admin_user_edit_dialog_cancel_button')}
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold transition-all duration-300 transform hover:scale-105" disabled={isLoading}>
                  {isLoading ? t('loading_button_processing') : t('admin_user_edit_dialog_save_button')}
                </Button>
              </DialogFooter>
            </motion.form>
          </DialogContent>
        </Dialog>
      );
    };

    export default UserEditDialog;
  