
    import { supabase } from '@/lib/supabaseClient';

    export const enrollNewMfaFactor = async (t) => {
      try {
        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: 'totp',
        });
        if (error) {
          console.error('MFA enroll error:', error);
          return { success: false, message: error.message || (t?.('mfa_enroll_error_generic') || 'Failed to start MFA enrollment.') };
        }
        return { success: true, data };
      } catch (e) {
        console.error('Exception in enrollNewMfaFactor:', e);
        return { success: false, message: t?.('mfa_enroll_error_exception') || 'An unexpected error occurred during MFA enrollment.' };
      }
    };

    export const createMfaChallenge = async (factorId, t) => {
      try {
        const { data, error } = await supabase.auth.mfa.challenge({ factorId });
        if (error) {
          console.error('MFA challenge error:', error);
          return { success: false, message: error.message || (t?.('mfa_challenge_error_generic') || 'Failed to challenge MFA.') };
        }
        return { success: true, challengeId: data.id };
      } catch (e) {
        console.error('Exception in createMfaChallenge:', e);
        return { success: false, message: t?.('mfa_challenge_error_exception') || 'An unexpected error occurred during MFA challenge.' };
      }
    };
    
    export const verifyMfaChallenge = async (factorId, challengeId, code, t) => {
      try {
        const { data, error } = await supabase.auth.mfa.verify({
          factorId,
          challengeId,
          code,
        });
        if (error) {
          console.error('MFA verify error:', error);
          return { success: false, message: error.message || (t?.('mfa_verify_error_generic') || 'Failed to verify MFA code.') };
        }
        return { success: true, data };
      } catch (e) {
        console.error('Exception in verifyMfaChallenge:', e);
        return { success: false, message: t?.('mfa_verify_error_exception') || 'An unexpected error occurred during MFA verification.' };
      }
    };

    export const unenrollMfaFactor = async (factorId, t) => {
      try {
        const { error } = await supabase.auth.mfa.unenroll({ factorId });
        if (error) {
          console.error('MFA unenroll error:', error);
          return { success: false, message: error.message || (t?.('mfa_unenroll_error_generic') || 'Failed to unenroll MFA.') };
        }
        return { success: true };
      } catch (e) {
        console.error('Exception in unenrollMfaFactor:', e);
        return { success: false, message: t?.('mfa_unenroll_error_exception') || 'An unexpected error occurred during MFA unenrollment.' };
      }
    };

    export const listUserMfaFactors = async (t) => {
      try {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) {
          console.error('MFA list factors error:', error);
          return { success: false, message: error.message || (t?.('mfa_list_factors_error_generic') || 'Failed to list MFA factors.') };
        }
        return { success: true, factors: data.all };
      } catch (e) {
        console.error('Exception in listUserMfaFactors:', e);
        return { success: false, message: t?.('mfa_list_factors_error_exception') || 'An unexpected error occurred while listing MFA factors.' };
      }
    };
  