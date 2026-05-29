
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, Page, DeliveryMethod, Coupon } from '@/types';
import { COMPANY_INFO, BRANCH_LOCATIONS } from '../../constants';
import { TrashIcon, SparklesIcon, PhoneIcon, LocationMarkerIcon, UserIcon, GlobeAltIcon } from './Icons';
import { useI18n } from './I18nContext';
import { PaymentPortal } from '../PaymentPortal';
import { useToast } from '../../../contexts/ToastContext';
import { useFirebase } from './FirebaseContext';
import api from '@/services/api';
import { FleetRadar } from '../FleetRadar';

interface CartPageProps {
  cart: CartItem[];
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, newQuantity: number) => void;
  clearCart: () => void;
  setPage: (page: Page) => void;
  addPurchaseHistory: (items: CartItem[]) => void;
}

export function CartPage({ cart, removeFromCart, updateQuantity, clearCart, setPage, addPurchaseHistory }: CartPageProps) {
  const { t, language, formatCurrency } = useI18n();
  const { addToast } = useToast();

  const REMEMBERED_PHONE_KEY = 'delta-remembered-phone-v27';

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'phone' | 'otp' | 'address' | 'delivery' | 'payment' | 'success'>('cart');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('standard');
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);

  const [orderId, setOrderId] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'visa' | 'paypal' | 'mada' | 'cod' | 'bank_transfer' | 'tabby' | 'tamara' | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const { coupons, firebaseUser, user, createOrderWithInvoice } = useFirebase();
  const [phone, setPhone] = useState(() => {
    try {
      return localStorage.getItem(REMEMBERED_PHONE_KEY) || '';
    } catch (e) {
      return '';
    }
  });
  const [otpInput, setOtpInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [waitTimer, setWaitTimer] = useState(0);

  const [address, setAddress] = useState({
    city: '', district: '', street: '', type: 'house', building: '', unit: ''
  });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const SHIPPING_FEE = 25;
  const FREE_SHIPPING_THRESHOLD = 200;
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  const discountAmount = appliedCoupon ? (appliedCoupon.discountType === 'percentage' ? (subtotal * appliedCoupon.value / 100) : appliedCoupon.value) : 0;
  const cashbackEarned = subtotal * 0.05; // 5% Cashback

  const totalWithVat = (subtotal - discountAmount + shippingFee) * 1.15;
  const MIN_ORDER_THRESHOLD = 50;

  const handleApplyCoupon = () => {
    const coupon = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.isActive);
    if (!coupon) {
      addToast(t('cart.invalidCoupon'), 'error');
      return;
    }
    if (subtotal < coupon.minOrderAmount) {
      addToast(t('cart.minOrderCoupon', { min: coupon.minOrderAmount }), 'warning');
      return;
    }
    setAppliedCoupon(coupon);
    addToast(t('cart.couponApplied'), 'success');
  };

  useEffect(() => {
    let timer: any;
    if (waitTimer > 0) {
      timer = setInterval(() => setWaitTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [waitTimer]);

  const handleStartCheckout = () => {
    if (subtotal < MIN_ORDER_THRESHOLD) {
      addToast(t('checkout.minOrderError'), 'error');
      return;
    }
    setPage('checkout');
  };

  const handleSendOtp = async () => {
    if (waitTimer > 0) return;
    const saudiPhoneRegex = /^(05|5)([0-9]{8})$/;
    if (!saudiPhoneRegex.test(phone)) {
      addToast(language === 'ar' ? "يرجى إدخال رقم هاتف صحيح (05XXXXXXXX)" : "Valid phone required", 'error');
      return;
    }

    setIsLoading(true);

    // Check if phone is already verified (First-time verification logic)
    try {
      const { isVerified } = await api.checkPhoneVerification(phone);
      if (isVerified) {
        localStorage.setItem(REMEMBERED_PHONE_KEY, phone);
        setCheckoutStep('address');
        addToast(t('cart.identityVerified'), 'success');
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.error("Verification check failed", err);
    }

    try {
      await api.sendOtp(phone, 'checkout');
      setIsLoading(false);
      setCheckoutStep('otp');
      setWaitTimer(60);
      addToast(t('cart.otpSent'), 'success');
    } catch (err) {
      setIsLoading(false);
      addToast(t('cart.otpFailed'), 'error');
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    try {
      const { verified } = await api.verifyOtp(phone, otpInput, 'checkout');
      setIsLoading(false);

      if (verified) {
        localStorage.setItem(REMEMBERED_PHONE_KEY, phone);
        setCheckoutStep('address');
        addToast(t('cart.verifiedSuccess'), 'success');
      } else {
        addToast(t('cart.invalidCode'), 'error');
      }
    } catch (err) {
      setIsLoading(false);
      addToast(t('cart.verificationError'), 'error');
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep('delivery');
  };

  const handleDeliverySubmit = () => {
    setCheckoutStep('payment');
  };

  const handleFinalOrder = async (method: 'visa' | 'paypal' | 'mada' | 'cod' | 'bank_transfer' | 'tabby' | 'tamara') => {
    setIsLoading(true);

    // Simple branch assignment logic
    let assignedBranchId = BRANCH_LOCATIONS[0].id; // Default to Jeddah
    if (address.city.includes('الرياض') || address.city.toLowerCase().includes('riyadh')) assignedBranchId = 2;
    else if (address.city.includes('مكة') || address.city.toLowerCase().includes('makkah')) assignedBranchId = 3;
    else if (address.city.includes('المدينة') || address.city.toLowerCase().includes('madinah')) assignedBranchId = 4;
    else if (address.city.includes('الدمام') || address.city.toLowerCase().includes('dammam')) assignedBranchId = 5;
    else if (address.city.includes('أبها') || address.city.toLowerCase().includes('abha')) assignedBranchId = 6;

    try {
      setSelectedPaymentMethod(method);
      const orderId = await createOrderWithInvoice({
        customerPhone: phone,
        customerName: firebaseUser?.displayName || 'عميل VIP',
        items: cart,
        subtotal,
        shippingFee,
        discountAmount,
        total: totalWithVat,
        address: `${address.city}, ${address.district}, ${address.street}`,
        paymentMethod: method,
        cashbackEarned,
        couponCode: appliedCoupon?.code,
        customerId: firebaseUser?.uid || 'anonymous',
        branchId: assignedBranchId.toString()
      });

      setOrderId(orderId);
      addPurchaseHistory(cart);
      setIsLoading(false);

      if (method !== 'cod' && method !== 'bank_transfer') {
        setInitialPaymentMethod(method as any);
        setShowPaymentGateway(true);
      } else {
        setCheckoutStep('success');
      }
    } catch (err) {
      setIsLoading(false);
      addToast(t('cart.orderFailed'), 'error');
    }
  };

  const [initialPaymentMethod, setInitialPaymentMethod] = useState<'visa' | 'paypal' | 'mada' | 'mada'>('visa');

  const handleGatewaySuccess = (txnId: string) => {
    setShowPaymentGateway(false);
    setCheckoutStep('success');
  };

  const resetIdentity = () => {
    localStorage.removeItem(REMEMBERED_PHONE_KEY);
    setPhone('');
    setCheckoutStep('phone');
  };

  useEffect(() => {
    if (checkoutStep === 'success' && orderId) {
      const timer = setTimeout(() => {
        if (user?.role === 'admin' || user?.role === 'developer') {
          setPage('dashboard');
          addToast(t('cart.redirectDashboard'), 'info');
        } else {
          setPage('trackOrder');
          addToast(t('cart.redirectTrack'), 'info');
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [checkoutStep, orderId, user, setPage, language]);

  if (checkoutStep === 'success') {
    return (
      <div
        className="container mx-auto px-4 py-12 md:py-20 text-black"
      >
        <div className="bg-white p-8 md:p-24 rounded-3xl md:rounded-[5rem] shadow-sovereign max-w-4xl mx-auto text-center border-t-[15px] md:border-t-[30px] border-primary relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-primary/5 blur-3xl rounded-full"></div>
          <div
            className="w-24 h-24 md:w-40 md:h-40 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 md:mb-12 border-4 md:border-8 border-green-100 shadow-inner"
          >
            <svg className="w-12 h-12 md:w-24 md:h-24 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h1 className="text-3xl md:text-6xl font-black text-primary mb-4 md:mb-6 tracking-tighter uppercase">{t('cart.checkout.successTitle')}</h1>
          <p className="text-lg md:text-3xl text-gray-400 font-bold mb-8 md:mb-16 leading-relaxed">{t('cart.checkout.successSubtitle')}</p>

          <div
            className="bg-gray-50 p-8 md:p-12 rounded-2xl md:rounded-[3.5rem] mb-8 md:mb-16 border-2 md:border-4 border-gray-100 shadow-inner flex flex-col items-center"
          >
            <p className="text-gray-400 font-black text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.5em] mb-4 md:mb-6">{t('cart.checkout.orderId')}</p>
            <p className="text-3xl md:text-6xl font-mono font-black text-primary tracking-widest break-all">{orderId}</p>
          </div>

          {/* Bank Details for Bank Transfer */}
          {selectedPaymentMethod === 'bank_transfer' && (
            <div className="bg-orange-50 p-8 md:p-12 rounded-2xl md:rounded-[3.5rem] mb-8 md:mb-16 border-2 md:border-4 border-orange-100 text-right">
              <h3 className="text-xl md:text-3xl font-black text-primary mb-6 border-b border-orange-200 pb-4 flex items-center gap-4">
                <span>🏛️</span>
                {t('checkout.bankDetails')}
              </h3>
              <div className="space-y-4 md:space-y-6">
                <div className="flex justify-between items-center bg-white/50 p-4 rounded-xl">
                  <span className="text-gray-500 font-bold">{t('cart.bankInfo.bank')}</span>
                  <span className="text-primary font-black">{COMPANY_INFO.bank.name}</span>
                </div>
                <div className="flex justify-between items-center bg-white/50 p-4 rounded-xl">
                  <span className="text-gray-500 font-bold">{t('cart.bankInfo.branch')}</span>
                  <span className="text-primary font-black">{COMPANY_INFO.bank.branch}</span>
                </div>
                <div className="flex justify-between items-center bg-white/50 p-4 rounded-xl">
                  <span className="text-gray-500 font-bold">{t('cart.bankInfo.idNo')}</span>
                  <span className="text-primary font-black font-mono">{COMPANY_INFO.bank.id_number}</span>
                </div>
                <div className="flex justify-between items-center bg-white/50 p-4 rounded-xl">
                  <span className="text-gray-500 font-bold">{t('cart.bankInfo.accountName')}</span>
                  <span className="text-primary font-black">{COMPANY_INFO.bank.account_name}</span>
                </div>
                <div className="flex justify-between items-center bg-white/50 p-4 rounded-xl">
                  <span className="text-gray-500 font-bold">{t('cart.bankInfo.accountNumber')}</span>
                  <span className="text-primary font-black font-mono">{COMPANY_INFO.bank.account_number}</span>
                </div>
                <div className="flex justify-between items-center bg-white/50 p-4 rounded-xl border-t-2 border-orange-200 mt-2 pt-4">
                  <span className="text-gray-500 font-bold">{t('cart.bankInfo.iban')}</span>
                  <span className="text-primary font-black font-mono text-xs md:text-lg">{COMPANY_INFO.bank.iban}</span>
                </div>
              </div>
              <p className="mt-8 text-sm md:text-lg text-orange-700 font-bold text-center">
                {t('cart.bankInfo.transferInstruction')}
              </p>
            </div>
          )}

          {import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
            <div className="mb-12">
              <FleetRadar orderId={orderId} apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <a
              href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=Confirm%20Order%20${orderId}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-4 md:gap-6 bg-green-500 text-white font-black py-5 md:py-8 rounded-2xl md:rounded-[2.5rem] text-xl md:text-3xl hover:bg-green-600 transition-all shadow-4xl border-b-4 md:border-b-[10px] border-green-700 active:translate-y-1 md:active:translate-y-2 active:border-b-0"
            >
              💬 {t('cart.checkout.whatsappConfirmation')}
            </a>
            <button
              onClick={() => { clearCart(); setCheckoutStep('cart'); setPage('home'); }} className="bg-slate-100 text-slate-400 font-black py-5 md:py-8 rounded-2xl md:rounded-[2.5rem] text-lg md:text-2xl hover:bg-primary hover:text-white transition-all shadow-xl"
            >
              {t('cart.checkout.backToStore')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto px-4 md:px-6 py-12 md:py-24 text-black selection:bg-secondary selection:text-white"
    >
      {showPaymentGateway && (
        <PaymentPortal
          amount={totalWithVat}
          orderId={orderId}
          initialMethod={initialPaymentMethod}
          onCancel={() => setShowPaymentGateway(false)}
          onSuccess={handleGatewaySuccess}
        />
      )}

      {checkoutStep === 'cart' && (
        <div
          className="max-w-[1400px] mx-auto"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 mb-12 md:mb-20">
            <div className="space-y-2 md:space-y-4">
              <h1 className="text-4xl md:text-7xl font-black text-primary tracking-tighter uppercase">{t('cart.title')}</h1>
              <p className="text-xl md:text-3xl font-bold text-gray-400 italic border-r-4 md:border-r-8 border-secondary pr-4 md:pr-6 leading-none">{t('cart.qualityPledge')}</p>
            </div>
            {cart.length > 0 && <button onClick={clearCart} className="bg-red-50 text-red-500 px-8 md:px-12 py-3 md:py-5 rounded-xl md:rounded-[2rem] font-black text-lg md:text-xl hover:bg-red-500 hover:text-white transition-all shadow-lg">{t('cart.clear')}</button>}
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-24 md:py-44 bg-gray-50 rounded-3xl md:rounded-[6rem] border-4 md:border-8 border-dashed border-gray-100 shadow-inner">
              <div className="text-6xl md:text-[12rem] mb-8 md:mb-12 opacity-10 grayscale scale-x-[-1]">🛒</div>
              <p className="text-2xl md:text-4xl font-black text-gray-300 uppercase tracking-[0.2em] md:tracking-[0.4em] mb-8 md:mb-12">{t('cart.empty')}</p>
              <button onClick={() => setPage('products')} className="bg-primary text-white font-black py-5 md:py-8 px-12 md:px-24 rounded-2xl md:rounded-[2.5rem] text-xl md:text-3xl shadow-4xl hover:scale-105 transition-all">
                {t('cart.continueShopping')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-16">
              <div className="xl:col-span-8 space-y-6 md:space-y-10">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[4rem] shadow-2xl border border-gray-50 flex flex-col md:flex-row items-center gap-6 md:gap-12 group hover:border-primary/10 transition-all relative"
                  >
                    <div className="w-32 h-32 md:w-44 md:h-44 rounded-2xl md:rounded-[3rem] overflow-hidden shadow-2xl flex-shrink-0 border-2 md:border-4 border-white">
                      <img src={item.image} alt={item.name_ar} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    </div>
                    <div className="flex-grow text-center md:text-right space-y-1 md:space-y-2">
                      <span className="text-[10px] font-black text-secondary uppercase tracking-widest">{t(`categories.${item.category}`)}</span>
                      <h3 className="text-xl md:text-3xl font-black text-slate-800 leading-tight">{language === 'ar' ? item.name_ar : item.name_en}</h3>
                      <p className="text-primary font-bold text-lg md:text-xl">{formatCurrency(item.price)} <span className="text-gray-400 text-xs md:text-sm">/ {language === 'ar' ? item.unit_ar : item.unit_en}</span></p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 w-full md:w-auto">
                      <div className="bg-gray-50 p-2 md:p-3 rounded-xl md:rounded-[2.5rem] flex items-center gap-6 md:gap-8 border border-gray-100 shadow-inner">
                        {(() => {
                          const isWeight = item.unit_en?.toLowerCase().includes('kg') || item.unit_ar?.includes('كيلو');
                          const step = isWeight ? 0.5 : 1;
                          return (
                            <>
                              <button onClick={() => updateQuantity(item.id, Math.max(step, item.quantity - step))} className="w-10 h-10 md:w-14 md:h-14 bg-white shadow-xl rounded-lg md:rounded-2xl font-black text-xl md:text-3xl hover:bg-primary hover:text-white transition-all transform active:scale-90">-</button>
                              <span className="font-black text-xl md:text-3xl min-w-[2rem] md:min-w-[3rem] text-center text-primary">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + step)} className="w-10 h-10 md:w-14 md:h-14 bg-white shadow-xl rounded-lg md:rounded-2xl font-black text-xl md:text-3xl hover:bg-primary hover:text-white transition-all transform active:scale-90">+</button>
                            </>
                          );
                        })()}
                      </div>
                      <div className="text-center md:text-right min-w-[120px] md:min-w-[160px]">
                        <p className="text-2xl md:text-4xl font-black text-primary">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="p-4 md:p-6 text-gray-300 hover:text-red-500 transition-all"><TrashIcon className="w-6 h-6 md:w-8 md:h-8" /></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="xl:col-span-4">
                <div
                  className="bg-primary text-white p-8 md:p-12 rounded-3xl md:rounded-[5rem] shadow-4xl sticky top-36 border-b-[15px] md:border-b-[30px] border-secondary overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-white/5 blur-3xl rounded-full"></div>
                  <h2 className="text-2xl md:text-4xl font-black mb-8 md:mb-12 border-b border-white/10 pb-6 md:pb-8 flex items-center gap-4 md:gap-6">
                    <SparklesIcon className="w-8 h-8 md:w-10 md:h-10 text-secondary animate-pulse" />
                    {t('cart.summary')}
                  </h2>
                  <div className="space-y-6 md:space-y-8 mb-12 md:mb-16">
                    <div className="flex justify-between font-bold text-lg md:text-2xl opacity-60"><span>{t('cart.items_value')}</span><span>{formatCurrency(subtotal)}</span></div>

                    {/* Coupon Input */}
                    <div className="flex gap-3 md:gap-4">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder={t('cart.couponCodeLabel')}
                        className="flex-grow bg-white/10 border border-white/20 rounded-lg md:rounded-xl px-4 py-2 text-white placeholder:text-white/40 outline-none focus:border-secondary text-sm md:text-base"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="bg-secondary px-4 md:px-6 py-2 rounded-lg md:rounded-xl font-black text-xs md:text-sm hover:bg-white hover:text-secondary transition-all"
                      >
                        {t('cart.apply')}
                      </button>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between font-bold text-lg md:text-2xl text-secondary">
                        <span>{t('cart.discount')} ({appliedCoupon.code})</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between font-bold text-lg md:text-2xl opacity-60">
                      <span>{t('cart.deliveryFeeLabel')}</span>
                      <span>{shippingFee === 0 ? t('cart.freeLabel') : formatCurrency(shippingFee)}</span>
                    </div>

                    <div className="flex justify-between font-bold text-lg md:text-2xl opacity-60"><span>{t('cart.vat')}</span><span>{formatCurrency((subtotal - discountAmount + shippingFee) * 0.15)}</span></div>

                    <div className="bg-white/10 p-4 rounded-xl md:rounded-2xl border border-white/20">
                      <div className="flex justify-between items-center">
                        <span className="text-xs md:text-sm font-bold opacity-80">{t('cart.cashbackEarnedLabel')}</span>
                        <span className="text-lg md:text-xl font-black text-secondary">+{formatCurrency(cashbackEarned)}</span>
                      </div>
                    </div>

                    <div className="pt-6 md:pt-10 border-t border-white/20 flex justify-between items-center">
                      <span className="text-xl md:text-3xl font-black">{t('cart.grandTotalLabel')}</span>
                      <span className="text-3xl md:text-6xl font-black text-secondary">{formatCurrency(totalWithVat)}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleStartCheckout} className="w-full py-6 md:py-10 bg-secondary text-white rounded-2xl md:rounded-[3rem] font-black text-2xl md:text-4xl shadow-4xl transition-all border-b-8 md:border-b-[15px] border-orange-800 uppercase tracking-tighter"
                  >
                    ✅ {t('cart.finalizeCheckout')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {checkoutStep === 'phone' && (
        <div
          className="max-w-3xl mx-auto bg-white p-8 md:p-24 rounded-3xl md:rounded-[6rem] shadow-sovereign border-t-[15px] md:border-t-[25px] border-primary"
        >
          <div className="text-center mb-10 md:mb-16">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-10 text-primary border-2 md:border-4 border-primary/10 shadow-inner">
              <PhoneIcon className="w-12 h-12 md:w-16 md:h-16" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-primary mb-4 tracking-tighter">{t('checkout.phoneStep')}</h2>
            <p className="text-lg md:text-2xl text-gray-400 font-bold max-w-lg mx-auto leading-relaxed">{t('checkout.phoneVerificationSubtitle')}</p>
          </div>
          <div className="space-y-8 md:space-y-12">
            <div className="relative group">
              <input type="tel" placeholder={t('checkout.phonePlaceholder')} value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-6 md:p-10 bg-gray-50 border-4 md:border-[6px] border-gray-100 rounded-2xl md:rounded-[3rem] font-black text-3xl md:text-5xl text-center focus:border-primary focus:bg-white outline-none transition-all shadow-inner" />
              <div className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 text-2xl md:text-4xl opacity-40">🇸🇦</div>
            </div>
            <button
              onClick={handleSendOtp} disabled={isLoading || waitTimer > 0} className="w-full py-6 md:py-10 bg-primary text-white rounded-2xl md:rounded-[3rem] font-black text-2xl md:text-4xl shadow-4xl transition-all disabled:opacity-50"
            >
              {isLoading ? t('checkout.sendingOtp') : waitTimer > 0 ? t('checkout.resendOtp', { timer: waitTimer }) : t('checkout.sendCode')}
            </button>
          </div>
        </div>
      )}

      {checkoutStep === 'otp' && (
        <div
          className="max-w-3xl mx-auto bg-white p-8 md:p-24 rounded-3xl md:rounded-[6rem] shadow-sovereign border-t-[15px] md:border-t-[25px] border-secondary text-center"
        >
          <h2 className="text-3xl md:text-5xl font-black text-primary mb-4 md:mb-6 tracking-tighter">{t('checkout.otpStep')}</h2>
          <p className="text-lg md:text-2xl text-gray-400 font-bold mb-10 md:mb-16 leading-relaxed">{t('checkout.otpSubtitle')}</p>
          <input type="text" maxLength={6} placeholder="0 0 0 0 0 0" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} className="w-full p-8 md:p-12 bg-gray-50 border-4 md:border-[6px] border-gray-100 rounded-2xl md:rounded-[3rem] font-black text-5xl md:text-8xl text-center tracking-[0.2em] md:tracking-[0.5em] focus:border-secondary focus:bg-white outline-none transition-all mb-8 md:mb-12 shadow-inner text-primary" />
          <button
            onClick={handleVerifyOtp} disabled={isLoading} className="w-full py-6 md:py-10 bg-secondary text-white rounded-2xl md:rounded-[3rem] font-black text-2xl md:text-4xl shadow-4xl transition-all"
          >
            {isLoading ? t('checkout.verifyingOtp') : t('checkout.verifyCode')} 🛡️
          </button>
          <button onClick={() => setCheckoutStep('phone')} className="block mx-auto mt-6 md:mt-8 text-primary font-black text-lg underline opacity-50">{t('checkout.changePhone')}</button>
        </div>
      )}

      {checkoutStep === 'address' && (
        <div
          className="max-w-5xl mx-auto bg-white p-8 md:p-24 rounded-3xl md:rounded-[6rem] shadow-sovereign border-t-[15px] md:border-t-[30px] border-primary"
        >
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 mb-12 md:mb-20 border-b-2 md:border-b-4 border-gray-50 pb-8 md:pb-12">
            <div className="bg-primary p-6 md:p-8 rounded-2xl md:rounded-[3rem] text-white shadow-4xl transform -rotate-3"><LocationMarkerIcon className="w-12 h-12 md:w-20 md:h-20" /></div>
            <div className="flex-grow text-center md:text-right">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                <div>
                  <h2 className="text-3xl md:text-5xl font-black text-primary uppercase tracking-tighter mb-2">{t('checkout.addressStep')}</h2>
                  <p className="text-lg md:text-2xl text-gray-400 font-bold">{t('checkout.addressSubtitle')}</p>
                </div>
                {localStorage.getItem(REMEMBERED_PHONE_KEY) && (
                  <button onClick={resetIdentity} className="text-[10px] md:text-xs font-black text-red-500 bg-red-50 px-4 py-2 rounded-lg md:rounded-xl hover:bg-red-100 transition-all">
                    {t('checkout.changePhone')}
                  </button>
                )}
              </div>
            </div>
          </div>
          <form onSubmit={handleAddressSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
            <input required type="text" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} className="w-full p-6 md:p-8 bg-gray-50 border-2 md:border-4 border-gray-100 rounded-xl md:rounded-[2.5rem] font-black text-xl md:text-2xl focus:border-primary outline-none" placeholder={t('checkout.city')} />
            <input required type="text" value={address.district} onChange={e => setAddress({ ...address, district: e.target.value })} className="w-full p-6 md:p-8 bg-gray-50 border-2 md:border-4 border-gray-100 rounded-xl md:rounded-[2.5rem] font-black text-xl md:text-2xl focus:border-primary outline-none" placeholder={t('checkout.district')} />
            <input required type="text" value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} className="w-full p-6 md:p-8 bg-gray-50 border-2 md:border-4 border-gray-100 rounded-xl md:rounded-[2.5rem] font-black text-xl md:text-2xl focus:border-primary outline-none md:col-span-2" placeholder={t('checkout.street')} />
            <button
              type="submit" className="w-full py-6 md:py-10 bg-primary text-white rounded-2xl md:rounded-[3.5rem] font-black text-2xl md:text-4xl shadow-4xl transition-all md:col-span-2 border-b-8 md:border-b-[15px] border-primary-dark"
            >
              {t('checkout.confirmAddress')}
            </button>
          </form>
        </div>
      )}

      {checkoutStep === 'delivery' && (
        <div className="max-w-5xl mx-auto bg-white p-8 md:p-24 rounded-3xl md:rounded-[6rem] shadow-sovereign border-t-[15px] md:border-t-[30px] border-secondary">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-primary mb-4 tracking-tighter uppercase">{t('cart.deliveryMode.title')}</h2>
            <p className="text-lg md:text-2xl text-gray-400 font-bold">{t('cart.deliveryMode.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-10 md:mb-16">
            {(['standard', 'express', 'scheduled'] as DeliveryMethod[]).map((method) => (
              <div
                key={method}
                onClick={() => setDeliveryMethod(method)}
                className={`p-6 md:p-10 rounded-2xl md:rounded-[3rem] border-2 md:border-4 cursor-pointer transition-all flex flex-col items-center text-center group ${deliveryMethod === method ? 'border-secondary bg-secondary/5 shadow-xl' : 'border-gray-100 hover:border-secondary/30'
                  }`}
              >
                <div className="text-4xl md:text-6xl mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                  {method === 'standard' ? '🚚' : method === 'express' ? '⚡' : '📅'}
                </div>
                <h3 className="text-xl md:text-2xl font-black text-primary mb-2">
                  {t(`cart.deliveryMode.${method}`)}
                </h3>
                <p className="text-sm md:text-gray-400 font-bold">
                  {method === 'standard' ? t('cart.deliveryMode.within24h') :
                    method === 'express' ? t('cart.deliveryMode.within2h') :
                      t('cart.deliveryMode.pickTime')}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={handleDeliverySubmit}
            className="w-full py-6 md:py-10 bg-secondary text-white rounded-2xl md:rounded-[3.5rem] font-black text-2xl md:text-4xl shadow-4xl transition-all border-b-8 md:border-b-[15px] border-orange-800"
          >
            {t('cart.deliveryMode.confirm')}
          </button>
        </div>
      )}

      {checkoutStep === 'payment' && (
        <div
          className="max-w-6xl mx-auto space-y-10 md:space-y-16"
        >
          <div className="bg-primary text-white p-8 md:p-16 rounded-3xl md:rounded-[6rem] shadow-4xl flex flex-col md:flex-row justify-between items-center relative overflow-hidden border-b-[15px] md:border-b-[30px] border-secondary">
            <div className="absolute top-0 right-0 w-48 md:w-96 h-48 md:h-96 bg-white/5 blur-3xl rounded-full"></div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter relative z-10">{t('checkout.paymentStep')}</h2>
            <p className="text-secondary font-black text-2xl md:text-3xl relative z-10">{formatCurrency(totalWithVat)}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div
              onClick={() => handleFinalOrder('visa')} className="bg-white p-8 md:p-10 rounded-2xl md:rounded-[4rem] shadow-sovereign border-2 md:border-4 border-transparent hover:border-primary transition-all flex flex-col items-center text-center cursor-pointer group"
            >
              <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-50 rounded-xl md:rounded-[2rem] flex flex-col items-center justify-center mb-6 md:mb-8 group-hover:scale-110 transition-transform p-4 gap-2">
                <div className="flex gap-2 items-center justify-center">
                  <svg viewBox="0 0 100 32" className="h-6 md:h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 4.5C8.5 4.5 5.5 7.5 5.5 11.5V20.5C5.5 24.5 8.5 27.5 12.5 27.5H87.5C91.5 27.5 94.5 24.5 94.5 20.5V11.5C94.5 7.5 91.5 4.5 87.5 4.5H12.5Z" fill="#003580" />
                    <text x="50" y="20" textAnchor="middle" className="text-[10px] font-black" fill="white" style={{ fontFamily: 'sans-serif' }}>MADA</text>
                  </svg>
                  <svg viewBox="0 0 48 48" className="h-6 md:h-8" xmlns="http://www.w3.org/2000/svg">
                    <rect width="48" height="32" y="8" rx="4" fill="#1A1F71" />
                    <path d="M11.5 14H15L17 22L19 14H22.5L19 28H15.5L11.5 14Z" fill="#F7B600" />
                  </svg>
                </div>
                <div className="flex gap-2 items-center justify-center">
                  <svg viewBox="0 0 48 48" className="h-6 md:h-8" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="18" cy="24" r="14" fill="#EB001B" fillOpacity="0.8" />
                    <circle cx="30" cy="24" r="14" fill="#F79E1B" fillOpacity="0.8" />
                  </svg>
                  <svg viewBox="0 0 48 48" className="h-6 md:h-8" xmlns="http://www.w3.org/2000/svg">
                    <rect width="48" height="32" y="8" rx="6" fill="black" />
                    <text x="24" y="30" textAnchor="middle" className="text-[12px] font-black" fill="white" style={{ fontFamily: 'sans-serif' }}>Pay</text>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2 md:mb-4">{t('cart.paymentOptions.creditCard')}</h3>
              <p className="text-[10px] md:text-xs text-gray-400 font-bold mb-6 md:mb-8">Visa / Mastercard / Mada / Apple Pay</p>
              <button className="mt-auto w-full py-4 md:py-6 bg-primary text-white rounded-xl md:rounded-[2rem] font-black text-lg md:text-xl">{t('cart.paymentOptions.selectCredit')}</button>
            </div>
            <div
              onClick={() => handleFinalOrder('bank_transfer')} className="bg-white p-8 md:p-10 rounded-2xl md:rounded-[4rem] shadow-sovereign border-2 md:border-4 border-transparent hover:border-secondary transition-all flex flex-col items-center text-center cursor-pointer group"
            >
              <div className="w-16 h-16 md:w-24 md:h-24 bg-orange-50 rounded-xl md:rounded-[2rem] flex items-center justify-center mb-6 md:mb-8 text-3xl md:text-5xl group-hover:scale-110 transition-transform">
                <svg className="w-12 h-12 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2 md:mb-4">{t('cart.paymentOptions.bankTransfer')}</h3>
              <p className="text-[10px] md:text-xs text-gray-400 font-bold mb-6 md:mb-8">{t('cart.bankInfo.bankDetails')}</p>
              <button className="mt-auto w-full py-4 md:py-6 bg-secondary text-white rounded-xl md:rounded-[2rem] font-black text-lg md:text-xl">{t('cart.paymentOptions.selectBank')}</button>
            </div>
            <div
              onClick={() => handleFinalOrder('paypal')} className="bg-white p-8 md:p-10 rounded-2xl md:rounded-[4rem] shadow-sovereign border-2 md:border-4 border-transparent hover:border-blue-500 transition-all flex flex-col items-center text-center cursor-pointer group"
            >
              <div className="w-16 h-16 md:w-24 md:h-24 bg-blue-50 rounded-xl md:rounded-[2rem] flex items-center justify-center mb-6 md:mb-8 text-3xl md:text-5xl group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" className="w-12 h-12" fill="#003087"><path d="M7 2h7c2.76 0 5 2.24 5 5s-2.24 5-5 5h-3l-1 9H4l3-19z" /><path d="M11 7h7c2.76 0 5 2.24 5 5s-2.24 5-5 5h-3l-1 9H8l3-19z" fill="#0070ba" opacity=".8" /></svg>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2 md:mb-4">{t('cart.paymentOptions.paypal')}</h3>
              <p className="text-[10px] md:text-xs text-gray-400 font-bold mb-6 md:mb-8">{t('cart.paymentOptions.safePaypal')}</p>
              <button className="mt-auto w-full py-4 md:py-6 bg-blue-600 text-white rounded-xl md:rounded-[2rem] font-black text-lg md:text-xl">{t('cart.paymentOptions.selectPaypal')}</button>
            </div>
            <div
              onClick={() => handleFinalOrder('tamara')} className="bg-white p-8 md:p-10 rounded-2xl md:rounded-[4rem] shadow-sovereign border-2 md:border-4 border-transparent hover:border-amber-500 transition-all flex flex-col items-center text-center cursor-pointer group"
            >
              <div className="w-16 h-16 md:w-24 md:h-24 bg-amber-50 rounded-xl md:rounded-[2rem] flex items-center justify-center mb-6 md:mb-8 text-3xl md:text-5xl group-hover:scale-110 transition-transform">
                <div className="bg-[#ffcc99] text-black px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest">Tamara</div>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2 md:mb-4">تمارا (قسطها)</h3>
              <p className="text-[10px] md:text-xs text-gray-400 font-bold mb-6 md:mb-8">قسط مشترياتك على دفعات</p>
              <button className="mt-auto w-full py-4 md:py-6 bg-amber-600 text-white rounded-xl md:rounded-[2rem] font-black text-lg md:text-xl">{t('cart.paymentOptions.selectTamara', 'Select Tamara')}</button>
            </div>
            <div
              onClick={() => handleFinalOrder('tabby')} className="bg-white p-8 md:p-10 rounded-2xl md:rounded-[4rem] shadow-sovereign border-2 md:border-4 border-transparent hover:border-green-400 transition-all flex flex-col items-center text-center cursor-pointer group"
            >
              <div className="w-16 h-16 md:w-24 md:h-24 bg-green-50 rounded-xl md:rounded-[2rem] flex items-center justify-center mb-6 md:mb-8 text-3xl md:text-5xl group-hover:scale-110 transition-transform">
                <div className="bg-[#ccff00] text-black px-4 py-2 rounded-lg font-black text-xs">tabby</div>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2 md:mb-4">تابي (4 دفعات)</h3>
              <p className="text-[10px] md:text-xs text-gray-400 font-bold mb-6 md:mb-8">بدون فوائد ولا رسوم إضافية</p>
              <button className="mt-auto w-full py-4 md:py-6 bg-green-600 text-white rounded-xl md:rounded-[2rem] font-black text-lg md:text-xl">{t('cart.paymentOptions.selectTabby', 'Select Tabby')}</button>
            </div>
            <div
              onClick={() => handleFinalOrder('cod')} className="bg-white p-8 md:p-10 rounded-2xl md:rounded-[4rem] shadow-sovereign border-2 md:border-4 border-transparent hover:border-slate-900 transition-all flex flex-col items-center text-center cursor-pointer group"
            >
              <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-50 rounded-xl md:rounded-[2rem] flex items-center justify-center mb-6 md:mb-8 text-3xl md:text-5xl group-hover:scale-110 transition-transform">
                <svg className="w-12 h-12 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2 md:mb-4">{t('cart.paymentOptions.cod')}</h3>
              <p className="text-[10px] md:text-xs text-gray-400 font-bold mb-6 md:mb-8">{t('cart.paymentOptions.codDesc')}</p>
              <button className="mt-auto w-full py-4 md:py-6 bg-slate-900 text-white rounded-xl md:rounded-[2rem] font-black text-lg md:text-xl">{t('cart.paymentOptions.selectCod')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
