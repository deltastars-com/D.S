import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/supabaseClient'; 
import { Bot, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AiAssistant = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([
    { text: 'مرحباً بك في شركة دلتا ستارز للتجارة! أنا عدي، مساعدك الذكي. اسألني عن أي منتج، أسعاره، أو طريقة الطلب.', isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // التمرير التلقائي لأسفل المحادثة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // دالة جلب بيانات المنتجات من سوبابيز بناءً على سؤال العميل
  const fetchContextFromSupabase = async (userQuery: string) => {
    // بحث مبسط في قاعدة البيانات عن الكلمات المفتاحية
    const keywords = userQuery.split(' ').filter(word => word.length > 2);
    let query = supabase.from('products').select('name_ar, price, min_weight, stock_status, description').eq('is_active', true);
    
    if (keywords.length > 0) {
      query = query.ilike('name_ar', `%${keywords[0]}%`).limit(5);
    } else {
      query = query.limit(5); // جلب عينة افتراضية
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) return "لا تتوفر معلومات دقيقة حالياً في قاعدة البيانات.";
    
    // تحويل البيانات إلى نص يفهمه جيمناي
    return data.map(p => `المنتج: ${p.name_ar}، السعر: ${p.price} ريال، أقل كمية للطلب: ${p.min_weight}، الحالة: ${p.stock_status}`).join(' | ');
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userText = input;
    setMessages(prev => [...prev, { text: userText, isUser: true }]);
    setInput('');
    setIsLoading(true);

    try {
      // 1. جلب المعلومات من سوبابيز أولاً
      const dbContext = await fetchContextFromSupabase(userText);

      // 2. تجهيز الموجه الشامل لجيمناي
      const systemPrompt = `
      أنت "عدي"، المساعد الذكي والمحترف لشركة "دلتا ستارز للتجارة".
      مهمتك: الرد على استفسارات العملاء بلباقة، بلهجة سعودية ترحيبية، واختصار.
      معلومات من قاعدة بيانات المتجر بناءً على سؤال العميل: [ ${dbContext} ].
      قواعد صارمة:
      - إذا كان المنتج متوفراً اذكر سعره والحد الأدنى للطلب.
      - الحد الأدنى لإتمام أي طلب في المتجر هو 50 ريال.
      - لا تخترع أسعاراً من عندك، اعتمد فقط على المعلومات بين الأقواس.
      - أجب على سؤال العميل التالي بناءً على المعطيات: ${userText}
      `;

      // 3. إرسال الطلب إلى Gemini API
      const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY; 
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { temperature: 0.3 } // درجة حرارة منخفضة لضمان دقة الأسعار
        })
      });

      if (!response.ok) throw new Error('فشل الاتصال بالذكاء الاصطناعي');

      const apiData = await response.json();
      const botResponse = apiData.candidates[0].content.parts[0].text;

      setMessages(prev => [...prev, { text: botResponse, isUser: false }]);

    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { text: 'عذراً، أواجه ضغطاً في النظام حالياً. يرجى التواصل معنا عبر الواتساب: 0558828009', isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] no-print">
      {/* زر فتح المحادثة */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-2xl transition-transform transform hover:scale-110 flex items-center justify-center font-black"
        id="ai-assistant-toggle"
      >
        {isOpen ? (
          <X className="w-8 h-8" />
        ) : (
          <Bot className="w-8 h-8" />
        )}
      </button>

      {/* نافذة المحادثة */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-80 sm:w-96 bg-white rounded-3xl shadow-4xl border border-gray-100 flex flex-col h-[550px] overflow-hidden"
            id="ai-assistant-window"
          >
            
            {/* رأس النافذة */}
            <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 p-6 text-white flex items-center gap-4 shadow-lg">
              <div className="bg-white/20 p-2 rounded-2xl">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div className="text-right">
                <h3 className="font-black text-xl leading-tight">المساعد الذكي عدي</h3>
                <p className="text-xs text-emerald-100 font-bold">شركة دلتا ستارز للتجارة</p>
              </div>
            </div>

            {/* منطقة الرسائل */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50" dir="rtl">
              {messages.map((m, index) => (
                <div key={index} className={`flex ${m.isUser ? 'justify-start' : 'justify-end'}`}>
                  <div className={`p-4 rounded-2xl max-w-[85%] text-sm font-bold shadow-sm ${
                    m.isUser 
                      ? 'bg-emerald-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 border border-gray-100 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-end">
                  <div className="bg-white text-emerald-600 border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-2">
                    <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}>●</motion.span>
                    <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}>●</motion.span>
                    <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}>●</motion.span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* منطقة الإدخال */}
            <div className="p-4 bg-white border-t border-gray-100 flex gap-2 items-center" dir="rtl">
              <input 
                type="text" 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyPress={e => e.key === 'Enter' && handleSend()} 
                disabled={isLoading}
                className="flex-1 border-2 border-slate-100 rounded-2xl px-6 py-3 text-sm font-black focus:outline-none focus:border-emerald-500 transition-all" 
                placeholder="اسأل عن أي منتج..." 
                id="ai-assistant-input"
              />
              <button 
                onClick={handleSend} 
                disabled={isLoading || !input.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white rounded-2xl px-4 py-3 flex items-center justify-center shadow-lg transition-all hover:scale-105"
                id="ai-assistant-send"
              >
                <Send className="w-5 h-5 rotate-180" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AiAssistant;
