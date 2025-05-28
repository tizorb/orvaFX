
    import React, { useState } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { UserCircle, Eye, EyeOff, Copy, Check, Gift, Edit3, Save } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { useToast } from '@/components/ui/use-toast';

    const ProfileInfoCard = ({ 
      profileData, 
      handleProfileChange, 
      walletAddress, 
      setWalletAddress, 
      handleProfileSave,
      referralCodeInput,
      setReferralCodeInput,
      handleApplyReferralCode,
      t 
    }) => {
      const [showReferralCode, setShowReferralCode] = useState(false);
      const [copied, setCopied] = useState(false);
      const [isEditing, setIsEditing] = useState(false);
      const { toast } = useToast();

      const copyToClipboard = () => {
        navigator.clipboard.writeText(profileData.referral_code);
        setCopied(true);
        toast({ title: t('profile_referral_code_copied_title'), description: t('profile_referral_code_copied_desc') });
        setTimeout(() => setCopied(false), 2000);
      };

      const toggleEdit = () => {
        if (isEditing) {
          handleProfileSave();
        }
        setIsEditing(!isEditing);
      };

      return (
        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900/80">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                <UserCircle size={80} className="text-sky-400 bg-slate-700 p-3 rounded-full shadow-lg" />
              </motion.div>
              <div>
                <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
                  {profileData.username}
                </CardTitle>
                <CardDescription className="text-slate-400">{profileData.email}</CardDescription>
                <p className="text-xs text-slate-500 mt-1">
                  {t('profile_member_since')}: {new Date(profileData.created_at).toLocaleDateString()}
                </p>
              </div>
              <Button 
                onClick={toggleEdit} 
                variant="outline" 
                size="sm" 
                className="ml-auto bg-slate-700 hover:bg-slate-600 border-slate-600 text-sky-400 hover:text-sky-300"
              >
                {isEditing ? <Save size={16} className="mr-2" /> : <Edit3 size={16} className="mr-2" />}
                {isEditing ? t('profile_save_button') : t('profile_edit_button')}
              </Button>
            </div>
          </div>
          
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="username" className="text-slate-300">{t('profile_username_label')}</Label>
                <Input 
                  id="username" 
                  name="username" 
                  value={profileData.username} 
                  onChange={handleProfileChange} 
                  disabled={!isEditing}
                  className={`bg-input border-border focus:ring-primary ${!isEditing ? 'text-slate-400 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-slate-300">{t('profile_email_label')}</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={profileData.email} 
                  onChange={handleProfileChange} 
                  disabled={!isEditing}
                  className={`bg-input border-border focus:ring-primary ${!isEditing ? 'text-slate-400 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="walletAddressUSDT" className="text-slate-300">{t('profile_wallet_address_label')}</Label>
              <Input 
                id="walletAddressUSDT" 
                name="walletAddressUSDT" 
                value={walletAddress} 
                onChange={(e) => setWalletAddress(e.target.value)} 
                placeholder={t('profile_wallet_address_placeholder')} 
                disabled={!isEditing}
                className={`bg-input border-border focus:ring-primary ${!isEditing ? 'text-slate-400 cursor-not-allowed' : ''}`}
              />
            </div>

            <div className="space-y-2 p-4 bg-slate-800/50 rounded-lg">
              <Label className="text-slate-300 flex items-center"><Gift size={18} className="mr-2 text-amber-400"/>{t('profile_referral_code_title')}</Label>
              <div className="flex items-center space-x-2">
                <Input 
                  type={showReferralCode ? "text" : "password"} 
                  value={profileData.referral_code || 'N/A'} 
                  readOnly 
                  className="bg-slate-700 border-slate-600 text-slate-300 flex-grow"
                />
                <Button variant="ghost" size="icon" onClick={() => setShowReferralCode(!showReferralCode)} className="text-slate-400 hover:text-sky-400">
                  {showReferralCode ? <EyeOff size={20} /> : <Eye size={20} />}
                </Button>
                <Button variant="ghost" size="icon" onClick={copyToClipboard} className="text-slate-400 hover:text-green-400">
                  {copied ? <Check size={20} className="text-green-500"/> : <Copy size={20} />}
                </Button>
              </div>
              <p className="text-xs text-slate-500">{t('profile_referral_code_desc')}</p>
            </div>

            {!profileData.referred_by && (
              <div className="space-y-2 p-4 bg-slate-800/50 rounded-lg">
                <Label htmlFor="applyReferralCode" className="text-slate-300">{t('profile_apply_referral_code_label')}</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    id="applyReferralCode" 
                    value={referralCodeInput} 
                    onChange={(e) => setReferralCodeInput(e.target.value)} 
                    placeholder={t('profile_apply_referral_code_placeholder')}
                    className="bg-input border-border focus:ring-primary"
                  />
                  <Button onClick={handleApplyReferralCode} className="bg-sky-600 hover:bg-sky-700 text-white">
                    {t('profile_apply_button')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      );
    };

    export default ProfileInfoCard;
  