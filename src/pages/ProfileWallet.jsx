
    import React, { useState, useEffect, useCallback } from 'react';
    import { useAuth } from '@/contexts/AuthContext';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { Wallet, History, MessageSquare, Shield } from 'lucide-react'; // Added Shield for security
    import { useLanguage } from '@/contexts/LanguageContext';
    import { supabase } from '@/lib/supabaseClient'; 
    import UserSupportMessages from '@/components/support/UserSupportMessages';
    import ProfileInfoCard from '@/components/profile/ProfileInfoCard';
    import WalletTabContent from '@/components/profile/WalletTabContent';
    import HistoryTabContent from '@/components/profile/HistoryTabContent';
    import MfaManagement from '@/components/profile/MfaManagement';

    const MIN_WITHDRAWAL_AMOUNT = 10; 
    const WITHDRAWAL_COOLDOWN_HOURS = 24;

    export function ProfileWallet() {
      const { user, setUser: updateUserContextProfile, refreshUserProfile, requestWithdrawal, addReferralCodeToExistingUser } = useAuth();
      const { toast } = useToast();
      const { t } = useLanguage();
      
      const [profileData, setProfileData] = useState(user);
      const [withdrawalAmount, setWithdrawalAmount] = useState('');
      const [walletAddress, setWalletAddress] = useState(user?.wallet_address_usdt || '');
      const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);
      const [withdrawalHistory, setWithdrawalHistory] = useState([]);
      const [paymentHistory, setPaymentHistory] = useState([]);
      const [referralCodeInput, setReferralCodeInput] = useState('');

      const fetchUserFinancialHistory = useCallback(async () => {
        if (!user?.id) return;
        try {
          const { data: withdrawals, error: wError } = await supabase
            .from('withdrawal_requests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (wError) throw wError;
          setWithdrawalHistory(withdrawals || []);

          const { data: payments, error: pError } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (pError) throw pError;
          setPaymentHistory(payments || []);

        } catch (error) {
          console.error("Error fetching financial history:", error);
          toast({ variant: "destructive", title: t('profile_toast_error_title'), description: t('profile_history_fetch_error') });
        }
      }, [user?.id, t, toast]);

      useEffect(() => {
        setProfileData(user);
        setWalletAddress(user?.wallet_address_usdt || '');
        if (user?.id) {
          fetchUserFinancialHistory();
        }
      }, [user, fetchUserFinancialHistory]);

      const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
      };

      const handleProfileSave = async () => {
        if (!user?.id) return;
        try {
          const updates = {
            username: profileData.username,
            email: profileData.email, 
            wallet_address_usdt: walletAddress,
          };

          const { data: updatedUser, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

          if (error) throw error;

          updateUserContextProfile(updatedUser); 
          toast({ title: t('profile_toast_profile_updated_title'), description: t('profile_toast_profile_updated_desc') });
        } catch (error) {
          console.error("Error saving profile:", error);
          toast({ variant: "destructive", title: t('profile_toast_error_title'), description: error.message || t('profile_error_saving') });
        }
      };

      const handleWithdrawalRequest = async () => {
        const amount = parseFloat(withdrawalAmount);
        if (isNaN(amount) || amount <= 0) {
          toast({ variant: "destructive", title: t('profile_toast_error_title'), description: t('profile_toast_invalid_amount_desc') });
          return;
        }
        if (amount < MIN_WITHDRAWAL_AMOUNT) {
          toast({ variant: "destructive", title: t('profile_toast_error_title'), description: t('profile_toast_min_withdrawal_desc', { amount: MIN_WITHDRAWAL_AMOUNT }) });
          return;
        }
        if (!walletAddress.trim()) {
          toast({ variant: "destructive", title: t('profile_toast_error_title'), description: t('profile_toast_wallet_address_required_desc') });
          return;
        }
        
        setIsSubmittingWithdrawal(true);
        const result = await requestWithdrawal(user.id, amount, walletAddress.trim());
        setIsSubmittingWithdrawal(false);

        if (result.success) {
          toast({ title: t('profile_toast_withdrawal_success_title'), description: result.message || t('profile_toast_withdrawal_success_desc', { amount: amount.toFixed(2) }) });
          setWithdrawalAmount('');
          await refreshUserProfile(); 
          fetchUserFinancialHistory(); 
        } else {
          toast({ variant: "destructive", title: t('profile_toast_error_title'), description: result.message || t('profile_withdrawal_error_generic') });
        }
      };

      const handleApplyReferralCode = async () => {
        if (!referralCodeInput.trim()) {
          toast({ variant: "destructive", title: t('profile_toast_error_title'), description: t('profile_referral_code_empty') });
          return;
        }
        const result = await addReferralCodeToExistingUser(user.id, referralCodeInput.trim());
        if (result.success) {
          toast({ title: t('profile_referral_success_title'), description: result.message });
          setReferralCodeInput('');
          await refreshUserProfile();
        } else {
          toast({ variant: "destructive", title: t('profile_toast_error_title'), description: result.message });
        }
      };

      if (!profileData) {
        return <div className="text-center text-slate-300">{t('loading_app')}</div>;
      }

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <ProfileInfoCard
            profileData={profileData}
            handleProfileChange={handleProfileChange}
            walletAddress={walletAddress}
            setWalletAddress={setWalletAddress}
            handleProfileSave={handleProfileSave}
            referralCodeInput={referralCodeInput}
            setReferralCodeInput={setReferralCodeInput}
            handleApplyReferralCode={handleApplyReferralCode}
            t={t}
          />

          <Tabs defaultValue="wallet" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-slate-800/60 p-1 h-auto">
              <TabsTrigger value="wallet" className="data-[state=active]:bg-sky-600 data-[state=active]:text-white data-[state=active]:shadow-md py-2.5 text-sm sm:text-base">
                <Wallet size={18} className="mr-0 sm:mr-2"/> <span className="hidden sm:inline">{t('profile_tab_wallet')}</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-sky-600 data-[state=active]:text-white data-[state=active]:shadow-md py-2.5 text-sm sm:text-base">
                <History size={18} className="mr-0 sm:mr-2"/> <span className="hidden sm:inline">{t('profile_tab_history')}</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-sky-600 data-[state=active]:text-white data-[state=active]:shadow-md py-2.5 text-sm sm:text-base">
                <Shield size={18} className="mr-0 sm:mr-2"/> <span className="hidden sm:inline">{t('profile_tab_security')}</span>
              </TabsTrigger>
              <TabsTrigger value="support" className="data-[state=active]:bg-sky-600 data-[state=active]:text-white data-[state=active]:shadow-md py-2.5 text-sm sm:text-base">
                <MessageSquare size={18} className="mr-0 sm:mr-2"/> <span className="hidden sm:inline">{t('profile_tab_support_messages')}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wallet">
              <WalletTabContent 
                profileData={profileData}
                withdrawalAmount={withdrawalAmount}
                setWithdrawalAmount={setWithdrawalAmount}
                handleWithdrawalRequest={handleWithdrawalRequest}
                isSubmittingWithdrawal={isSubmittingWithdrawal}
                t={t}
                minWithdrawalAmount={MIN_WITHDRAWAL_AMOUNT}
              />
            </TabsContent>

            <TabsContent value="history">
              <HistoryTabContent withdrawalHistory={withdrawalHistory} paymentHistory={paymentHistory} t={t} />
            </TabsContent>
            
            <TabsContent value="security">
              <MfaManagement />
            </TabsContent>

            <TabsContent value="support">
              <UserSupportMessages />
            </TabsContent>
          </Tabs>
        </motion.div>
      );
    }
  