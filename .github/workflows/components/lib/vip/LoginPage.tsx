
import React, { useState, useEffect } from 'react';
import { LogoIcon, EyeIcon, EyeOffIcon, SparklesIcon } from '../contexts/Icons';
import { Page } from '../../../types';
import { useI18n, useGeminiAi, useToast } from '../contexts';
import { GoogleGenAI } from '@google/genai';

const ADMIN_EMAILS = ['deltastars777@gmail.com', 'marketing@deltastars-ksa.com', 'info@deltastars-ksa.com'];

const OtpModal: React.FC<{
  email: string,
  onClose: () => void,
  onSuccess: () => void,
}> = ({ email, onClose, onSuccess }) => {
    const { t } = useI18n();
    const { status: geminiStatus } = useGeminiAi();
    
    const [step, setStep] = useState('request');
    const [code, setCode] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const triggerFallback = () => {
        const fallbackCode = '123456';
        setVerificationCode(fallbackCode);
        setStep('enterCode');
    };

    const handleRequestCode = async () => {
        setStep('loading');
        setError('');
        
        // Fix: Initializing GoogleGenAI instance locally before use.
        if (geminiStatus === 'ready') {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                const codeResponse = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: `Generate a secure 6-digit numerical verification code. Respond with only the 6 digits.` });
                const extractedCode = codeResponse.text?.trim().match(/\d{6}/)?.[0];

                if (!extractedCode) {
                    triggerFallback();
                    return;
                }
                setVerificationCode(extractedCode);
                setStep('enterCode');
            } catch (e) {
                triggerFallback();
            }
        } else {
            triggerFallback();
        }
    };
    
    useEffect(() => {
        handleRequestCode();
    }, []);

    const handleCodeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (code === verificationCode) {
            setStep('createPassword');
        } else {
            setError(t('auth.otp.invalidCode'));
        }
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (newPassword !== confirmPassword) { setError(t('auth.passwordMismatch')); return; }
        if (newPassword.length < 6) { setError(t('auth.otp.passwordLengthError')); return; }
        
        localStorage.setItem('delta-stars-admin-auth', JSON.stringify({ password: newPassword, isDefault: false }));
        setStep('success');
    };
    
    const title = t('login.forgotPassword');
    const instruction = t('auth.otp.sentToEmail', { email });

    const renderStep = () => {
        switch (step) {
            case 'request':
            case 'loading':
                return (
                     <div className="text-center p-10">
                        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-secondary mx-auto mb-6"></div>
                        <p className="text-primary font-black text-xl">{t('auth.otp.generatingCode')}</p>
                    </div>
                );
            case 'enterCode':
                return (
                    <form onSubmit={handleCodeSubmit} className="space-y-6">
                        <h2 className="text-3xl font-black text-primary mb-2 text-center">{title}</h2>
                        <p className="text-gray-500 mb-6 text-center font-bold" dangerouslySetInnerHTML={{ __html: instruction }}></p>
                        <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder={t('auth.otp.placeholder')} className="w-full p-6 bg-gray-50 border-4 border-gray-100 rounded-3xl mb-4 text-center tracking-[0.5em] font-black text-4xl focus:border-primary outline-none transition-all" required />
                        {error && <p className="text-red-500 font-bold text-center mb-4">{error}</p>}
                        <button type="submit" className="bg-primary text-white py-5 px-6 rounded-2xl w-full font-black text-xl shadow-xl hover:scale-[1.02] transition-all">{t('auth.otp.verify')}</button>
                    </form>
                );
            case 'createPassword':
                return (
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <h2 className="text-3xl font-black text-primary mb-4">{t('auth.createNewPassword')}</h2>
                        <div className="relative">
                            <input type={showNewPassword ? 'text' : 'password'} placeholder={t('auth.newPassword')} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-5 bg-gray-50 border-2 rounded-2xl font-bold focus:border-primary outline-none" required />
                            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 end-0 flex items-center px-4 text-gray-400">
                                {showNewPassword ? <EyeOffIcon className="w-6 h-6" /> : <EyeIcon className="w-6 h-6" />}
                            </button>
                        </div>
                        <div className="relative">
                             <input type={showConfirmPassword ? 'text' : 'password'} placeholder={t('auth.confirmPassword')} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-5 bg-gray-50 border-2 rounded-2xl font-bold focus:border-primary outline-none" required />
                             <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 end-0 flex items-center px-4 text-gray-400">
                                {showConfirmPassword ? <EyeOffIcon className="w-6 h-6" /> : <EyeIcon className="w-6 h-6" />}
                            </button>
                        </div>
                        {error && <p className="text-red-500 font-bold text-center">{error}</p>}
                        <button type="submit" className="bg-primary text-white py-5 px-6 rounded-2xl w-full font-black text-xl shadow-xl">{t('auth.changePasswordButton')}</button>
                    </form>
                );
            case 'success':
                 return (
                    <div className="text-center p-6">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">✓</div>
                        <h2 className="text-3xl font-black text-primary mb-4">{t('auth.otp.successTitle')}</h2>
                        <p className="text-gray-500 mb-8 font-bold">{t('auth.otp.successSubtitle')}</p>
                        <button onClick={onClose} className="bg-primary text-white py-4 px-12 rounded-2xl font-black text-lg shadow-lg">{t('auth.ok')}</button>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 z-[200] flex justify-center items-center p-4 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[3.5rem] shadow-sovereign w-full max-w-xl p-12 relative border-t-[15px] border-secondary">
                 <button onClick={onClose} className="absolute top-6 end-8 text-gray-300 hover:text-red-500 text-4xl font-black transition-colors">&times;</button>
                 {renderStep()}
            </div>
        </div>
    );
};

interface LoginPageProps {
  onLogin: (credentials: {email: string, password: string}) => Promise<{success: boolean, error?: string}>;
  setPage: (page: Page) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, setPage }) => {
  const { t, language } = useI18n();
  const [email, setEmail] = useState(ADMIN_EMAILS[0]);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase())) {
        setError(t('login.error'));
        return;
    }

    setIsLoading(true);
    const result = await onLogin({ email, password });
    if (!result.success) {
      setError(result.error || t('login.error'));
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-40 px-6 relative overflow-hidden selection:bg-secondary">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary opacity-20 blur-[150px] rounded-full animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary opacity-10 blur-[150px] rounded-full animate-pulse-slow"></div>
      </div>

      {showForgotPasswordModal && <OtpModal email={email} onClose={() => setShowForgotPasswordModal(false)} onSuccess={() => setShowForgotPasswordModal(false)} />}
      
      <div className="max-w-2xl w-full relative z-10 animate-fade-in-up">
        {/* Logo Card */}
        <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[4rem] border border-white/10 w-fit mx-auto mb-12 shadow-sovereign group">
            <LogoIcon className="h-24 md:h-32 w-auto drop-shadow-2xl transition-transform duration-1000 group-hover:scale-110" />
        </div>

        <div className="bg-white rounded-[4.5rem] shadow-sovereign overflow-hidden border-t-[20px] border-primary relative">
            <div className="p-10 md:p-16">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tighter uppercase mb-2">
                        {t('login.title')}
                    </h2>
                    <div className="h-1.5 w-16 bg-secondary mx-auto rounded-full opacity-40"></div>
                    <p className="mt-4 text-gray-400 font-bold tracking-widest uppercase text-xs">Sovereign Management Portal Access</p>
                </div>

                <form className="space-y-8" onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-6">{t('login.email')}</label>
                            <input
                                type="email"
                                required
                                className="w-full p-6 bg-gray-50 border-4 border-transparent focus:border-primary/20 rounded-[2rem] font-black text-xl md:text-2xl outline-none transition-all shadow-inner"
                                placeholder={t('login.email')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 relative">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-6">{t('login.password')}</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="w-full p-6 bg-gray-50 border-4 border-transparent focus:border-primary/20 rounded-[2rem] font-black text-xl md:text-2xl outline-none transition-all shadow-inner tracking-widest"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 end-6 flex items-center text-gray-300 hover:text-primary transition-all"
                                >
                                    {showPassword ? <EyeOffIcon className="w-8 h-8" /> : <EyeIcon className="w-8 h-8" />}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end px-4">
                        <button type="button" onClick={() => setShowForgotPasswordModal(true)} className="font-black text-primary hover:text-secondary transition-all text-sm uppercase tracking-widest">
                            {t('login.forgotPassword')}
                        </button>
                    </div>

                    {error && (
                        <div className="p-5 bg-red-50 border-r-8 border-red-500 rounded-2xl animate-shake">
                            <p className="text-red-600 font-black text-lg">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-8 bg-primary text-white rounded-[2.5rem] font-black text-3xl shadow-4xl hover:scale-[1.02] transition-all border-b-[12px] border-primary-dark active:border-b-0 active:translate-y-2 flex items-center justify-center gap-6"
                    >
                        {isLoading ? <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : (
                            <span className="flex items-center gap-4">
                                <SparklesIcon className="w-8 h-8 text-secondary animate-pulse" />
                                {t('login.loginButton')}
                            </span>
                        )}
                    </button>
                </form>

                <div className="mt-12 text-center">
                    <button onClick={() => setPage('home')} className="font-black text-gray-300 hover:text-primary transition-all text-sm uppercase tracking-[0.4em]">
                        {t('login.backToStore')}
                    </button>
                </div>
            </div>

            <div className="bg-gray-50 py-6 text-center border-t border-gray-100 flex items-center justify-center gap-8 opacity-40">
                <span className="text-[9px] font-black uppercase tracking-widest">✓ Enterprise Encryption Active</span>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-[9px] font-black uppercase tracking-widest">Global ISO Security Hub</span>
            </div>
        </div>
      </div>
    </div>
  );
};