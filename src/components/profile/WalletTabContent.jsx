
    import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { DollarSign, Send } from 'lucide-react';

    const WalletTabContent = ({ profileData, withdrawalAmount, setWithdrawalAmount, handleWithdrawalRequest, isSubmittingWithdrawal, t, minWithdrawalAmount }) => (
      <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl mt-2">
        <CardHeader>
          <CardTitle className="text-2xl text-sky-400 flex items-center"><DollarSign size={28} className="mr-2"/>{t('profile_wallet_balance_title')}</CardTitle>
          <CardDescription className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-sky-400 py-2">
            ${(profileData.walletBalanceUSDT || 0).toFixed(2)} <span className="text-2xl text-slate-400">USDT</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="withdrawalAmount" className="text-slate-300">{t('profile_withdrawal_amount_label')}</Label>
            <Input 
              id="withdrawalAmount" 
              type="number" 
              value={withdrawalAmount} 
              onChange={(e) => setWithdrawalAmount(e.target.value)} 
              placeholder={t('profile_withdrawal_amount_placeholder', {minAmount: minWithdrawalAmount})}
              className="bg-input border-border focus:ring-primary" 
            />
          </div>
          <p className="text-xs text-muted-foreground">{t('profile_withdrawal_fee_note')}</p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleWithdrawalRequest} 
            disabled={isSubmittingWithdrawal} 
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md w-full sm:w-auto"
          >
            <Send size={18} className="mr-2"/>
            {isSubmittingWithdrawal ? t('profile_withdrawal_button_submitting') : t('profile_withdrawal_button_submit')}
          </Button>
        </CardFooter>
      </Card>
    );

    export default WalletTabContent;
  