
    import React, { useState, useEffect } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { useAuth } from '@/contexts/AuthContext';
    import { useLanguage } from '@/contexts/LanguageContext';
    import { motion } from 'framer-motion';
    import { ShieldCheck, LogOut } from 'lucide-react';

    const MfaChallengePage = () => {
      const [code, setCode] = useState('');
      const [isLoading, setIsLoading] = useState(false);
      const navigate = useNavigate();
      const { toast } = useToast();
      const { mfaChallenge, challengeAndVerifyMfa, logout, user } = useAuth();
      const { t } = useLanguage();

      useEffect(() => {
        if (user) { // If user object becomes available, MFA was successful
          navigate('/');
        }
        if (!mfaChallenge) { // If no challenge, redirect to login
          navigate('/login');
        }
      }, [mfaChallenge, user, navigate]);

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!code) {
          toast({ title: t('mfa_challenge_error_title'), description: t('mfa_challenge_code_required'), variant: "destructive" });
          return;
        }
        if (!mfaChallenge?.factorId) {
          toast({ title: t('mfa_challenge_error_title'), description: t('mfa_challenge_error_no_factor'), variant: "destructive" });
          await logout();
          return;
        }
        
        setIsLoading(true);
        const result = await challengeAndVerifyMfa(mfaChallenge.factorId, code);
        setIsLoading(false);

        if (result.success) {
          toast({ title: t('mfa_challenge_success_title'), description: t('mfa_challenge_success_desc') });
          navigate('/'); 
        } else {
          toast({ title: t('mfa_challenge_error_title'), description: result.message || t('mfa_challenge_error_generic'), variant: "destructive" });
        }
      };

      const handleLogout = async () => {
        await logout();
        navigate('/login');
      };

      if (!mfaChallenge) return null; // Or a loading spinner

      return (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center min-h-full p-4" // Changed to min-h-full for centering
        >
          <Card className="w-full max-w-md bg-slate-800/70 border-slate-700 shadow-2xl">
            <CardHeader className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
                <ShieldCheck className="w-16 h-16 mx-auto text-sky-400 mb-4" />
              </motion.div>
              <CardTitle className="text-3xl font-bold text-sky-400">{t('mfa_challenge_title')}</CardTitle>
              <CardDescription className="text-slate-400">{t('mfa_challenge_subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="mfaCode" className="text-slate-300">{t('mfa_challenge_code_label')}</Label>
                  <Input 
                    id="mfaCode" 
                    type="text" 
                    value={code} 
                    onChange={(e) => setCode(e.target.value)} 
                    className="bg-slate-700 border-slate-600 text-slate-50 focus:ring-sky-500 placeholder:text-slate-500"
                    placeholder={t('mfa_challenge_code_placeholder')} 
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
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
                      {t('loading_button_verifying')}
                    </div>
                  ) : (
                    <>
                      <ShieldCheck size={20} className="mr-2" /> {t('mfa_challenge_verify_button')}
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-slate-100"
                  onClick={handleLogout}
                  disabled={isLoading}
                >
                  <LogOut size={20} className="mr-2" /> {t('mfa_challenge_logout_button')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default MfaChallengePage;
  