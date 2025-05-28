
    import { v4 as uuidv4 } from 'uuid';

    export const generateReferralCode = () => {
      return `ORVA-${uuidv4().slice(0, 8).toUpperCase()}`;
    };
  