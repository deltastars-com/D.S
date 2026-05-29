
import React, { useState, useEffect } from 'react';
import { useI18n } from './contexts/I18nContext';
import { COMPANY_INFO } from '../constants';
import { XIcon, SparklesIcon, FingerprintIcon, StarIcon, DocumentTextIcon } from './contexts/Icons';

interface PaymentPortalProps {
    amount: number;
    orderId: string;
    initialMethod?: 'mada' | 'visa' | 'apple' | 'bank' | 'paypal';
    onSuccess: (transactionId: string) => void;
    onCancel: () => void;
}

export const PaymentPortal: React.FC<PaymentPortalProps> = ({ amount, orderId, initialMethod, onSuccess, onCancel }) => {
    const { language, formatCurrency } = useI18n();
    const [step, setStep] = useState<'method' | 'card' | 'paypal' | 'bank' | 'tabby' | 'tamara' | 'processing' | 'success'>('method');
    const [method, setMethod] = useState<'mada' | 'visa' | 'apple' | 'bank' | 'paypal' | 'tabby' | 'tamara'>(initialMethod || 'mada');

    useEffect(() => {
        if (initialMethod) {
            if (initialMethod === 'paypal') setStep('paypal');
            else if (initialMethod === 'bank') setStep('bank');
            // @ts-ignore
            else if (initialMethod === 'tabby') setStep('tabby');
            // @ts-ignore
            else if (initialMethod === 'tamara') setStep('tamara');
            else setStep('card');
        }
    }, [initialMethod]);

    const handlePayment = () => {
        setStep('processing');
        setTimeout(() => {
            setStep('success');
            setTimeout(() => onSuccess(`TXN-${Date.now()}`), 2000);
        }, 3000);
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-10 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-4xl overflow-hidden border-t-[15px] border-primary relative flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-8 md:p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 backdrop-blur-md sticky top-0 z-50">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary font-black text-2xl shadow-xl border-2 border-primary/10 overflow-hidden">
                            <img src="https://moyasar.com/assets/logo-b94d9307.svg" alt="Moyasar" className="w-full p-2" onError={(e) => e.currentTarget.src = "https://placehold.co/100x100?text=M"} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tighter leading-none mb-1">{language === 'ar' ? 'بوابة سداد دلتا ستارز' : 'Delta Stars Payment Gateway'}</h2>
                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                Secured by Moyasar IPG
                            </p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="bg-gray-100/50 hover:bg-black hover:text-white p-4 rounded-full transition-all group">
                        <XIcon className="w-6 h-6 group-hover:rotate-90 transition-transform"/>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    {step === 'method' && (
                        <div className="space-y-8 animate-fade-in-right">
                            <div className="bg-primary/5 p-8 rounded-[2.5rem] border-2 border-primary/10 flex justify-between items-center shadow-inner">
                                <div>
                                    <p className="text-gray-500 font-bold mb-1 text-sm">{language === 'ar' ? 'إجمالي المستحقات' : 'Total Payable'}</p>
                                    <p className="text-5xl font-black text-primary tracking-tighter leading-none">{formatCurrency(amount)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">DeltaID-91</p>
                                    <div className="bg-primary text-white text-[10px] px-3 py-1 rounded-full font-black">#{orderId.split('-')[0]}</div>
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-slate-800 border-r-4 border-secondary pr-4 leading-none">{language === 'ar' ? 'تحديد وسيلة السداد الآمنة' : 'Secure Payment Method Selection'}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button onClick={() => { setMethod('visa'); setStep('card'); }} className="p-6 bg-white border-2 border-gray-100 rounded-3xl flex flex-col justify-between items-center hover:border-primary transition-all group hover:bg-slate-50 shadow-sm">
                                    <div className="flex gap-2 mb-4">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Mada_Logo.svg/2560px-Mada_Logo.svg.png" className="h-6 object-contain" />
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" className="h-6 object-contain" />
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" className="h-6 object-contain" />
                                    </div>
                                    <span className="text-sm font-black group-hover:text-primary">Mada/Visa/MasterCard</span>
                                </button>

                                <button onClick={() => { setMethod('paypal'); setStep('paypal'); }} className="p-6 bg-blue-50/50 border-2 border-transparent rounded-3xl flex flex-col justify-between items-center hover:border-blue-500 transition-all group hover:bg-blue-50 shadow-sm">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png" className="h-8 object-contain mb-4" />
                                    <span className="text-sm font-black text-blue-900 uppercase tracking-widest">PayPal Express</span>
                                </button>

                                <button onClick={() => { setMethod('tabby'); setStep('tabby'); }} className="p-6 bg-green-50/50 border-2 border-transparent rounded-3xl flex flex-col justify-between items-center hover:border-green-500 transition-all group hover:bg-green-50 shadow-sm">
                                    <div className="bg-[#ccff00] text-black px-4 py-1 rounded-lg font-black text-xs mb-4">tabby</div>
                                    <span className="text-sm font-black text-green-900 uppercase">قسم فاتورتك (Installments)</span>
                                </button>

                                <button onClick={() => { setMethod('tamara'); setStep('tamara'); }} className="p-6 bg-amber-50/50 border-2 border-transparent rounded-3xl flex flex-col justify-between items-center hover:border-amber-500 transition-all group hover:bg-amber-50 shadow-sm">
                                    <div className="bg-[#ffcc99] text-black px-4 py-1 rounded-lg font-black text-xs mb-4 uppercase">tamara</div>
                                    <span className="text-sm font-black text-amber-900 uppercase tracking-tight">تمارا (قسطها)</span>
                                </button>

                                <button onClick={() => setStep('bank')} className="p-6 bg-white border-2 border-gray-100 rounded-3xl flex flex-col justify-between items-center hover:border-primary transition-all group hover:bg-slate-50 sm:col-span-2 shadow-sm">
                                    <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-full text-primary font-black mb-4">IBAN</div>
                                    <span className="text-sm font-black group-hover:text-primary">Official Bank Transfer (حوالة بنكية للشركة)</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'tabby' && (
                        <div className="space-y-10 py-10 text-center animate-fade-in-up">
                            <button onClick={() => setStep('method')} className="text-primary font-black flex items-center gap-2 hover:underline mb-10">&larr; طرق الدفع الأخرى</button>
                            <div className="bg-green-50/50 p-10 md:p-16 rounded-[4rem] border-4 border-[#ccff00]/30 shadow-2xl">
                                <div className="bg-[#ccff00] w-32 h-12 flex items-center justify-center rounded-xl mx-auto mb-10 text-black font-black text-2xl shadow-xl">tabby</div>
                                <h3 className="text-3xl font-black text-green-950 mb-6 uppercase tracking-tighter">قسمها على 4 دفعات بدون فوائد</h3>
                                <p className="text-xl font-bold text-green-800 mb-10 leading-relaxed max-w-md mx-auto">سيتم توجيهك لمنصة تابي المعتمدة لإتمام عملية التقسيط بأمان تام.</p>
                                <button onClick={handlePayment} className="w-full py-8 bg-black text-white rounded-[2.5rem] font-black text-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                                    متابعة عبر Tabby
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'tamara' && (
                        <div className="space-y-10 py-10 text-center animate-fade-in-up">
                            <button onClick={() => setStep('method')} className="text-primary font-black flex items-center gap-2 hover:underline mb-10">&larr; طرق الدفع الأخرى</button>
                            <div className="bg-amber-50/50 p-10 md:p-16 rounded-[4rem] border-4 border-[#ffcc99]/30 shadow-2xl">
                                <div className="bg-[#ffcc99] w-32 h-12 flex items-center justify-center rounded-xl mx-auto mb-10 text-black font-black text-2xl shadow-xl uppercase">tamara</div>
                                <h3 className="text-3xl font-black text-amber-950 mb-6 uppercase tracking-tighter">قسّط مشترياتك مع تمارا</h3>
                                <p className="text-xl font-bold text-amber-800 mb-10 leading-relaxed max-w-md mx-auto">استمتع بتجربة تسوق سيادية مع أطول فترة سداد ممكنة بدون رسوم إضافية.</p>
                                <button onClick={handlePayment} className="w-full py-8 bg-[#1A1A1A] text-white rounded-[2.5rem] font-black text-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                                    متابعة عبر Tamara
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'card' && (
                        <div className="space-y-8 animate-fade-in-up">
                            <button onClick={() => setStep('method')} className="text-primary font-black flex items-center gap-2 hover:underline">&larr; الرجوع لطرق الدفع</button>
                            <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full"></div>
                                <div className="flex justify-between items-start mb-12">
                                    <div className="w-16 h-12 bg-yellow-400/20 rounded-lg border border-yellow-400/30"></div>
                                    <FingerprintIcon className="w-10 h-10 text-white/20" />
                                </div>
                                <div className="space-y-8">
                                    <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-transparent border-b-2 border-white/20 text-3xl font-mono tracking-widest focus:border-white outline-none pb-2" />
                                    <div className="grid grid-cols-2 gap-10">
                                        <input type="text" placeholder="MM/YY" className="bg-transparent border-b-2 border-white/20 text-xl font-mono focus:border-white outline-none pb-2" />
                                        <input type="text" placeholder="CVV" className="bg-transparent border-b-2 border-white/20 text-xl font-mono focus:border-white outline-none pb-2" />
                                    </div>
                                    <input type="text" placeholder="CARDHOLDER NAME" className="w-full bg-transparent border-b-2 border-white/20 text-sm font-mono tracking-widest focus:border-white outline-none pb-2 uppercase" />
                                </div>
                            </div>
                            <button onClick={handlePayment} className="w-full py-8 bg-primary text-white rounded-[2.5rem] font-black text-2xl shadow-4xl hover:scale-[1.02] transition-all">
                                {language === 'ar' ? 'تأكيد السداد الآمن' : 'Confirm Secure Payment'}
                            </button>
                        </div>
                    )}

                    {step === 'paypal' && (
                        <div className="space-y-10 py-10 text-center animate-fade-in-up">
                            <button onClick={() => setStep('method')} className="text-primary font-black flex items-center gap-2 hover:underline mb-10">&larr; الرجوع لطرق الدفع</button>
                            <div className="bg-blue-50 p-16 rounded-[4rem] border-4 border-blue-100">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png" className="h-16 mx-auto mb-10" />
                                <p className="text-xl font-bold text-blue-900 mb-10">سيتم توجيهك الآن إلى صفحة بايبال لإتمام عملية الدفع بأمان.</p>
                                <button onClick={handlePayment} className="w-full py-8 bg-[#0070ba] text-white rounded-[2.5rem] font-black text-2xl shadow-xl hover:bg-[#005ea6] transition-all">
                                    الدفع بواسطة PayPal
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'bank' && (
                        <div className="space-y-8 animate-fade-in-up">
                            <button onClick={() => setStep('method')} className="text-primary font-black flex items-center gap-2 hover:underline">&larr; الرجوع لطرق الدفع</button>
                            
                            <div className="bg-primary text-white p-10 rounded-[3rem] shadow-4xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 blur-3xl rounded-full"></div>
                                <h3 className="text-2xl font-black mb-8 border-b border-white/10 pb-4">بيانات التحويل الرسمي</h3>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">اسم البنك</p>
                                        <p className="text-2xl font-black">{COMPANY_INFO.bank.name}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">رقم الحساب</p>
                                            <p className="text-lg font-mono font-bold">{COMPANY_INFO.bank.account_number}</p>
                                        </div>
                                        <div>
                                            <p className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">رقم الفرع</p>
                                            <p className="text-lg font-mono font-bold">{COMPANY_INFO.bank.branch}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 p-6 rounded-2xl border border-white/10 group cursor-pointer" onClick={() => {
                                        navigator.clipboard.writeText(COMPANY_INFO.bank.iban);
                                        alert('تم نسخ رقم الآيبان بنجاح');
                                    }}>
                                        <p className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">رقم الآيبان (IBAN)</p>
                                        <p className="text-xl font-mono font-bold break-all group-hover:text-secondary transition-colors">{COMPANY_INFO.bank.iban}</p>
                                        <p className="mt-2 text-[8px] opacity-50 uppercase font-black">Click to copy</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-8 rounded-3xl border-2 border-dashed border-gray-200 text-center">
                                <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-bold mb-6">يرجى تحويل المبلغ المذكور وإرفاق صورة السند عبر واتساب الشركة لتأكيد طلبكم فوراً.</p>
                                <button onClick={() => window.open(`https://wa.me/${COMPANY_INFO.whatsapp}?text=Order%20Payment%20Reference:%20${orderId}`, '_blank')} className="bg-green-500 text-white px-12 py-4 rounded-2xl font-black text-xl shadow-xl hover:bg-green-600 transition-all">تأكيد التحويل عبر واتساب</button>
                            </div>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="py-20 text-center space-y-10 animate-pulse">
                            <div className="w-32 h-32 border-8 border-primary border-t-transparent rounded-full animate-spin mx-auto shadow-2xl"></div>
                            <h3 className="text-3xl font-black text-primary">{language === 'ar' ? 'جاري التحقق...' : 'Verifying...'}</h3>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="py-16 text-center space-y-8 animate-fade-in-up">
                            <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-4xl text-white text-6xl">✓</div>
                            <h3 className="text-4xl font-black text-slate-800">{language === 'ar' ? 'تمت العملية بنجاح' : 'Success!'}</h3>
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-gray-100 bg-gray-50 flex justify-center items-center gap-10 grayscale opacity-40">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Mada_Logo.svg/2560px-Mada_Logo.svg.png" className="h-6" />
                    <img src="https://moyasar.com/assets/logo-b94d9307.svg" className="h-4" />
                    <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-tighter">
                        <span className="p-1 bg-green-500 text-white rounded">SSL</span> 256-bit Secure
                    </div>
                </div>
            </div>
        </div>
    );
};
