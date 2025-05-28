
    import React, { useState, useEffect, useCallback } from 'react';
    import { useAuth } from '@/contexts/AuthContext';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { useLanguage } from '@/contexts/LanguageContext';
    import { ShieldCheck, ShieldOff, Loader2, AlertTriangle } from 'lucide-react';
    import { motion } from 'framer-motion';

    const MfaManagement = () => {
      const { user, enrollMfa, challengeAndVerifyMfa, unenrollMfa, listMfaFactors, refreshUserProfile } = useAuth();
      const { toast } = useToast();
      const { t } = useLanguage();

      const [mfaFactors, setMfaFactors] = useState([]);
      const [isLoadingFactors, setIsLoadingFactors] = useState(true);
      const [isEnrolling, setIsEnrolling] = useState(false);
      const [isVerifying, setIsVerifying] = useState(false);
      const [isUnenrolling, setIsUnenrolling] = useState(false);
      
      const [qrCodeSvg, setQrCodeSvg] = useState(null);
      const [enrollmentFactorId, setEnrollmentFactorId] = useState(null);
      const [verificationCode, setVerificationCode] = useState('');

      const fetchFactors = useCallback(async () => {
        setIsLoadingFactors(true);
        const result = await listMfaFactors();
        if (result.success) {
          setMfaFactors(result.factors || []);
        } else {
          toast({ title: t('mfa_list_factors_error_title'), description: result.message, variant: 'destructive' });
          setMfaFactors([]);
        }
        setIsLoadingFactors(false);
      }, [listMfaFactors, t, toast]);

      useEffect(() => {
        fetchFactors();
      }, [fetchFactors]);

      const handleEnroll = async () => {
        setIsEnrolling(true);
        setQrCodeSvg(null);
        setEnrollmentFactorId(null);
        setVerificationCode('');

        const result = await enrollMfa();
        if (result.success && result.data?.totp?.qr_code) {
          setQrCodeSvg(result.data.totp.qr_code);
          setEnrollmentFactorId(result.data.id);
          toast({ title: t('mfa_enroll_scan_title'), description: t('mfa_enroll_scan_desc') });
        } else {
          toast({ title: t('mfa_enroll_error_title'), description: result.message || t('mfa_enroll_error_generic'), variant: 'destructive' });
        }
        setIsEnrolling(false);
      };

      const handleVerifyEnrollment = async () => {
        if (!enrollmentFactorId || !verificationCode) {
          toast({ title: t('mfa_verify_error_title'), description: t('mfa_verify_code_required'), variant: 'destructive' });
          return;
        }
        setIsVerifying(true);
        // For enrollment, challenge and verify are typically separate steps.
        // Supabase's enroll() gives a QR. Then challenge() with that factorId, then verify().
        const challengeResult = await challengeAndVerifyMfa(enrollmentFactorId, verificationCode);
        
        if (challengeResult.success) {
          toast({ title: t('mfa_enroll_success_title'), description: t('mfa_enroll_success_desc') });
          setQrCodeSvg(null);
          setEnrollmentFactorId(null);
          setVerificationCode('');
          await refreshUserProfile(); // Refresh to get updated AAL status
          fetchFactors(); // Re-fetch factors to show the new one
        } else {
          toast({ title: t('mfa_verify_error_title'), description: challengeResult.message || t('mfa_verify_error_generic'), variant: 'destructive' });
        }
        setIsVerifying(false);
      };

      const handleUnenroll = async (factorId) => {
        setIsUnenrolling(factorId); // Set to factorId to show loading on specific button
        const result = await unenrollMfa(factorId);
        if (result.success) {
          toast({ title: t('mfa_unenroll_success_title'), description: t('mfa_unenroll_success_desc') });
          await refreshUserProfile();
          fetchFactors();
        } else {
          toast({ title: t('mfa_unenroll_error_title'), description: result.message || t('mfa_unenroll_error_generic'), variant: 'destructive' });
        }
        setIsUnenrolling(false);
      };
      
      const verifiedTotpFactor = mfaFactors.find(f => f.factor_type === 'totp' && f.status === 'verified');

      return (
        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl mt-2">
          <CardHeader>
            <CardTitle className="text-2xl text-sky-400 flex items-center">
              <ShieldCheck size={28} className="mr-3 text-green-400" />
              {t('mfa_management_title')}
            </CardTitle>
            <CardDescription className="text-slate-400">{t('mfa_management_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingFactors ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                <p className="ml-3 text-slate-300">{t('mfa_loading_factors')}</p>
              </div>
            ) : (
              <>
                {verifiedTotpFactor ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-green-400">{t('mfa_status_enabled')}</p>
                        <p className="text-xs text-slate-400">Factor ID: {verifiedTotpFactor.id.substring(0,8)}...</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleUnenroll(verifiedTotpFactor.id)}
                        disabled={isUnenrolling === verifiedTotpFactor.id}
                        size="sm"
                      >
                        {isUnenrolling === verifiedTotpFactor.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldOff size={16} className="mr-2"/>}
                        {t('mfa_disable_button')}
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 p-4 bg-slate-700/30 rounded-lg">
                     <div className="flex items-center text-amber-400">
                        <AlertTriangle size={20} className="mr-2"/>
                        <p className="font-semibold">{t('mfa_status_disabled')}</p>
                     </div>
                    <Button 
                      onClick={handleEnroll} 
                      disabled={isEnrolling}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      {isEnrolling ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ShieldCheck size={18} className="mr-2"/>}
                      {t('mfa_enable_button')}
                    </Button>
                  </motion.div>
                )}

                {qrCodeSvg && enrollmentFactorId && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 p-6 bg-slate-800 rounded-lg shadow-inner space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-sky-300 text-center">{t('mfa_scan_qr_title')}</h3>
                    <div 
                      className="bg-white p-4 rounded-md shadow-md max-w-xs mx-auto" 
                      dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                    />
                    <p className="text-xs text-slate-400 text-center">{t('mfa_scan_qr_desc')}</p>
                    <div className="space-y-2">
                      <Label htmlFor="verificationCode" className="text-slate-300">{t('mfa_verification_code_label')}</Label>
                      <Input 
                        id="verificationCode"
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder={t('mfa_verification_code_placeholder')}
                        maxLength={6}
                        className="bg-slate-700 border-slate-600 text-slate-50 focus:ring-sky-500"
                      />
                    </div>
                    <Button 
                      onClick={handleVerifyEnrollment} 
                      disabled={isVerifying || !verificationCode}
                      className="w-full bg-sky-600 hover:bg-sky-700"
                    >
                      {isVerifying ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                      {t('mfa_verify_enroll_button')}
                    </Button>
                  </motion.div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      );
    };

    export default MfaManagement;
  