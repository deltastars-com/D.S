import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../hooks/useCart';
import {
  SearchIcon, UserIcon, HeartIcon, ShoppingCartIcon,
  BellIcon, MenuIcon, XIcon, PhoneIcon,
  CalendarIcon, ClockIcon, ShieldCheckIcon, GlobeIcon,
  WhatsappIcon, InstagramIcon, TelegramIcon, TiktokIcon, SnapchatIcon, ZapIcon, AdiSparklesIcon
} from './lib/contexts/Icons';
import { useI18n } from './lib/contexts/I18nContext';
import { motion, AnimatePresence } from 'motion/react';
import { COMPANY_INFO, SOCIAL_LINKS } from './constants';

import { getHijriDate, getGregorianDate, getDayName } from '../utils/dateUtils';

// مكون شريط الإعلانات المتحرك
const AnnouncementTicker: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-2 overflow-hidden relative z-[110]">
      <div className="animate-marquee whitespace-nowrap inline-block">
        {[
          "شريكك المثالي للخضروات والفواكه والتمور عالية الجودة. ✨ خصم خاص على سلات العروض الترويجية!",
          "🚚 توصيل مبرد وسريع لجميع المدن المتواجدة فيها فروعنا في المملكة",
          "🍎 منتجات طازجة تصلكم من المزارع مباشرة",
          "⭐ جودة عالمية موثقة بشهادات الأيزو"
        ].map((text, index) => (
          <span key={index} className="mx-8 inline-block font-bold">
            {text}
          </span>
        ))}
        {/* Duplicate for seamless loop */}
        {[
          "شريكك المثالي للخضروات والفواكه والتمور عالية الجودة. ✨ خصم خاص على سلات العروض الترويجية!",
          "🚚 توصيل مبرد وسريع لجميع المدن المتواجدة فيها فروعنا في المملكة",
          "🍎 منتجات طازجة تصلكم من المزارع مباشرة",
          "⭐ جودة عالمية موثقة بشهادات الأيزو"
        ].map((text, index) => (
          <span key={index + 'copy'} className="mx-8 inline-block font-bold">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  onToggleAiAssistant: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage, onToggleAiAssistant }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const { language, setLanguage, t } = useI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const hijriStr = getHijriDate();
  const gregorianStr = getGregorianDate();
  const dayNameStr = getDayName();

  const isAdmin = isAuthenticated && (
    ['admin', 'developer', 'marketing', 'branch_agent', 'ops'].includes(user?.role || '') ||
    ['admin', 'developer'].includes(user?.type || '')
  );

  const navItems = [
    { id: 'home', label: t('header.navLinks.home'), icon: <GlobeIcon className="w-5 h-5" /> },
    { id: 'showroom', label: t('header.navLinks.showroom'), icon: <ShoppingCartIcon className="w-5 h-5" /> },
    { id: 'products', label: t('header.navLinks.products'), icon: <HeartIcon className="w-5 h-5" /> },
    { id: 'contact', label: t('header.navLinks.contact'), icon: <PhoneIcon className="w-5 h-5" /> }
  ];

  if (isAdmin) {
    navItems.push({
      id: 'admin_dashboard',
      label: language === 'ar' ? 'الإدارة السيادية' : 'Sovereign Admin',
      icon: <ShieldCheckIcon className="w-5 h-5 text-secondary" />
    });
  }

  if (isAuthenticated && (user?.role === 'developer' || user?.type === 'developer')) {
    navItems.push({
      id: 'dev_console',
      label: language === 'ar' ? 'كونسول المطور' : 'Dev Console',
      icon: <ZapIcon className="w-5 h-5 text-yellow-400" />
    });
  }

  return (
    <header className={`fixed top-0 w-full z-[100] transition-all duration-700 ${isScrolled ? 'shadow-sovereign translate-y-[-2px]' : ''}`}>
      <AnnouncementTicker />
      {/* Top Bar - Sovereign Visual Polish */}
      <div className="bg-primary text-white py-2 px-4 md:px-8 text-[10px] md:text-sm flex justify-between items-center border-b border-secondary/20 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 via-transparent to-secondary/5 pointer-events-none" />

        <div className="flex items-center gap-2 md:gap-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-white/5 px-5 py-2 rounded-full border border-white/10 shadow-inner backdrop-blur-md group transition-all hover:bg-white/10"
          >
            <CalendarIcon className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div className="flex items-center gap-3 text-[10px] md:text-sm font-black leading-tight">
              <div className="flex items-center gap-2 text-white/90">
                <span className="tracking-tight font-black">{hijriStr}</span>
                <span className="text-secondary/50 font-light mx-1">|</span>
                <span className="tracking-tight font-black">{gregorianStr} م</span>
              </div>
            </div>
          </motion.div>

          <div className="hidden sm:flex items-center gap-4 ml-6 border-l border-white/10 pl-6 h-8">
            <a href={SOCIAL_LINKS.WHATSAPP_COMMUNITY} target="_blank" rel="noreferrer" className="text-white/40 hover:text-emerald-400 transition-all hover:scale-110" title="WhatsApp"><WhatsappIcon className="w-5 h-5 shadow-glow-sm" /></a>
            <a href={SOCIAL_LINKS.INSTAGRAM} target="_blank" rel="noreferrer" className="text-white/40 hover:text-pink-400 transition-all hover:scale-110" title="Instagram"><InstagramIcon className="w-5 h-5 shadow-glow-sm" /></a>
            <a href={SOCIAL_LINKS.TELEGRAM} target="_blank" rel="noreferrer" className="text-white/40 hover:text-blue-400 transition-all hover:scale-110" title="Telegram"><TelegramIcon className="w-5 h-5 shadow-glow-sm" /></a>
            <a href={SOCIAL_LINKS.TIKTOK} target="_blank" rel="noreferrer" className="text-white/40 hover:text-white transition-all hover:scale-110" title="TikTok"><TiktokIcon className="w-5 h-5 shadow-glow-sm" /></a>
          </div>

          <button
            onClick={() => onNavigate(isAdmin ? 'admin_dashboard' : 'admin_login')}
            className="hidden lg:flex items-center gap-2 text-secondary/80 hover:text-white transition-all group px-3 py-1 rounded-full hover:bg-white/5"
          >
            <ShieldCheckIcon className={`w-3.5 h-3.5 group-hover:scale-110 transition-transform ${isAdmin ? 'text-emerald-400' : ''}`} />
            <span className="font-black uppercase tracking-widest text-[9px]">{isAdmin ? (language === 'ar' ? 'الكونسول الإداري' : 'ADMIN CONSOLE') : t('header.adminGate')}</span>
          </button>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-2 px-6 py-2 rounded-full bg-secondary text-primary hover:bg-white hover:text-primary transition-all shadow-gold font-black group border-b-2 border-primary/20 active:border-b-0 scale-105"
          >
            <GlobeIcon className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
            <span className="text-[11px] tracking-[0.2em] uppercase">{language === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          <button
            onClick={onToggleAiAssistant}
            className="hidden xl:flex items-center gap-3 text-white/70 hover:text-secondary transition-all cursor-pointer group"
          >
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping group-hover:bg-secondary"></div>
            <span className="font-black tracking-widest text-[10px] uppercase">{t('header.aiSupportActive')}</span>
            <AdiSparklesIcon className="w-4 h-4 text-secondary scale-0 group-hover:scale-110 transition-transform" />
          </button>

          <div className="flex items-center gap-3 font-mono bg-black/40 px-4 py-1.5 rounded-full border border-white/10 shadow-glow-sm">
            <ClockIcon className="w-3.5 h-3.5 text-secondary" />
            <span className="tabular-nums font-black text-secondary tracking-widest">{dateTime.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Main Header - High Luxury Aesthetic */}
      <div className={`bg-primary/95 backdrop-blur-3xl border-b-[4px] border-secondary px-6 md:px-16 flex items-center justify-between transition-all duration-700 relative shadow-2xl ${isScrolled ? 'h-24 md:h-28 bg-primary/98' : 'h-32 md:h-44'}`}>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />

        {/* Left Section: Menu & Logo */}
        <div className="flex items-center gap-4 md:gap-12">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-3 text-white hover:bg-white/10 rounded-2xl transition-all"
            aria-label="Toggle Menu"
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                  <XIcon className="w-10 h-10" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                  <MenuIcon className="w-10 h-10" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center cursor-pointer group relative transition-all duration-700 ${isScrolled ? 'gap-2 md:gap-4' : 'gap-4 md:gap-6'}`}
            onClick={() => onNavigate('home')}
          >
            <div className={`transition-all duration-700 flex items-center justify-center ${isScrolled ? 'w-12 h-12 md:w-16 md:h-16' : 'w-20 h-20 md:w-32 md:h-32'}`}>
              <img
                src={COMPANY_INFO.logo_url}
                className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-lux"
                alt="Delta Stars Logo"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col justify-center gap-0 relative z-10 border-r-2 border-white/5 pr-4 md:pr-6">
              <div className="flex items-center gap-2 md:gap-4">
                <h1 className="text-xl md:text-3xl lg:text-4xl xl:text-6xl font-black text-white leading-none tracking-tighter group-hover:text-secondary transition-all duration-700 whitespace-nowrap">
                  <span className="font-display">DELTA</span>
                  <span className="text-secondary font-display ml-2 md:ml-4">STARS</span>
                </h1>
              </div>
              <p className="text-[8px] md:text-xs font-black text-white/40 tracking-[0.4em] md:tracking-[0.6em] uppercase group-hover:text-secondary transition-colors mt-1.5 antialiased">
                Sovereign Global Trading
              </p>
            </div>
          </motion.div>
        </div>

        {/* Center Section: Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-2 xl:gap-6 bg-black/40 p-2 rounded-[2rem] border border-white/10 backdrop-blur-3xl shadow-inner">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-8 py-3 rounded-2xl text-md font-black transition-all relative group overflow-hidden ${currentPage === item.id
                ? 'text-primary bg-secondary shadow-gold scale-105'
                : 'text-white/70 hover:text-secondary hover:bg-white/5'
                }`}
            >
              <span className="relative z-10 transition-transform group-hover:-translate-y-1 block uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-1 md:gap-3">
          {/* Collapsible Search */}
          <div className="relative flex items-center">
            <AnimatePresence>
              {isSearchOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 240, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="absolute left-10 hidden md:block"
                >
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={t('common.search')}
                    className="w-full h-10 bg-white/10 border-2 border-secondary/30 rounded-full px-4 text-xs font-bold text-white outline-none focus:border-secondary transition-all backdrop-blur-md"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2 rounded-full transition-all ${isSearchOpen ? 'bg-secondary text-white' : 'text-white hover:bg-white/10'}`}
            >
              <SearchIcon className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          <button onClick={() => onNavigate('wishlist')} className="p-2 text-white hover:text-secondary hover:bg-white/10 rounded-full transition-all relative group">
            <HeartIcon className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
          </button>

          <button onClick={() => onNavigate('cart')} className="p-3 bg-secondary text-white rounded-full transition-all relative group shadow-sovereign border-b-4 border-secondary-dark active:border-b-0 active:translate-y-1">
            <ShoppingCartIcon className="w-6 h-6 md:w-7 md:h-7 group-hover:scale-110 transition-transform" />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  key={itemCount}
                  className="absolute -top-2 -right-2 bg-white text-primary text-[10px] md:text-[12px] font-black w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center border-2 border-primary shadow-2xl"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <div className="h-8 w-px bg-white/10 mx-1 hidden sm:block"></div>

          {isAuthenticated ? (
            <div className="flex items-center gap-1 md:gap-2">
              <button
                onClick={() => onNavigate(user?.role === 'driver' ? 'driver_dashboard' : 'vip_dashboard')}
                className="flex items-center gap-2 bg-white/5 p-1.5 md:p-2 md:px-4 rounded-full border border-white/10 hover:bg-white/10 transition-all group"
              >
                <div className="w-7 h-7 md:w-8 md:h-8 bg-primary rounded-full flex items-center justify-center shadow-sm border border-white/10 group-hover:border-secondary transition-colors">
                  <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <span className="hidden md:block text-xs font-black text-white">{user?.full_name?.split(' ')[0] || t('header.myAccount')}</span>
              </button>
              <button
                onClick={logout}
                className="p-2 text-red-400 hover:bg-red-400/10 rounded-full transition-all"
                title={t('common.logout')}
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('login')}
              className="bg-secondary text-primary px-4 md:px-7 py-2 md:py-3 rounded-full font-black text-xs md:text-sm hover:brightness-110 transition-all shadow-lg border-b-4 border-secondary-dark relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="hidden sm:inline">دخول</span>
                <ShieldCheckIcon className="w-4 h-4" />
              </span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Mobile Menu - Enhanced with staggered animations */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden bg-white/95 backdrop-blur-2xl border-t-4 border-secondary p-6 space-y-2 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

            {[
              ...navItems,
              { id: 'vip_login', label: t('home.hero.vipButton'), icon: <UserIcon className="w-5 h-5" /> },
              { id: 'admin_login', label: t('header.adminGate'), icon: <ShieldCheckIcon className="w-5 h-5" /> }
            ].map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => { onNavigate(item.id); setIsMenuOpen(false); }}
                className={`flex items-center justify-between w-full text-right font-black text-lg py-4 px-4 rounded-2xl transition-all ${currentPage === item.id
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-primary hover:bg-primary/5 border-b border-gray-50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <div className={`w-2 h-2 rounded-full bg-secondary transition-opacity ${currentPage === item.id ? 'opacity-100' : 'opacity-0'}`}></div>
              </motion.button>
            ))}

            {/* Mobile Language Toggle */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="flex items-center justify-center gap-3 w-full py-4 mt-4 bg-gray-50 rounded-2xl border border-gray-100 text-primary font-black"
            >
              <GlobeIcon className="w-5 h-5 text-secondary" />
              <span>{language === 'ar' ? 'Switch to English' : 'التحويل للعربية'}</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
