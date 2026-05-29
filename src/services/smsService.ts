import { supabase } from '../lib/supabaseClient';

export const smsService = {
  async sendVerificationCode(phoneNumber: string) {
    const { data, error } = await supabase.functions.invoke('send-sms', {
      body: { phoneNumber }
    });
    
    if (error) throw new Error(error.message);
    return data;
  }
};