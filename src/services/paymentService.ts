import { supabase } from '../lib/supabaseClient';

export const paymentService = {
  async createPayment(amount: number, orderId: string, description?: string) {
    const { data, error } = await supabase.functions.invoke('create-payment', {
      body: { amount, orderId, description }
    });
    
    if (error) throw new Error(error.message);
    
    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    }
    
    return data;
  }
};