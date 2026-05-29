
import React from 'react';
import { COMPANY_INFO, SOCIAL_LINKS, INSTITUTIONAL_VERIFICATION } from '../constants';
import { 
    FacebookIcon, 
    InstagramIcon, 
    YoutubeIcon, 
    SnapchatIcon, 
    TiktokIcon, 
    WhatsappIcon, 
    TelegramIcon,
    TwitterXIcon,
    LogoIcon, 
    PhoneIcon,
    LocationMarkerIcon,
    MailIcon
} from './contexts/Icons';
import { useI18n } from './contexts/I18nContext';
import { Page } from '../../types';

interface FooterProps {
  setPage: (page: Page) => void;
}

export const Footer: React.FC<FooterProps> = ({ setPage }) => {
  const { t, language } = useI18n();
  
  const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3710.865488107576!2d39.22013837588724!3d21.55243897008537!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15c3d9a100000001%3A0x3f5b721e0a6d0c9f!2sDelta%20Stars%20Trading%20Company!5e0!3m2!1sar!2ssa!4v1716986629168!5m2!1sar!2ssa";

  const socialPlatforms = [
    { icon: <TwitterXIcon />, url: SOCIAL_LINKS.twitter_x, name: 'X', color: 'bg-black', glow: 'shadow-slate-400/30' },
    { icon: <FacebookIcon />, url: SOCIAL_LINKS.facebook, name: 'Facebook', color: 'bg-[#1877F2]', glow: 'shadow-blue-500/30' },
    { icon: <InstagramIcon />, url: SOCIAL_LINKS.instagram, name: 'Instagram', color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]', glow: 'shadow-pink-500/30' },
    { icon: <TiktokIcon />, url: SOCIAL_LINKS.tiktok, name: 'TikTok', color: 'bg-slate-900', glow: 'shadow-cyan-400/30' },
    { icon: <SnapchatIcon />, url: SOCIAL_LINKS.snapchat, name: 'Snapchat', color: 'bg-[#FFFC00] text-black', glow: 'shadow-yellow-400/30' },
    { icon: <TelegramIcon />, url: SOCIAL_LINKS.telegram_channel, name: 'Telegram', color: 'bg-[#0088cc]', glow: 'shadow-sky-400/30' },
    { icon: <YoutubeIcon />, url: SOCIAL_LINKS.youtube, name: 'YouTube', color: 'bg-[#FF0000]', glow: 'shadow-red-500/30' },
    { icon: <WhatsappIcon />, url: SOCIAL_LINKS.whatsapp_community, name: 'WhatsApp', color: 'bg-[#25D366]', glow: 'shadow-green-500/30' },
  ];

  return (
    <footer className="bg-primary text-white pt-24 pb-12 relative overflow-hidden m-0 border-t-8 border-secondary/10">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        
        {/* شريط التحقق المؤسسي */}
        <div className="mb-24">
            <div className="bg-white/5 backdrop-blur-2xl rounded-[3rem] p-10 border border-white/10 shadow-sovereign relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary/40 to-transparent"></div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {INSTITUTIONAL_VERIFICATION.map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center group">
                            <div className="w-20 h-20 mb-5 bg-white rounded-2xl p-3.5 shadow-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                                <img src={item.icon} alt={item.title_ar} className="w-full h-auto object-contain" />
                            </div>
                            <h4 className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1.5 opacity-80">{item.title_ar}</h4>
                            <p className="text-xl font-black font-mono tracking-tighter text-white select-all">{item.number}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-8 text-center border-t border-white/5 pt-6">
                    <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.5em]">✓ Institutional Legal Verification • Data Transparency Enabled</p>
                </div>
            </div>
        </div>

        {/* Our Customers Section */}
        <div className="mb-24">
            <h3 className="text-2xl font-black border-r-4 border-secondary pr-4 uppercase tracking-widest mb-10">{language === 'ar' ? 'عملاؤنا الكرام' : 'Our Valued Customers'}</h3>
            <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-8 border border-white/10 overflow-hidden">
                <img 
                    src="https://drive.google.com/uc?export=view&id=1ncgLWgU7451YY8W9B8-fnSWJho9BrpQN" 
                    alt="Our Customers" 
                    className="w-full h-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-700"
                    referrerPolicy="no-referrer"
                />
            </div>
        </div>

        {/* Bank Accounts Section */}
        <div className="mb-24">
            <h3 className="text-2xl font-black border-r-4 border-secondary pr-4 uppercase tracking-widest mb-10">{language === 'ar' ? 'الحسابات البنكية' : 'Bank Accounts'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <a 
                    href="https://drive.google.com/file/d/1Z-sCFoS6joN3BcKhCubwOZLvowmPRTYe/view?usp=drivesdk" 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-4 transition-all group"
                >
                    <span className="text-4xl group-hover:scale-110 transition-transform">🏦</span>
                    <span className="font-black text-sm uppercase tracking-widest">{language === 'ar' ? 'حساب البنك 1' : 'Bank Account 1'}</span>
                </a>
                <a 
                    href="https://drive.google.com/file/d/1h5ocL1ixP6CNyCkZM9MuFuvVqHShzWzC/view?usp=drivesdk" 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-4 transition-all group"
                >
                    <span className="text-4xl group-hover:scale-110 transition-transform">🏦</span>
                    <span className="font-black text-sm uppercase tracking-widest">{language === 'ar' ? 'حساب البنك 2' : 'Bank Account 2'}</span>
                </a>
                <a 
                    href="https://drive.google.com/file/d/1ncgLWgU7451YY8W9B8-fnSWJho9BrpQN/view?usp=drivesdk" 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-4 transition-all group"
                >
                    <span className="text-4xl group-hover:scale-110 transition-transform">🏦</span>
                    <span className="font-black text-sm uppercase tracking-widest">{language === 'ar' ? 'حساب البنك 3' : 'Bank Account 3'}</span>
                </a>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-16 mb-20 border-b border-white/10 pb-20">
          
          {/* معلومات البراند و أيقونات التواصل الاجتماعي الجديدة */}
          <div className="space-y-10">
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setPage('home')}>
                <div className="bg-white p-3 rounded-2xl shadow-2xl transition-transform group-hover:rotate-12 group-hover:scale-110">
                    <LogoIcon className="w-14 h-14" />
                </div>
                <div>
                    <h2 className="text-3xl font-black leading-none">{t('header.storeName')}</h2>
                    <p className="text-secondary text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Elite Supply Excellence</p>
                </div>
            </div>
            
            <p className="text-white/60 font-bold leading-relaxed text-lg italic border-r-2 border-white/10 pr-4">
                "{language === 'ar' ? COMPANY_INFO.slogan : COMPANY_INFO.slogan_en}"
            </p>
            
            {/* إعادة تصميم أيقونات التواصل الاجتماعي كبلاطات تفاعلية */}
            <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 border-b border-white/5 pb-2">Connect via Sovereign Channels</h4>
                <div className="grid grid-cols-4 gap-3">
                    {socialPlatforms.map((social, i) => (
                        <a 
                          key={i} 
                          href={social.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className={`group relative w-full aspect-square rounded-2xl ${social.color} flex items-center justify-center transition-all duration-500 hover:scale-110 hover:-translate-y-2 active:scale-95 shadow-lg ${social.glow} hover:shadow-2xl overflow-hidden border border-white/10`}
                          title={social.name}
                        >
                            {/* Glass Reflection Overlay */}
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-white/30 to-transparent rotate-45 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            
                            <div className="w-7 h-7 text-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[8deg] drop-shadow-md">
                                {social.icon}
                            </div>
                        </a>
                    ))}
                </div>
                {/* Linktree Button */}
                <a 
                    href={SOCIAL_LINKS.linktree} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-full bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl py-4 flex items-center justify-center gap-4 transition-all group font-black text-xs uppercase tracking-widest"
                >
                    🔗 {language === 'ar' ? 'جميع منصاتنا في رابط واحد' : 'All Platforms One Link'}
                </a>
            </div>
          </div>

          {/* بيانات التواصل */}
          <div className="space-y-8">
            <h3 className="text-2xl font-black border-r-4 border-secondary pr-4 uppercase tracking-widest">{language === 'ar' ? 'بيانات التواصل' : 'Contact Data'}</h3>
            <div className="space-y-6">
                <div className="flex items-center gap-5 group">
                    <div className="bg-white/10 p-4 rounded-2xl group-hover:bg-secondary transition-colors shadow-inner"><PhoneIcon className="w-6 h-6" /></div>
                    <div>
                        <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Customer Support</p>
                        <a href={`tel:${COMPANY_INFO.phone}`} className="text-xl font-black hover:text-secondary transition-colors block">{COMPANY_INFO.phone}</a>
                    </div>
                </div>
                <div className="flex items-center gap-5 group">
                    <div className="bg-white/10 p-4 rounded-2xl group-hover:bg-green-500 transition-colors shadow-inner"><div className="w-6 h-6"><WhatsappIcon /></div></div>
                    <div>
                        <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Order WhatsApp</p>
                        <a href={`https://wa.me/${COMPANY_INFO.whatsapp}`} target="_blank" rel="noreferrer" className="text-xl font-black hover:text-green-500 transition-colors block">{COMPANY_INFO.whatsapp}</a>
                    </div>
                </div>
                <div className="flex items-center gap-5 group">
                    <div className="bg-white/10 p-4 rounded-2xl group-hover:bg-secondary transition-colors shadow-inner"><MailIcon className="w-6 h-6" /></div>
                    <div>
                        <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Official Email</p>
                        <a href={`mailto:${COMPANY_INFO.email}`} className="text-sm font-black hover:text-secondary transition-colors block uppercase">{COMPANY_INFO.email}</a>
                    </div>
                </div>
                <div className="flex items-center gap-5 group">
                    <div className="bg-white/10 p-4 rounded-2xl group-hover:bg-secondary transition-colors shadow-inner">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                        </svg>
                    </div>
                    <div>
                        <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Official Website</p>
                        <a href="https://deltastars.com" target="_blank" rel="noreferrer" className="text-xl font-black hover:text-secondary transition-colors block uppercase">deltastars.com</a>
                    </div>
                </div>
            </div>
          </div>

          {/* وصول سريع */}
          <div className="space-y-8">
            <h3 className="text-2xl font-black border-r-4 border-secondary pr-4 uppercase tracking-widest">{language === 'ar' ? 'وصول سريع' : 'Quick Access'}</h3>
            <ul className="grid grid-cols-2 gap-4">
              {['home', 'products', 'units', 'showroom', 'contact', 'privacy', 'terms', 'returns', 'shipping', 'login', 'driverDashboard'].map((page) => (
                <li key={page}>
                  <button 
                    onClick={() => setPage(page as Page)} 
                    className="group text-white/50 hover:text-secondary font-black transition-all hover:translate-x-2 flex items-center gap-3 text-lg"
                  >
                    <span className="w-2 h-2 bg-white/20 group-hover:bg-secondary rounded-full transition-colors"></span>
                    {page === 'driverDashboard' ? t('header.navLinks.driverDashboard') : 
                     page === 'units' ? (language === 'ar' ? 'وحدات القياس' : 'Units') :
                     page === 'contact' ? (language === 'ar' ? 'تواصل معنا' : 'Contact Us') :
                     page === 'shipping' ? (language === 'ar' ? 'سياسة الشحن' : 'Shipping Policy') :
                     t(`header.navLinks.${page === 'login' ? 'dashboard' : page}`)}
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-start gap-4 group pt-4 border-t border-white/5">
                <div className="bg-white/10 p-4 rounded-2xl group-hover:bg-secondary transition-colors shadow-inner"><LocationMarkerIcon className="w-6 h-6" /></div>
                <div>
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Location</p>
                    <p className="text-sm font-black leading-tight text-white/80">{COMPANY_INFO.address}</p>
                </div>
            </div>
          </div>
        </div>

        {/* خريطة المقر الرئيسي */}
        <div className="space-y-8">
            <h3 className="text-2xl font-black border-r-4 border-secondary pr-4 uppercase tracking-widest">{language === 'ar' ? 'المقر الرئيسي' : 'Headquarters'}</h3>
            <div className="rounded-[4rem] overflow-hidden border-8 border-white/5 shadow-3xl h-[400px] relative group bg-white/5">
                <iframe 
                  src={mapEmbedUrl}
                  className="w-full h-full grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                ></iframe>
                <a 
                  href={COMPANY_INFO.map_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="absolute bottom-8 right-8 bg-white text-primary font-black px-12 py-5 rounded-2xl text-center text-lg shadow-2xl hover:bg-secondary hover:text-white transition-all transform hover:scale-105 flex items-center justify-center gap-3"
                >
                    📍 {language === 'ar' ? 'فتح في خرائط جوجل' : 'Open in Google Maps'}
                </a>
            </div>
        </div>

        {/* تذييل الصفحة السفلي */}
        <div className="pt-12 mt-20 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-white/40 font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-3">
            © {new Date().getFullYear()} <a href="https://deltastars.com" target="_blank" rel="noreferrer" className="hover:text-secondary transition-colors">deltastars.com</a> • Delta Stars Trading Store
            <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></span>
            {language === 'ar' ? 'جميع الحقوق محفوظة' : 'All Rights Reserved'}
          </div>
          <div className="flex items-center gap-6 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all text-white/50">
              <p className="text-[9px] font-black uppercase tracking-widest">Elite Trading Hub v25.0 (Sovereign Stable & Optimized)</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
