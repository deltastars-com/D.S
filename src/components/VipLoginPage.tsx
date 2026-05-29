import React, { useState, useEffect } from 'react';
import { useToast, useI18n } from './lib/contexts';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheckIcon, UserIcon, LockIcon, ArrowRightIcon, FingerprintIcon, KeyIcon } from './lib/contexts/Icons';
import { motion, AnimatePresence } from 'motion/react';

interface VipLoginPageProps {
  onLoginSuccess: (user: any) => void;
}

type LoginStep = 'phone' | 'otp' | 'password' | 'set_password' | 'forgot_password';

export function VipLoginPage({ onLoginSuccess }: VipLoginPageProps) {
  const { language } = useI18n();
  const { addToast } = useToast();
  const { loginWithOtp, verifyOtpAndLogin, setPassword, loginWithPassword, loginWithBiometrics } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPasswordInput] = useState('');
  const [step, setStep] = useState<LoginStep>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);

  useEffect(() => {
    const lastUser = localStorage.getItem('last_vip_user');
    if (lastUser) {
      setHasBiometrics(true);
    }
  }, []);

  const handleSendOtp = async (e: React.FormEvent, isReset: boolean = false) => {
    e.preventDefault();
    if (!phone) return;
    
    setIsLoading(true);
    try {
      await loginWithOtp(phone);
      setStep('otp');
      addToast(language === 'ar' ? 'تم إرسال رمز التحقق إلى هاتفك' : 'Verification code sent to your phone', 'success');
    } catch (error: any) {
      addToast(language === 'ar' ? 'فشل إرسال الرمز' : 'Failed to send code', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    
    setIsLoading(true);
    try {
      const { isNewUser } = await verifyOtpAndLogin(phone, otp);
      if (isNewUser || step === 'otp') {
        // If we were in a forgot password flow or it's a new user, force set password
        setStep('set_password');
        addToast(language === 'ar' ? 'رمز التحقق صحيح. يرجى تعيين كلمة مرور جديدة لحسابك' : 'Code verified. Please set a new password for your account', 'success');
      } else {
        addToast(language === 'ar' ? 'مرحباً بك في بوابة دلتا ستارز' : 'Welcome to Delta Stars Portal', 'success');
      }
    } catch (error: any) {
      addToast(language === 'ar' ? 'رمز التحقق غير صحيح' : 'Invalid verification code', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      addToast(language === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      await setPassword(password);
      addToast(language === 'ar' ? 'تم تعيين كلمة المرور بنجاح' : 'Password set successfully', 'success');
    } catch (error: any) {
      addToast(language === 'ar' ? 'فشل تعيين كلمة المرور' : 'Failed to set password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await loginWithPassword(phone, password);
      addToast(language === 'ar' ? 'تم الدخول بنجاح' : 'Logged in successfully', 'success');
    } catch (error: any) {
      addToast(language === 'ar' ? 'كلمة المرور غير صحيحة' : 'Invalid password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithBiometrics();
      addToast(language === 'ar' ? 'تم الدخول عبر البصمة بنجاح' : 'Biometric login successful', 'success');
    } catch (error: any) {
      addToast(language === 'ar' ? 'فشل الدخول عبر البصمة' : 'Biometric login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 md:p-10 font-tajawal animate-fade-in relative overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Background Sovereignty */}
      <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-primary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-secondary/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-xl"
      >
        <div className="bg-slate-800/80 backdrop-blur-2xl p-12 md:p-16 rounded-[4rem] shadow-sovereign border-2 border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-2 bg-secondary rounded-full"></div>
          
          <header className="text-center mb-12">
             <div className="w-20 h-20 bg-secondary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sovereign border border-secondary/30">
                <ShieldCheckIcon className="w-10 h-10 text-secondary" />
             </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter text-shadow-sovereign">
              {language === 'ar' ? 'بوابة كبار العملاء' : 'VIP Sovereign Portal'}
            </h1>
            <p className="text-secondary font-bold text-lg italic">
               {step === 'phone' ? 'Identity Authentication' : 
                step === 'otp' ? 'Secure Verification' : 
                step === 'set_password' ? 'Key Generation' : 'Sovereign Access'}
            </p>
          </header>

          <AnimatePresence mode="wait">
            {step === 'phone' ? (
              <motion.div 
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <label className="text-gray-400 font-bold text-xs uppercase tracking-widest px-2">رقم الجوال المسجل / Phone Identifier</label>
                  <div className="relative">
                    <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-secondary" />
                    <input 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="05XXXXXXXXX"
                      className="w-full bg-slate-700/50 border-2 border-white/10 rounded-3xl p-6 pl-16 text-2xl font-black text-white outline-none focus:border-secondary transition-all text-center tracking-widest placeholder:opacity-20"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold px-2">{language === 'ar' ? '* سيتم إرسال رمز التحقق لهاتفك فوراً' : '* Verification code will be sent to your phone instantly'}</p>
                </div>
                
                <div className="space-y-4">
                  <button 
                    onClick={(e) => handleSendOtp(e as any, false)}
                    disabled={isLoading}
                    className="w-full bg-secondary text-white py-6 rounded-3xl font-black text-2xl shadow-sovereign hover:bg-yellow-600 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isLoading ? '...' : (language === 'ar' ? 'إرسال رمز الدخول 🔑' : 'Send Access Key 🔑')}
                  </button>

                  {hasBiometrics && (
                    <button 
                      onClick={handleBiometricLogin}
                      disabled={isLoading}
                      className="w-full bg-white/5 text-white py-6 rounded-3xl font-black text-xl border-2 border-white/5 hover:border-secondary transition-all flex items-center justify-center gap-4 group"
                    >
                      <FingerprintIcon className="w-8 h-8 text-secondary" />
                      {language === 'ar' ? 'البصمة / الوجه' : 'Biometric Access'}
                    </button>
                  )}
                </div>
              </motion.div>
            ) : step === 'otp' ? (
              <motion.div 
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <p className="text-gray-400 font-bold">{language === 'ar' ? 'أدخل الرمز المرسل إلى' : 'Enter code sent to'}</p>
                  <p className="text-secondary font-black text-2xl mt-2 tracking-widest">{phone}</p>
                  <button onClick={() => setStep('phone')} className="text-blue-400 text-xs font-bold mt-4 hover:underline">{language === 'ar' ? 'تعديل الرقم؟' : 'Edit identity?'}</button>
                </div>

                <div className="relative">
                  <LockIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
                  <input 
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="------"
                    className="w-full bg-slate-700/50 border-2 border-white/10 rounded-3xl p-6 pl-16 text-4xl font-black text-white text-center tracking-[0.4em] focus:border-secondary transition-all outline-none"
                  />
                </div>

                <button 
                  onClick={handleVerifyOtp as any}
                  disabled={isLoading}
                  className="w-full bg-secondary text-white py-6 rounded-3xl font-black text-2xl shadow-sovereign hover:scale-105 transition-all"
                >
                  {isLoading ? '...' : (language === 'ar' ? 'تأكيد الرمز 🛡️' : 'Confirm Identity 🛡️')}
                </button>
              </motion.div>
            ) : step === 'password' ? (
              <motion.div 
                key="password"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <label className="text-gray-400 font-bold text-xs uppercase tracking-widest px-2">كلمة المرور المسجلة / Security Pass</label>
                  <div className="relative">
                    <LockIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-secondary" />
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-700/50 border-2 border-white/10 rounded-3xl p-6 pl-16 text-2xl font-black text-white outline-none focus:border-secondary transition-all"
                    />
                  </div>
                  <div className="flex justify-between px-2">
                    <button 
                      onClick={(e) => handleSendOtp(e as any, true)}
                      className="text-xs text-secondary font-black hover:underline uppercase tracking-tighter"
                    >
                      {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Passcode?'}
                    </button>
                    <button 
                      onClick={() => setStep('phone')}
                      className="text-xs text-gray-500 font-bold hover:underline"
                    >
                      {language === 'ar' ? 'تغيير الحساب' : 'Switch Identity'}
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handlePasswordLogin as any}
                  disabled={isLoading}
                  className="w-full bg-secondary text-white py-6 rounded-3xl font-black text-2xl shadow-sovereign hover:scale-105 transition-all border-b-8 border-yellow-800 active:border-b-0"
                >
                  {language === 'ar' ? 'دخول سيادي 🔐' : 'Sovereign Entry 🔐'}
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="set_password"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="text-center p-8 bg-secondary/10 rounded-[2.5rem] border border-secondary/20 mb-8">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">✨</div>
                  <p className="text-secondary font-black text-lg">{language === 'ar' ? 'تم التحقق من هويتك!' : 'Identity Confirmed!'}</p>
                  <p className="text-gray-400 text-xs mt-2 uppercase font-bold tracking-widest">{language === 'ar' ? 'يرجى تعيين كلمة مرور جديدة' : 'Initialize New Security Key'}</p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <KeyIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-secondary" />
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-700/50 border-2 border-white/10 rounded-3xl p-6 pl-16 text-2xl font-black text-white outline-none focus:border-secondary transition-all"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSetPassword as any}
                  disabled={isLoading}
                  className="w-full bg-emerald-600 text-white py-6 rounded-3xl font-black text-2xl shadow-sovereign hover:scale-105 transition-all"
                >
                  {language === 'ar' ? 'تثبيت ودخول 💾' : 'Save & Initialize 💾'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Help Center Footnote */}
          <footer className="mt-16 text-center border-t border-white/5 pt-10">
            <div className="flex items-center justify-center gap-4 text-gray-500 mb-6 font-bold text-xs uppercase tracking-[0.2em]">
               <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
               Cyber-Secure Infrastructure
            </div>
            <p className="text-gray-400 font-bold text-sm">
              {language === 'ar' ? 'ليس لديك حساب كبار عملاء؟' : 'No VIP Access?'}
              <button className="text-secondary font-black underline ml-2 decoration-2 underline-offset-4">
                 {language === 'ar' ? 'تواصل مع الإدارة' : 'Contact Delta HQ'}
              </button>
            </p>
          </footer>
        </div>
      </motion.div>
    </div>
  );
}
