import React, { useEffect } from 'react';

interface MoyasarFormProps {
  amount: number;
  onPaymentSuccess?: (payment: any) => void;
}

const MoyasarForm: React.FC<MoyasarFormProps> = ({ amount, onPaymentSuccess }) => {
  useEffect(() => {
    // @ts-ignore
    if (window.Moyasar) {
      // @ts-ignore
      window.Moyasar.init({
        element: '.mysr-form',
        amount: Math.round(amount * 100), // Convert to Halalas
        currency: 'SAR',
        description: 'طلب من متجر دلتا ستارز السيادي',
        publishable_api_key: import.meta.env.VITE_MOYASAR_PUBLISHABLE_KEY || 'pk_test_VKUd9RdBky7kbCZVePgPxMfzqNTNnhMjytKS58Er',
        callback_url: window.location.origin + '/payment/verify',
        metadata: {
          order_id: localStorage.getItem('last_order_id'),
          branch_id: localStorage.getItem('selected_branch_id')
        },
        methods: ['creditcard', 'applepay', 'stcpay']
      });
    }
  }, [amount]);

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sovereign border-2 border-emerald-50 max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-emerald">
          🔒
        </div>
        <div>
          <h3 className="text-emerald-900 font-black text-xl leading-none">الدفع الآمن</h3>
          <p className="text-emerald-600/60 text-xs font-bold mt-1 uppercase tracking-widest">Sovereign Encryption Active</p>
        </div>
      </div>

      <div className="mysr-form min-h-[300px]"></div>
      
      <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-4 gap-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
        <img src="https://cdn.moyasar.com/assets/logos/mada.svg" alt="Mada" className="h-6 mx-auto" />
        <img src="https://cdn.moyasar.com/assets/logos/visa.svg" alt="Visa" className="h-6 mx-auto" />
        <img src="https://cdn.moyasar.com/assets/logos/mastercard.svg" alt="MasterCard" className="h-6 mx-auto" />
        <img src="https://cdn.moyasar.com/assets/logos/apple-pay.svg" alt="ApplePay" className="h-6 mx-auto" />
      </div>

      <p className="text-center text-[10px] text-slate-400 mt-6 font-bold uppercase tracking-tighter">
        Protected by Moyasar Financial Node & Delta Stars Sovereign Security
      </p>
    </div>
  );
};

export default MoyasarForm;
