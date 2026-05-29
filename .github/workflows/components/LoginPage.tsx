import React, { useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { useToast } from '../src/contexts/ToastContext';
import { ShieldCheckIcon, PhoneIcon, LockIcon, UserIcon } from './lib/contexts/Icons';
import { COMPANY_INFO } from './constants';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
  onNavigate?: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigate }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithOtp, verifyOtpAndLogin } = useAuth();
  const { addToast } = useToast();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    
    setIsLoading(true);
    try {
      await loginWithOtp(phone);
      setStep('otp');
      addToast('تم إرسال رمز التحقق إلى هاتفك', 'success');
    } catch (error: any) {
      addToast(error.message || 'فشل إرسال الرمز', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    
    setIsLoading(true);
    try {
      await verifyOtpAndLogin(phone, otp);
      addToast('تم تسجيل الدخول بنجاح', 'success');
      // AuthContext will update, and App will handle navigation
    } catch (error: any) {
      addToast(error.message || 'رمز التحقق غير صحيح', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a3a1a] flex items-center justify-center p-4 font-tajawal">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-t-[12px] border-yellow-600">
        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-24 h-24 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border-2 border-green-100">
              <img src={COMPANY_INFO.logo_url} className="w-16 h-16 object-contain" alt="Logo" />
            </div>
            <h1 className="text-3xl font-black text-green-900 mb-2">بوابة الدخول الموحدة</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">نظام نجوم دلتا السيادي</p>
          </div>

          {step === 'phone' ? (
            <div className="space-y-6">
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="relative">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 mr-4">رقم الجوال المسجل (للعملاء والمندوبين)</label>
                  <div className="relative">
                    <PhoneIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="05xxxxxxxx"
                      className="w-full p-4 pr-12 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-yellow-600 outline-none transition-all font-bold text-lg"
                      required
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 bg-green-900 hover:bg-green-800 text-white rounded-2xl font-black text-xl shadow-xl shadow-green-900/20 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? 'جاري الإرسال...' : 'إرسال رمز التحقق 🚀'}
                </button>
              </form>

              <div className="relative flex items-center justify-center py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <span className="relative px-4 bg-white text-[10px] font-black text-gray-400 uppercase">أو الدخول بنظام السلطة</span>
              </div>

              <button 
                onClick={() => onNavigate?.('admin_login')}
                type="button"
                className="w-full py-5 bg-dark-black text-white rounded-2xl font-black text-xl shadow-xl shadow-black/20 transition-all transform hover:bg-black active:scale-95 flex items-center justify-center gap-3"
              >
                <LockIcon className="w-6 h-6 text-secondary" />
                دخول الإدارة والمطورين
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="relative">
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 mr-4">رمز التحقق (OTP)</label>
                <div className="relative">
                  <ShieldCheckIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="------"
                    className="w-full p-4 pr-12 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-yellow-600 outline-none transition-all font-black text-2xl text-center tracking-[0.5em]"
                    required
                    maxLength={6}
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-2xl font-black text-xl shadow-xl shadow-yellow-600/20 transition-all transform active:scale-95 disabled:opacity-50"
              >
                {isLoading ? 'جاري التحقق...' : 'تأكيد الدخول ✅'}
              </button>
              <button 
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-center text-xs font-bold text-gray-400 hover:text-green-900 transition-colors"
              >
                تغيير رقم الجوال؟
              </button>
            </form>
          )}

          {/* Footer Info */}
          <div className="mt-12 pt-8 border-t border-gray-100 text-center">
            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              <ShieldCheckIcon className="w-3 h-3 text-green-600" />
              <span>نظام حماية سيادي مشفر</span>
            </div>
            <p className="text-[10px] text-gray-400 font-bold">
              جميع المحاولات مسجلة برقم الـ IP والوقت الفعلي.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
