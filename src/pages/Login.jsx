
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
    import { LogIn, UserPlus } from 'lucide-react';

    export function Login() {
      const [identifier, setIdentifier] = useState(''); 
      const [password, setPassword] = useState('');
      const [isLoading, setIsLoading] = useState(false);
      const navigate = useNavigate();
      const { toast } = useToast();
      const { login } = useAuth();
      const { t } = useLanguage();

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!identifier || !password) {
          toast({ title: t('login_error_toast_title'), description: t('login_error_fields_required'), variant: "destructive" });
          return;
        }
        
        setIsLoading(true);
        const result = await login(identifier, password);
        setIsLoading(false);

        if (result.success) {
          toast({ title: t('login_success_toast_title'), description: t('login_success_toast_desc', { username: result.profile?.username || identifier }) });
          navigate('/profile');
        } else {
          const errorMessage = result.message || t('login_error_toast_desc');
          toast({ title: t('login_error_toast_title'), description: errorMessage, variant: "destructive" });
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
                <LogIn className="w-16 h-16 mx-auto text-sky-400 mb-4" />
              </motion.div>
              <CardTitle className="text-3xl font-bold text-sky-400">{t('login_title')}</CardTitle>
              <CardDescription className="text-slate-400">{t('login_subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="identifier" className="text-slate-300">{t('login_identifier_label')}</Label>
                  <Input 
                    id="identifier" 
                    type="text" 
                    value={identifier} 
                    onChange={(e) => setIdentifier(e.target.value)} 
                    className="bg-slate-700 border-slate-600 text-slate-50 focus:ring-sky-500 placeholder:text-slate-500"
                    placeholder={t('login_identifier_placeholder')} 
                    autoComplete="username email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300">{t('login_password_label')}</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="bg-slate-700 border-slate-600 text-slate-50 focus:ring-sky-500 placeholder:text-slate-500"
                    placeholder={t('login_password_placeholder')} 
                    autoComplete="current-password"
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
                      {t('loading_button_processing')}
                    </div>
                  ) : (
                    <>
                      <LogIn size={20} className="mr-2" /> {t('login_button')}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-center space-y-2">
              <p className="text-sm text-slate-400">
                {t('login_no_account_text')}{' '}
                <Link to="/register" className="font-medium text-sky-400 hover:text-sky-300 hover:underline">
                  {t('login_register_here_link')}
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      );
    }
  