import React from 'react';
import { FingerprintIcon } from 'lucide-react';

interface SecurityManagementSectionProps {
    language: 'ar' | 'en';
    isBiometricEnabled: boolean;
    setIsBiometricEnabled: (val: boolean) => void;
    isFaceIdEnabled: boolean;
    setIsFaceIdEnabled: (val: boolean) => void;
}

export const SecurityManagementSection: React.FC<SecurityManagementSectionProps> = ({
    language,
    isBiometricEnabled,
    setIsBiometricEnabled,
    isFaceIdEnabled,
    setIsFaceIdEnabled,
}) => {
    return (
        <div className="space-y-8 md:space-y-12 animate-fade-in">
            <h2 className="text-2xl md:text-4xl font-black text-slate-800 uppercase flex items-center gap-4 text-center md:text-right">
                <FingerprintIcon className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                {language === 'ar' ? 'نظام الحماية السيادي' : 'Sovereign Security Protocols'}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                <div className="bg-slate-50 p-6 md:p-10 rounded-2xl md:rounded-[3rem] border-2 border-gray-100 space-y-6 md:space-y-8">
                    <h3 className="text-xl md:text-2xl font-black text-primary">
                        {language === 'ar' ? 'تغيير كلمة مرور المطور' : 'Change Developer Password'}
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">
                                {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full p-4 md:p-5 bg-white border-2 border-transparent focus:border-primary rounded-xl md:rounded-2xl font-bold outline-none shadow-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">
                                {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full p-4 md:p-5 bg-white border-2 border-transparent focus:border-primary rounded-xl md:rounded-2xl font-bold outline-none shadow-sm"
                            />
                        </div>
                        <button className="w-full py-4 md:py-5 bg-primary text-white rounded-xl md:rounded-2xl font-black text-lg md:text-xl shadow-lg hover:bg-secondary transition-all">
                            {language === 'ar' ? 'تحديث مفتاح الوصول السيادي' : 'Update Sovereign Access Key'}
                        </button>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 md:p-10 rounded-2xl md:rounded-[3rem] border-2 border-gray-100 space-y-6 md:space-y-8">
                    <h3 className="text-xl md:text-2xl font-black text-primary">
                        {language === 'ar' ? 'المصادقة الثنائية (MFA)' : 'Biometric Authentication'}
                    </h3>
                    <div className="flex items-center justify-between p-4 md:p-6 bg-white rounded-xl md:rounded-2xl border border-gray-100">
                        <div>
                            <p className="font-black text-slate-800 text-sm md:text-base">{language === 'ar' ? 'بصمة الإصبع' : 'Fingerprint'}</p>
                            <p className="text-[10px] md:text-xs text-gray-400 font-bold">
                                {language === 'ar' ? 'تفعيل الدخول عبر البصمة' : 'Enable Biometric Access'}
                            </p>
                        </div>
                        <div
                            onClick={() => setIsBiometricEnabled(!isBiometricEnabled)}
                            className={`w-12 md:w-16 h-6 md:h-8 rounded-full relative cursor-pointer transition-all ${
                                isBiometricEnabled ? 'bg-primary' : 'bg-gray-200'
                            }`}
                        >
                            <div
                                className={`absolute top-1 w-4 md:w-6 h-4 md:h-6 bg-white rounded-full shadow-sm transition-all ${
                                    isBiometricEnabled ? 'right-1' : 'left-1'
                                }`}
                            ></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 md:p-6 bg-white rounded-xl md:rounded-2xl border border-gray-100">
                        <div>
                            <p className="font-black text-slate-800 text-sm md:text-base">
                                {language === 'ar' ? 'التعرف على الوجه' : 'Face Recognition'}
                            </p>
                            <p className="text-[10px] md:text-xs text-gray-400 font-bold">
                                {language === 'ar' ? 'تفعيل الدخول عبر الوجه' : 'Enable Face ID'}
                            </p>
                        </div>
                        <div
                            onClick={() => setIsFaceIdEnabled(!isFaceIdEnabled)}
                            className={`w-12 md:w-16 h-6 md:h-8 rounded-full relative cursor-pointer transition-all ${
                                isFaceIdEnabled ? 'bg-primary' : 'bg-gray-200'
                            }`}
                        >
                            <div
                                className={`absolute top-1 w-4 md:w-6 h-4 md:h-6 bg-white rounded-full shadow-sm transition-all ${
                                    isFaceIdEnabled ? 'right-1' : 'left-1'
                                }`}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 p-6 md:p-10 rounded-2xl md:rounded-[3rem] border-2 border-gray-100 space-y-6 md:space-y-8">
                <h3 className="text-xl md:text-2xl font-black text-primary">
                    {language === 'ar' ? 'إدارة صلاحيات الوكلاء والفروع' : 'Branch & Agent Permissions'}
                </h3>
                <div className="space-y-4">
                    {[
                        { id: 'view_orders', label_ar: 'عرض الطلبات', label_en: 'View Orders' },
                        { id: 'update_status', label_ar: 'تحديث حالة الطلب', label_en: 'Update Order Status' },
                        { id: 'manage_stock', label_ar: 'إدارة المخزون المحلي', label_en: 'Manage Local Stock' },
                        { id: 'assign_driver', label_ar: 'تعيين مناديب التوصيل', label_en: 'Assign Delivery Drivers' },
                    ].map((perm) => (
                        <div key={perm.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
                            <span className="font-bold text-slate-700">{language === 'ar' ? perm.label_ar : perm.label_en}</span>
                            <div className="w-10 h-5 bg-primary/20 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-primary rounded-full"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-red-50 p-6 md:p-10 rounded-2xl md:rounded-[3rem] border-2 border-red-100 text-center md:text-right">
                <h3 className="text-xl md:text-2xl font-black text-red-600 mb-4 md:mb-6 uppercase tracking-tighter">Emergency Lockdown</h3>
                <p className="text-sm md:text-base text-red-400 font-bold mb-6 md:mb-8">
                    {language === 'ar'
                        ? 'في حالة اكتشاف اختراق، سيتم إغلاق كافة قنوات التوريد وتشفير قاعدة البيانات فوراً.'
                        : 'In case of breach detection, all supply channels will be closed and DB encrypted immediately.'}
                </p>
                <button className="w-full md:w-auto px-8 md:px-12 py-4 md:py-5 bg-red-600 text-white rounded-xl md:rounded-2xl font-black text-lg md:text-xl shadow-xl hover:bg-red-700 transition-all">
                    {language === 'ar' ? 'تفعيل الإغلاق الشامل' : 'Activate Total Lockdown'}
                </button>
            </div>
        </div>
    );
};
