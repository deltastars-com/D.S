import { supabase } from '../supabaseClient';

export const authService = {
  sendOTP: async (phone: string) => {
    const { data, error } = await supabase.functions.invoke('send-otp', {
      body: { phone, method: 'sms' }
    });
    if (error) throw error;
    return data;
  },

  verifyOTPAndSignIn: async (phone: string, otp: string) => {
    const { data, error } = await supabase.functions.invoke('verify-otp', {
      body: { phone, otp }
    });
    if (error) throw error;
    if (!data?.verified || !data?.user) throw new Error('فشل التحقق من رمز OTP');
    return data;
  }
};
