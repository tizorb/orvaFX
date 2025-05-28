
    import sha1 from 'js-sha1';

    export const checkPwnedPassword = async (password, t) => {
      try {
        const hash = sha1(password).toUpperCase();
        const prefix = hash.substring(0, 5);
        const suffix = hash.substring(5);

        const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
          headers: {
            'Accept': 'text/plain', 
          }
        });

        if (!response.ok) {
          if (response.status === 429) {
            console.warn('Rate limit exceeded for HaveIBeenPwned API. Skipping check.');
            return { isCompromised: false, error: null, skipped: true, message: t?.('pwned_password_check_rate_limit_skipped') || 'Password check skipped due to rate limiting. Please try again later or choose a very strong password.' };
          }
          console.error(`Error fetching pwned passwords: ${response.status} ${response.statusText}`);
          return { isCompromised: false, error: `API error: ${response.status}`, skipped: false, message: t?.('pwned_password_check_api_error') || 'Could not verify password safety. Please try again.' };
        }

        const text = await response.text();
        const hashes = text.split('\n');
        const found = hashes.some(line => line.split(':')[0] === suffix);
        
        return { isCompromised: found, error: null, skipped: false, message: found ? (t?.('pwned_password_compromised') || 'This password has been compromised. Please choose a different one.') : '' };
      } catch (error) {
        console.error('Error checking pwned password:', error);
        if (error.message.includes('Failed to fetch')) {
           return { isCompromised: false, error: 'Network error', skipped: true, message: t?.('pwned_password_check_network_error_skipped') || 'Could not connect to password safety service. Check skipped.' };
        }
        return { isCompromised: false, error: error.message, skipped: false, message: t?.('pwned_password_check_generic_error') || 'An error occurred while checking password safety.' };
      }
    };
  