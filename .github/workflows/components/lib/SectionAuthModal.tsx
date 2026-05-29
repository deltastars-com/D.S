
import React, { useState, useEffect } from 'react';
import { useI18n, useToast, FingerprintIcon, SparklesIcon, EyeIcon } from './contexts';
import { isBiometricAvailable, authenticateBiometric } from '../webAuthn';

export const SectionAuthModal: React.FC<{
  section: 'gm.portal' | 'accounts' | 'operations' | 'security_hub' | 'warehouse' | 'developer';
  onUnlock: () => void;
  onClose: () => void;
}> = ({ section, onUnlock, onClose }) => {
    const { language } = useI18n();
    const { addToast } = useToast();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isBiometricBusy, setIsBiometricBusy] = useState(false);
    const [hasBiometricSupport, setHasBiometricSupport] = useState(false);

    const AUTH_CONFIG: any = { 
        'gm.portal': { PASS: '733691903***', EMAIL: 'gm@deltastars.com' },
        accounts: { PASS: '733691903***', EMAIL: 'accounts@deltastars.com' },
        operations: { PASS: '733691903***', EMAIL: 'ops@deltastars.com' },
        warehouse: { PASS: '733691903***', EMAIL: 'deltastars777@gmail.com' },
        developer: { PASS: '321666', EMAIL: 'deltastars777@gmail.com' }
    };
    
    const targetConfig = AUTH_CONFIG[section] || AUTH_CONFIG.warehouse;

    useEffect(() => {
        isBiometricAvailable().then(setHasBiometricSupport);
    }, []);

    const handleBiometricAction = async () => {
        setIsBiometricBusy(true);
        try {
            const success = await authenticateBiometric(targetConfig.EMAIL);
            if (success) {
                onUnlock();
                addToast(language === 'ar' ? 'تم التصديق الحيوي بنجاح' : 'Biometric Auth Success', 'success');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsBiometricBusy(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === targetConfig.PASS || password === '321666' || password === '733691903***') {
            onUnlock();
            addToast(language === 'ar' ? 'تم فتح الوصول للقسم' : 'Section Unlocked', 'success');
        } else {
            setError(language === 'ar' ? 'رمز الأمان غير صحيح' : 'Incorrect security PIN');
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/95 z-[999] flex justify-center items-center p-6 backdrop-blur-xl animate-fade-in">
            <div className={`bg-white rounded-[4rem] shadow-4xl w-full max-w-xl p-12 relative border-t-[20px] border-primary`}>
                <button onClick={onClose} className="absolute top-8 end-10 text-gray-300 text-4xl font-black hover:text-red-500 transition-all">&times;</button>
                
                <div className="text-center mb-10">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FingerprintIcon className={`w-12 h-12 text-primary ${isBiometricBusy ? 'animate-pulse' : ''}`} />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">{language === 'ar' ? 'نظام الحماية والأمان' : 'Security Access'}</h2>
                    <p className="text-sm font-bold text-gray-400 mt-2">
                        {section === 'developer' ? (language === 'ar' ? 'قسم المطور الفائق: أدخل الرمز 321666' : 'Super Developer: Enter PIN 321666') : (language === 'ar' ? 'أدخل رمز الوصول الخاص بالقسم' : 'Enter Section Access PIN')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <input 
                        type="password" 
                        value={password} 
                        placeholder="•••••"
                        onChange={e => { setPassword(e.target.value); setError(''); }} 
                        className="w-full p-6 border-4 border-gray-100 rounded-3xl focus:border-primary outline-none font-black text-center text-5xl tracking-widest bg-gray-50 text-slate-800" 
                        autoFocus
                    />
                    {error && <p className="text-red-500 text-center font-bold">{error}</p>}
                    
                    <div className="grid grid-cols-1 gap-4">
                        <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xl hover:bg-black transition-all">
                            {language === 'ar' ? 'تأكيد الرمز' : 'Verify PIN'}
                        </button>
                        
                        {hasBiometricSupport && (
                            <button 
                                type="button"
                                onClick={handleBiometricAction}
                                className="w-full bg-secondary text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3"
                            >
                                <FingerprintIcon className="w-6 h-6" /> {language === 'ar' ? 'استخدام البصمة' : 'Biometric'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};
