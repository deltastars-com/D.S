import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { COMPANY_INFO, SOCIAL_LINKS, SYSTEM_CONFIG } from './constants';
import { 
  MapPinIcon, PhoneIcon, GlobeIcon,
  WhatsappIcon, InstagramIcon, TiktokIcon, TwitterXIcon,
  FacebookIcon, YoutubeIcon, SnapchatIcon, TelegramIcon
} from './lib/contexts/Icons';
import { useI18n } from './lib/contexts/I18nContext';

interface FooterProps {
  onNavigate: (page: string) => void;
}

const SocialIcon = ({ name, className }: { name: string, className?: string }) => {
  const iconKey = name.toLowerCase();
  switch (iconKey) {
    case 'whatsapp_community': return <WhatsappIcon className={className} />;
    case 'instagram': return <InstagramIcon className={className} />;
    case 'tiktok': return <TiktokIcon className={className} />;
    case 'twitter_x': return <TwitterXIcon className={className} />;
    case 'facebook': return <FacebookIcon className={className} />;
    case 'facebook_group': return <FacebookIcon className={className} />;
    case 'youtube': return <YoutubeIcon className={className} />;
    case 'snapchat': return <SnapchatIcon className={className} />;
    case 'telegram': 
    case 'telegram_channel': return <TelegramIcon className={className} />;
    case 'linktree': return <GlobeIcon className={className} />;
    default: return <GlobeIcon className={className} />;
  }
};

const getSocialColor = (name: string) => {
  const iconKey = name.toLowerCase();
  switch (iconKey) {
    case 'whatsapp_community': return 'hover:bg-[#25D366]';
    case 'instagram': return 'hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7]';
    case 'tiktok': return 'hover:bg-black';
    case 'facebook':
    case 'facebook_group': return 'hover:bg-[#1877F2]';
    case 'youtube': return 'hover:bg-[#FF0000]';
    case 'snapchat': return 'hover:bg-[#FFFC00] hover:text-black';
    case 'telegram':
    case 'telegram_channel': return 'hover:bg-[#0088cc]';
    case 'twitter_x': return 'hover:bg-black';
    default: return 'hover:bg-secondary';
  }
};

export function Footer({ onNavigate }: FooterProps) {
  const { t, language } = useI18n();

  // معلومات البنك
  const bankInfo = {
    name: language === 'ar' ? 'البنك العربي الوطني (ANB)' : 'Arab National Bank (ANB)',
    accountName: language === 'ar' ? 'شركة نجوم دلتا للتجارة' : 'Delta Stars Trading Co.',
    accountNumber: '0108095516770029',
    iban: 'SA4730400108095516770029',
    branch: language === 'ar' ? 'فرع الرحاب - جدة' : 'Al Rehab Branch - Jeddah'
  };

  const trustBadges = [
    { 
      name: language === 'ar' ? 'رؤية السعودية 2030' : 'Saudi Vision 2030', 
      icon: (
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sovereign-sm" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#FFFFFF" />
            <path d="M50 20 L55 35 L70 35 L58 45 L63 60 L50 50 L37 60 L42 45 L30 35 L45 35 Z" fill="#006C35" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="#ca8a04" strokeWidth="1" strokeDasharray="4 4" />
            <text x="50" y="80" textAnchor="middle" fill="#006C35" className="text-[8px] font-black" style={{ fontFamily: 'Cairo' }}>VISION رؤية</text>
            <text x="50" y="92" textAnchor="middle" fill="#006C35" className="text-[10px] font-black" style={{ fontFamily: 'Cairo' }}>2030</text>
          </svg>
        </div>
      ), 
      link: 'https://www.vision2030.gov.sa/' 
    },
    { 
      name: language === 'ar' ? 'السجل التجاري: 4030457293' : 'CR: 4030457293', 
      icon: (
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lux" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="5" width="90" height="90" rx="20" fill="#ca8a04" />
            <rect x="12" y="12" width="76" height="76" rx="15" fill="white" />
            <path d="M30 50 L45 65 L75 35" stroke="#ca8a04" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <text x="50" y="88" textAnchor="middle" fill="#ca8a04" className="text-[6px] font-black">MINISTRY OF COMMERCE</text>
          </svg>
        </div>
      ), 
      link: 'https://drive.google.com/drive/folders/15Yktslb0cLfj7elI-tK_TfVoHBWNUKov' 
    },
    { 
      name: language === 'ar' ? 'الرقم الضريبي: 310164759500003' : 'VAT: 310164759500003', 
      icon: (
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lux" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#1A3A1A" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="#ca8a04" strokeWidth="2" />
            <text x="50" y="45" textAnchor="middle" fill="#ca8a04" className="text-[14px] font-black">VAT</text>
            <text x="50" y="65" textAnchor="middle" fill="white" className="text-[8px] font-black">REGISTERED</text>
            <path d="M35 75 L65 75" stroke="#ca8a04" strokeWidth="2" />
          </svg>
        </div>
      ), 
      link: 'https://drive.google.com/drive/folders/15Yktslb0cLfj7elI-tK_TfVoHBWNUKov' 
    },
    { 
      name: language === 'ar' ? 'شهادة الأيزو ISO 9001' : 'ISO 9001 Certified', 
      icon: (
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lux" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#1a1a1a" />
            <path d="M50 10 A40 40 0 0 1 50 90 A40 40 0 0 1 50 10" fill="none" stroke="#ca8a04" strokeWidth="4" strokeDasharray="2 2" />
            <text x="50" y="45" textAnchor="middle" fill="white" className="text-[12px] font-black">ISO</text>
            <text x="50" y="65" textAnchor="middle" fill="#ca8a04" className="text-[10px] font-black">9001:2015</text>
          </svg>
        </div>
      ), 
      link: 'https://drive.google.com/drive/folders/15Yktslb0cLfj7elI-tK_TfVoHBWNUKov' 
    }
  ];

  const paymentLogos = [
    { 
      name: "Mada", 
      svg: (
        <svg viewBox="0 0 100 32" className="h-6 md:h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="32" rx="4" fill="#003580"/>
          <path d="M15 8l10 8-10 8V8zm20 0l10 8-10 8V8z" fill="#00D2FF"/>
          <text x="65%" y="22" textAnchor="middle" className="text-[12px] font-black" fill="white" style={{ fontFamily: 'sans-serif' }}>mada</text>
        </svg>
      )
    },
    { 
      name: "Visa", 
      svg: (
        <svg viewBox="0 0 48 32" className="h-6 md:h-8" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="32" rx="4" fill="#1A1F71"/>
          <path d="M15 10l2 12h3l2-12h-3l-1 8-1-8h-3zm14 0l-1 12h3l3-12h-2.5l-1.5 8-1.5-8h-0.5z" fill="white"/>
          <text x="35" y="24" className="text-[10px] font-black italic" fill="#F7B600">VISA</text>
        </svg>
      )
    },
    { 
      name: "Mastercard", 
      svg: (
        <svg viewBox="0 0 48 32" className="h-8 md:h-10" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="32" rx="4" fill="#1a1a1a"/>
          <circle cx="18" cy="16" r="10" fill="#EB001B" fillOpacity="0.9"/>
          <circle cx="30" cy="16" r="10" fill="#F79E1B" fillOpacity="0.9"/>
          <path d="M22 9v14c2 0 4-2 4-7s-2-7-4-7z" fill="#FF5F00"/>
        </svg>
      )
    },
    { 
      name: "Apple Pay", 
      svg: (
        <svg viewBox="0 0 48 32" className="h-8 md:h-10" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="32" rx="6" fill="black"/>
          <path d="M18 11c0-1.5 1-2.5 2.5-2.5.2 0 .5 0 .7.1-1.3 2.1-3 2.1-3.2 2.4zm5.5 2.5c-1 0-2 .5-2.5.5s-1.5-.5-2.5-.5c-2.5 0-4.5 2-4.5 5 0 3 2 6.5 4.5 6.5.8 0 1.5-.3 2.2-.3s1.4.3 2.3.3c2.5 0 4.5-3.5 4.5-6.5C28 15.5 26 13.5 23.5 13.5z" fill="white"/>
          <text x="34" y="22" className="text-[9px] font-black" fill="white">Pay</text>
        </svg>
      )
    },
    { 
      name: "STC Pay", 
      svg: (
        <svg viewBox="0 0 60 32" className="h-8 md:h-10" xmlns="http://www.w3.org/2000/svg">
          <rect width="60" height="32" rx="6" fill="#4F2D7F"/>
          <circle cx="15" cy="16" r="6" fill="white" fillOpacity="0.2"/>
          <text x="36" y="21" textAnchor="middle" className="text-[10px] font-black" fill="white">stc pay</text>
        </svg>
      )
    },
    {
      name: "Tamara",
      svg: (
        <svg viewBox="0 0 100 32" className="h-8 md:h-10" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="32" rx="6" fill="#FFCBB3"/>
          <text x="50%" y="22" textAnchor="middle" className="text-[12px] font-black" fill="#1A1A1A">Tamara</text>
        </svg>
      )
    },
    {
      name: "Tabby",
      svg: (
        <svg viewBox="0 0 100 32" className="h-8 md:h-10" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="32" rx="6" fill="#CCFF00"/>
          <text x="50%" y="22" textAnchor="middle" className="text-[12px] font-black" fill="#1A1A1A">tabby</text>
        </svg>
      )
    },
    {
      name: "Moyasar",
      svg: (
        <svg viewBox="0 0 100 32" className="h-8 md:h-10" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="32" rx="6" fill="#1A3A1A"/>
          <text x="50%" y="21" textAnchor="middle" className="text-[10px] font-black" fill="#ca8a04">MOYASAR</text>
        </svg>
      )
    }
  ];

  return (
    <footer className="bg-primary text-white py-16 border-t-[10px] border-secondary">
      <div className={`container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 ${language === 'en' ? 'text-left' : 'text-right rtl'}`}>
        <div className="lg:col-span-1">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className={`flex items-center gap-4 mb-8 cursor-pointer group bg-white/5 border border-white/20 rounded-full p-1 pr-6 transition-all duration-500 hover:bg-white/10 shadow-2xl relative overflow-hidden`}
            onClick={() => onNavigate('home')}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 via-transparent to-transparent opacity-50"></div>
            <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 shrink-0 relative z-10">
              <img 
                src={COMPANY_INFO.logo_url} 
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-white" 
                alt="Delta Stars"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="relative z-10 border-r-2 border-white/10 pr-4">
              <h3 className="text-2xl md:text-3xl font-black text-white leading-none tracking-tighter uppercase">DELTA <span className="text-secondary">STARS</span></h3>
              <p className="text-[9px] md:text-[11px] font-black text-secondary tracking-[0.5em] mt-1.5 opacity-80 uppercase uppercase">Premium Trading Co.</p>
            </div>
          </motion.div>
          <p className="text-gray-400 font-bold leading-relaxed text-xs max-w-sm">
            {language === 'ar' 
              ? 'شريكك المثالي للخضروات والفواكه والتمور عالية الجودة في المملكة العربية السعودية. جودة سيادية نعتز بها.' 
              : 'Your premier partner for high-quality vegetables, fruits, and dates in KSA. Sovereign quality we take pride in.'}
          </p>
          
          <div className="mt-8">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">
              {language === 'ar' ? 'منصاتنا الاجتماعية (Linktree)' : 'Social Platforms (Linktree)'}
            </h4>
            <div className="grid grid-cols-5 gap-3 max-w-[320px]">
              {[
                { id: 'whatsapp', icon: <WhatsappIcon className="w-6 h-6" />, link: SOCIAL_LINKS.WHATSAPP_COMMUNITY, color: '#25D366' },
                { id: 'instagram', icon: <InstagramIcon className="w-6 h-6" />, link: SOCIAL_LINKS.INSTAGRAM, color: '#E4405F' },
                { id: 'tiktok', icon: <TiktokIcon className="w-6 h-6" />, link: SOCIAL_LINKS.TIKTOK, color: '#000000' },
                { id: 'telegram', icon: <TelegramIcon className="w-6 h-6" />, link: SOCIAL_LINKS.TELEGRAM, color: '#0088cc' },
                { id: 'snapchat', icon: <SnapchatIcon className="w-6 h-6" />, link: SOCIAL_LINKS.SNAPCHAT, color: '#FFFC00' },
                { id: 'linktree', icon: <GlobeIcon className="w-6 h-6" />, link: "https://linktr.ee/deltastar6", color: '#43E1AD' }
              ].map((social) => (
                <a 
                  key={social.id}
                  href={social.link} 
                  target="_blank" 
                  rel="noreferrer" 
                  className={`aspect-square flex items-center justify-center bg-white/5 border-2 border-white/10 rounded-2xl transition-all duration-500 hover:scale-110 hover:border-white/30 group relative overflow-hidden shadow-lg ${social.id === 'linktree' ? 'col-span-1 md:col-span-1' : ''}`}
                >
                  <div className="relative z-10 text-white/50 group-hover:text-white transition-colors duration-500">
                    {social.icon}
                  </div>
                  {/* Subtle Glow Effect */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-xl -z-0"
                    style={{ backgroundColor: social.color }}
                  ></div>
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">
              {language === 'ar' ? 'طرق الدفع السيادية' : 'Sovereign Payments'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {paymentLogos.map((logo, idx) => (
                <div 
                  key={idx} 
                  className="bg-white rounded-lg p-1.5 shadow-sm border border-gray-100/50 hover:scale-110 hover:-rotate-3 transition-all flex items-center justify-center min-w-[45px] h-9"
                  title={logo.name}
                >
                  {logo.svg}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Policies Section */}
        <div className={`space-y-6 ${language === 'en' ? 'text-left' : 'text-right'}`}>
          <h4 className={`text-lg font-black text-secondary uppercase tracking-widest border-secondary ${language === 'en' ? 'border-l-4 pl-4' : 'border-r-4 pr-4'}`}>
            {language === 'ar' ? 'سياسات المتجر' : 'Store Policies'}
          </h4>
          <ul className="space-y-3 font-bold text-sm">
            <li>
              <button onClick={() => onNavigate('terms')} className="text-gray-300 hover:text-secondary transition-colors underline-offset-4 hover:underline decoration-emerald-500/30">
                {language === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('privacy')} className="text-gray-300 hover:text-secondary transition-colors underline-offset-4 hover:underline decoration-emerald-500/30">
                {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('returns')} className="text-gray-300 hover:text-secondary transition-colors underline-offset-4 hover:underline decoration-emerald-500/30">
                {language === 'ar' ? 'سياسة الاستبدال والاسترجاع' : 'Refund & Exchange Policy'}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shipping')} className="text-gray-300 hover:text-secondary transition-colors underline-offset-4 hover:underline decoration-emerald-500/30">
                {language === 'ar' ? 'سياسة الشحن والتوصيل' : 'Shipping & Delivery Policy'}
              </button>
            </li>
            <li className="pt-2">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                <p className="text-[10px] text-emerald-400 leading-relaxed font-black uppercase tracking-tight">
                  {language === 'ar' 
                    ? 'نلتزم تماماً بأنظمة التجارة الإلكترونية في المملكة العربية السعودية وحماية حقوق المستهلك.'
                    : 'We fully comply with KSA E-commerce regulations and consumer rights protection.'}
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Bank & Trust Section */}
        <div className={`space-y-10 ${language === 'en' ? 'text-left' : 'text-right'}`}>
          <h4 className={`text-lg font-black text-secondary uppercase tracking-widest border-secondary ${language === 'en' ? 'border-l-4 pl-4' : 'border-r-4 pr-4'}`}>
            {language === 'ar' ? 'الثقة والبنك' : 'Trust & Bank'}
          </h4>
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4 shadow-2xl backdrop-blur-2xl mb-8 group hover:bg-white/10 transition-colors">
            <p className="text-white font-black text-xs break-all opacity-90 leading-relaxed">{bankInfo.accountName}</p>
            <div className="h-px bg-white/10 w-full"></div>
            <p className="font-mono text-sm text-secondary break-all tracking-tighter">{bankInfo.iban}</p>
          </div>
          <ul className="grid grid-cols-2 gap-10">
            {trustBadges.map((badge, idx) => (
              <li key={idx}>
                <a 
                  href={badge.link} 
                  target="_blank" 
                  rel="noreferrer" 
                  title={badge.name}
                  className="flex flex-col items-center gap-6 text-gray-300 hover:text-secondary transition-all group text-center"
                >
                  <div className="group-hover:scale-125 transition-transform h-24 md:h-32 flex items-center justify-center drop-shadow-lux mb-4">
                    {badge.icon}
                  </div>
                  <span className="text-[10px] md:text-xs font-black tracking-[0.2em] uppercase leading-relaxed opacity-80 group-hover:opacity-100 group-hover:text-secondary whitespace-normal max-w-[140px] border-t border-white/10 pt-6 w-full block">
                    {badge.name}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div className={`space-y-6 ${language === 'en' ? 'text-left' : 'text-right'}`}>
          <h4 className={`text-lg font-black text-secondary uppercase tracking-widest border-secondary ${language === 'en' ? 'border-l-4 pl-4' : 'border-r-4 pr-4'}`}>{t('footer.contact')}</h4>
          <div className="space-y-4 text-sm font-bold text-gray-300">
            <div className={`flex items-start gap-3 ${language === 'en' ? 'flex-row' : 'flex-row-reverse'}`}>
              <MapPinIcon className="w-5 h-5 text-secondary mt-1 shrink-0" />
              <p className={language === 'en' ? 'text-left' : 'text-right'}>{t('footer.address')}</p>
            </div>
            <div className={`flex items-center gap-3 ${language === 'en' ? 'flex-row' : 'flex-row-reverse'}`}>
              <PhoneIcon className="w-5 h-5 text-secondary shrink-0" />
              <p dir="ltr" className={language === 'en' ? 'text-left' : 'text-right'}>{COMPANY_INFO.phone}</p>
            </div>
            <div className={`flex items-center gap-3 ${language === 'en' ? 'flex-row' : 'flex-row-reverse'}`}>
              <GlobeIcon className="w-5 h-5 text-secondary shrink-0" />
              <p className={language === 'en' ? 'text-left' : 'text-right'}>{COMPANY_INFO.email}</p>
            </div>
          </div>
          <div className="pt-4 space-y-2">
            <div className="text-[10px] text-gray-500 text-center border-t border-white/5 pt-4">
              {language === 'ar' ? 'السجل التجاري: 4030457293' : 'CR: 4030457293'}
            </div>
            <div className="text-[10px] text-gray-500 text-center">
              {language === 'ar' ? 'الرقم الضريبي: 310164759500003' : 'VAT: 310164759500003'}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={`container mx-auto px-6 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 font-bold text-xs ${language === 'en' ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
        <p>&copy; {new Date().getFullYear()} DELTA STARS. {t('footer.rights')}</p>
        <div className={`flex flex-col md:flex-row items-center gap-6 ${language === 'en' ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
          <span className={language === 'en' ? 'text-left' : 'text-right'}>{t('footer.ownership')}</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-500">{t('footer.systemStatus')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
