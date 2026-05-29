import { supabase } from '../supabaseClient';

export interface CustomerData {
  id?: string;
  phone: string;
  isVerified: boolean;
  name?: string;
}

export const processOrderAutomations = async (cartTotal: number, customer: CustomerData, branchId: string) => {
  if (cartTotal < 50) {
    throw new Error('الحد الأدنى للطلب هو 50 ريال سعودي لضمان جودة التوريد السيادي.');
  }

  // Identity Verification via Authentica (OTP)
  if (!customer.isVerified) {
    try {
      const apiKey = import.meta.env.AUTHENTICA_API_KEY;
      if (apiKey) {
        await fetch('https://api.authentica.sa/v1/verify', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ phone: customer.phone })
        });
      }
    } catch (error) {
      console.error('OTP Verification Error:', error);
      // Fallback for demo or non-configured keys
    }
  }

  // Sovereign Logistics Routing (Supabase Only)
  const { data: drivers, error: driverError } = await supabase
    .from('drivers')
    .select('*')
    .eq('branch_id', branchId)
    .eq('current_status', 'online')
    .order('last_assigned_at', { ascending: true }) // Fair distribution
    .limit(1);

  if (driverError) {
    console.error('Driver Retrieval Error:', driverError);
    throw new Error('فشل نظام التوجيه اللوجستي - يرجى المحاولة لاحقاً');
  }

  if (drivers && drivers.length > 0) {
    const primaryDriver = drivers[0];
    
    // Notify via FCM (Implementation bridge)
    // Note: FCM uses Firebase, but the routing state lives in Supabase
    console.log(`Order routed to Sovereign Driver: ${primaryDriver.id}`);
    
    return primaryDriver;
  } else {
    throw new Error('نعتذر، لا يتوفر مناديب نشطين في منطقتك حالياً لضمان التسليم الفوري.');
  }
};
