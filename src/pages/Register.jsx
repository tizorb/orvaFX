
    import React, { useState } from 'react';
    import { useNavigate, Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { useAuth } from '@/contexts/AuthContext';
    import { useLanguage } from '@/contexts/LanguageContext';
    import { motion } from 'framer-motion';
    import { UserPlus, LogIn, Gift, Mail } from 'lucide-react';

    export function Register() {
      const [username, setUsername] = useState('');
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [confirmPassword, setConfirmPassword] = useState('');
      const [referralCode, setReferralCode] = useState('');
      const [isLoading, setIsLoading] = useState(false);
      const navigate = useNavigate();
      const { toast } = useToast();
      const { register } = useAuth();
      const { t } = useLanguage();

      const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !email || !password || !confirmPassword) {
          toast({ title: t('register_error_toast_title'), description: t('register_error_fields_required'), variant: "destructive" });
          return;
        }
        if (!isValidEmail(email)) {
          toast({ title: t('register_error_toast_title'), description: t('register_error_invalid_email'), variant: "destructive" });
          return;
        }
        if (password !== confirmPassword) {
          toast({ title: t('register_error_toast_title'), description: t('register_error_passwords_mismatch'), variant: "destructive" });
          return;
        }
        if (password.length < 6) {
          toast({ title: t('register_error_toast_title'), description: t('register_error_password_length'), variant: "destructive" });
          return;
        }

        setIsLoading(true);
        // For public registration, always assign 'user' role. 
        // Admin role should be assigned through a secure backend/admin panel process.
        const result = await register(username, email, password, referralCode || null, 'user');
        setIsLoading(false);

        if (result.success) {
          toast({ title: t('register_success_toast_title'), description: t('register_success_toast_desc') });
          navigate('/login');
        } else {
          let errorMessage = result.message || t('register_error_generic');
          toast({ title: t('register_error_toast_title'), description: errorMessage, variant: "destructive" });
        }
      };

      return (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center min-h-[calc(100vh-150px)] p-4"
        >
          <Card className="w-full max-w-md bg-slate-800/70 border-slate-700 shadow-2xl">
            <CardHeader className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
                <UserPlus className="w-16 h-16 mx-auto text-sky-400 mb-4" />
              </motion.div>
              <CardTitle className="text-3xl font-bold text-sky-400">{t('register_title')}</CardTitle>
              <CardDescription className="text-slate-400">{t('register_subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="usernameReg" className="text-slate-300">{t('register_username_label')}</Label>
                  <Input 
                    id="usernameReg" 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    className="bg-slate-700 border-slate-600 text-slate-50 focus:ring-sky-500 placeholder:text-slate-500"
                    placeholder={t('register_username_placeholder')} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailReg" className="text-slate-300">{t('register_email_label')}</Label>
                  <div className="flex items-center space-x-2">
                    <Mail className="text-slate-400" />
                    <Input 
                      id="emailReg" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="bg-slate-700 border-slate-600 text-slate-50 focus:ring-sky-500 placeholder:text-slate-500"
                      placeholder={t('register_email_placeholder')} 
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordReg" className="text-slate-300">{t('register_password_label')}</Label>
                  <Input 
                    id="passwordReg" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="bg-slate-700 border-slate-600 text-slate-50 focus:ring-sky-500 placeholder:text-slate-500"
                    placeholder={t('register_password_placeholder')} 
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPasswordReg" className="text-slate-300">{t('register_confirm_password_label')}</Label>
                  <Input 
                    id="confirmPasswordReg" 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    className="bg-slate-700 border-slate-600 text-slate-50 focus:ring-sky-500 placeholder:text-slate-500"
                    placeholder={t('register_confirm_password_placeholder')} 
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referralCodeReg" className="text-slate-300">{t('register_referral_code_label')}</Label>
                  <div className="flex items-center space-x-2">
                    <Gift className="text-slate-400" />
                    <Input 
                      id="referralCodeReg" 
                      type="text" 
                      value={referralCode} 
                      onChange={(e) => setReferralCode(e.target.value)} 
                      className="bg-slate-700 border-slate-600 text-slate-50 focus:ring-sky-500 placeholder:text-slate-500"
                      placeholder={t('register_referral_code_placeholder')} 
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-lg py-3 transition-all duration-300 transform hover:scale-105"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('loading_button_processing')}
                    </div>
                  ) : (
                    <>
                      <UserPlus size={20} className="mr-2" /> {t('register_button')}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-center space-y-2">
              <p className="text-sm text-slate-400">
                {t('register_already_account_text')}{' '}
                <Link to="/login" className="font-medium text-sky-400 hover:text-sky-300 hover:underline">
                  {t('register_login_here_link')}
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      );
    }
  