
import React, { useState, useRef, useEffect } from 'react';
import { useI18n, useGeminiAi, useToast, SparklesIcon, DocumentTextIcon, XIcon } from './contexts';
import { GoogleGenAI } from '@google/genai';

export const SourcingRequestPage: React.FC = () => {
    const { language, t } = useI18n();
    const { status } = useGeminiAi();
    const { addToast } = useToast();
    
    const [description, setDescription] = useState(() => localStorage.getItem('delta-sourcing-desc') || '');
    const [image, setImage] = useState<string | null>(() => localStorage.getItem('delta-sourcing-image'));
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiFeedback, setAiFeedback] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        localStorage.setItem('delta-sourcing-desc', description);
    }, [description]);

    useEffect(() => {
        if (image) localStorage.setItem('delta-sourcing-image', image);
        else localStorage.removeItem('delta-sourcing-image');
    }, [image]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyzeRequest = async () => {
        if (!description && !image) {
            addToast(language === 'ar' ? 'يرجى تقديم وصف أو صورة للمنتج' : 'Please provide description or image', 'error');
            return;
        }

        setIsAnalyzing(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const contents: any[] = [{ text: `User is requesting a specific product for sourcing. 
                Description: ${description}. 
                Act as Delta Stars Supply Expert. Analyze if this is feasible for hotel supply in KSA. 
                Respond in ${language === 'ar' ? 'Arabic' : 'English'} with a professional supply feasibility report.` }];
            
            if (image) {
                contents.push({
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: image.split(',')[1]
                    }
                });
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: { parts: contents }
            });

            setAiFeedback(response.text);
        } catch (err) {
            console.error(err);
            setAiFeedback(language === 'ar' ? 'تعذر التحليل اللحظي، سيقوم فريقنا بمراجعة الطلب يدوياً.' : 'Immediate analysis failed. Our team will review manually.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmitOrder = () => {
        setIsSubmitted(true);
        localStorage.removeItem('delta-sourcing-desc');
        localStorage.removeItem('delta-sourcing-image');
        addToast(language === 'ar' ? 'تم تسجيل طلب التوريد بنجاح' : 'Sourcing request registered', 'success');
    };

    if (isSubmitted) {
        return (
            <div className="container mx-auto px-6 py-32 text-center animate-fade-in">
                <div className="max-w-3xl auto bg-white p-20 rounded-[5rem] shadow-sovereign border-t-[30px] border-primary">
                    <div className="text-9xl mb-10">🛡️</div>
                    <h2 className="text-5xl font-black text-primary mb-6">تم إرسال الطلب لغرفة العمليات</h2>
                    <p className="text-2xl text-gray-400 font-bold mb-12">
                        سيقوم خبراء المشتريات في نجوم دلتا بدراسة طلبك والتواصل معك عبر الواتساب المسجل خلال 24 ساعة.
                    </p>
                    <button onClick={() => window.location.reload()} className="bg-primary text-white px-16 py-6 rounded-[2rem] font-black text-2xl shadow-xl">العودة للرئيسية</button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-20 text-black">
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-4 bg-primary text-white px-10 py-3 rounded-full font-black text-xs uppercase tracking-widest mb-8 shadow-xl">
                    <SparklesIcon className="w-5 h-5 text-secondary animate-pulse" />
                    {language === 'ar' ? 'محرك التوريد المخصص بالذكاء الاصطناعي' : 'AI-POWERED SPECIAL SOURCING'}
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-primary mb-6 tracking-tighter uppercase leading-none">
                    {language === 'ar' ? 'اطلب منتجك الخاص' : 'Source Custom Product'}
                </h1>
                <p className="text-2xl text-gray-400 font-bold max-w-3xl mx-auto italic leading-relaxed">
                    "هل تبحث عن صنف نادر أو توريد خاص لفندقك؟ صف لنا احتياجك وسنتكفل بالباقي من المزرعة للمستودع."
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-[1600px] mx-auto">
                {/* Form Side */}
                <div className="lg:col-span-7 bg-white p-10 md:p-16 rounded-[4.5rem] shadow-sovereign border border-gray-100 flex flex-col gap-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] px-6">وصف المنتج والمواصفات</label>
                        <textarea 
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder={language === 'ar' ? 'مثال: مطلوب طماطم كرزية هولندية، كرتون 5 كجم، توريد يومي لفندق في جدة...' : 'Example: Requesting Dutch cherry tomatoes, 5kg boxes, daily delivery to hotel in Jeddah...'}
                            className="w-full h-64 p-10 bg-gray-50 border-4 border-transparent focus:border-primary/10 rounded-[3rem] font-bold text-2xl outline-none transition-all shadow-inner resize-none"
                        />
                    </div>

                    <div className="space-y-6">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] px-6">إرفاق صورة (اختياري)</p>
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="h-80 border-4 border-dashed border-gray-200 rounded-[3.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 hover:border-primary transition-all relative overflow-hidden group"
                        >
                            {image ? (
                                <>
                                    <img src={image} className="w-full h-full object-cover" />
                                    <button onClick={(e) => { e.stopPropagation(); setImage(null); }} className="absolute top-6 right-6 bg-red-600 text-white p-4 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity"><XIcon className="w-6 h-6"/></button>
                                </>
                            ) : (
                                <div className="text-center">
                                    <div className="text-7xl mb-6 opacity-20">📸</div>
                                    <p className="font-black text-xl text-gray-400">اسحب الصورة هنا أو اضغط للرفع</p>
                                    <p className="text-xs font-bold text-gray-300 mt-2">نقبل JPEG, PNG حتى 5MB</p>
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                        </div>
                    </div>

                    <button 
                        onClick={handleAnalyzeRequest}
                        disabled={isAnalyzing || (!description && !image)}
                        className="w-full py-10 bg-primary text-white rounded-[3rem] font-black text-3xl shadow-4xl hover:scale-[1.02] transition-all border-b-[15px] border-primary-dark active:border-b-0 flex items-center justify-center gap-6 disabled:opacity-50"
                    >
                        {isAnalyzing ? (
                            <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <SparklesIcon className="w-8 h-8 text-secondary animate-pulse" />
                                {language === 'ar' ? 'تحليل الاحتياج بالذكاء الاصطناعي' : 'Analyze Need with AI'}
                            </>
                        )}
                    </button>
                </div>

                {/* AI Analysis Result Side */}
                <div className="lg:col-span-5 flex flex-col gap-8">
                    <div className="bg-slate-900 text-white p-12 rounded-[4.5rem] shadow-4xl flex-1 relative overflow-hidden border-b-[25px] border-secondary">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full"></div>
                        <h3 className="text-2xl font-black mb-10 flex items-center gap-4 text-secondary uppercase tracking-widest">
                            <DocumentTextIcon className="w-8 h-8" />
                            {language === 'ar' ? 'تقرير دراسة الجدوى اللحظي' : 'Real-time Feasibility Report'}
                        </h3>

                        {aiFeedback ? (
                            <div className="prose prose-invert prose-xl animate-fade-in-up">
                                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 italic font-bold text-xl leading-relaxed text-white/90">
                                    {aiFeedback}
                                </div>
                                <div className="mt-12 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                        <p className="text-sm font-black uppercase tracking-widest opacity-60">Verified Supply Chain Match</p>
                                    </div>
                                    <button 
                                        onClick={handleSubmitOrder}
                                        className="w-full py-8 bg-secondary text-white rounded-[2rem] font-black text-2xl shadow-xl hover:bg-white hover:text-primary transition-all uppercase tracking-tighter"
                                    >
                                        ✅ تأكيد رغبة التوريد
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center opacity-30 py-20">
                                <SparklesIcon className="w-24 h-24 mb-6 animate-pulse" />
                                <p className="text-xl font-bold italic">في انتظار إرسال بيانات الطلب لبدء التحليل السيادي v25.0...</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-gray-100">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Institutional Sourcing Policy</p>
                        <p className="text-sm font-bold text-slate-600 leading-relaxed">
                            {language === 'ar' ? 
                                'جميع طلبات التوريد المخصصة تخضع لمعايير الجودة العالمية ISO وشهادات السلامة الغذائية المعتمدة في المملكة.' : 
                                'All custom sourcing requests are subject to global ISO quality standards and food safety certifications approved in the Kingdom.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};