
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, onAuthStateChanged, onSnapshot, collection, query, orderBy, where, handleFirestoreError, OperationType, FirebaseUser, setDoc, doc, updateDoc, deleteDoc, testFirestoreConnection } from '@/firebase';
import { User, Product, CategoryConfig, ProductUnit, HomeSection, Order, Branch, ShowroomItem, Coupon, Ad, LegalPage, PriceUpdateRequest, DeliveryAgent, Invoice, UserRole } from '../../../types';
import { supabase, checkSupabaseConnection } from '../../../lib/supabaseClient';
import api from '@/services/api';
import { DEFAULT_LEGAL_PAGES } from '../../../data/legalData';
import { onyxService } from '../../../services/onyxService';
import { smsService } from '../../../services/smsService';
import { useI18n } from './I18nContext';

interface Notification {
  id: string;
  title_ar: string;
  title_en: string;
  message_ar: string;
  message_en: string;
  createdAt: string;
  isRead: boolean;
  type: 'order' | 'system' | 'price' | 'user';
}

interface FirebaseContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  products: Product[];
  showroomItems: ShowroomItem[];
  categories: CategoryConfig[];
  units: ProductUnit[];
  homeSections: HomeSection[];
  orders: Order[];
  branches: Branch[];
  coupons: Coupon[];
  ads: Ad[];
  legalPages: LegalPage[];
  priceUpdateRequests: PriceUpdateRequest[];
  notifications: Notification[];
  deliveryAgents: DeliveryAgent[];
  invoices: Invoice[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  db: any;
  users: User[];
  promotions: any[];
  // Management methods
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: number, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  addShowroomItem: (item: Omit<ShowroomItem, 'id'>) => Promise<void>;
  updateShowroomItem: (id: number, data: Partial<ShowroomItem>) => Promise<void>;
  deleteShowroomItem: (id: number) => Promise<void>;
  updateOrder: (id: string, data: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  addCoupon: (coupon: Omit<Coupon, 'id'>) => Promise<void>;
  updateCoupon: (id: string, data: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  addAd: (ad: Omit<Ad, 'id'>) => Promise<void>;
  updateAd: (id: string, data: Partial<Ad>) => Promise<void>;
  deleteAd: (id: string) => Promise<void>;
  addBranch: (branch: Omit<Branch, 'id'>) => Promise<void>;
  updateBranch: (id: string, data: Partial<Branch>) => Promise<void>;
  deleteBranch: (id: string) => Promise<void>;
  addPriceUpdateRequest: (request: Omit<PriceUpdateRequest, 'id'>) => Promise<void>;
  updatePriceUpdateRequest: (id: string, data: Partial<PriceUpdateRequest>) => Promise<void>;
  updateUserPermissions: (userId: string, permissions: string[]) => Promise<void>;
  updateLegalPage: (id: string, data: Partial<LegalPage>) => Promise<void>;
  updateHomeSection: (id: string, data: Partial<HomeSection>) => Promise<void>;
  addHomeSection: (section: Omit<HomeSection, 'id'>) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  updateDeliveryAgent: (id: string, data: Partial<DeliveryAgent>) => Promise<void>;
  addDeliveryAgent: (agent: Omit<DeliveryAgent, 'id'>) => Promise<void>;
  deleteDeliveryAgent: (id: string) => Promise<void>;
  createOrderWithInvoice: (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'paymentStatus'>) => Promise<string>;
  seedLegalPages: () => Promise<void>;
  syncProductsToFirestore: () => Promise<void>;
  addCategory: (category: Omit<CategoryConfig, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addUnit: (unit: Omit<ProductUnit, 'id'>) => Promise<void>;
  deleteUnit: (id: string) => Promise<void>;
  getLegalPages: () => Promise<LegalPage[]>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [showroomItems, setShowroomItems] = useState<ShowroomItem[]>([]);
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [units, setUnits] = useState<ProductUnit[]>([]);
  const [homeSections, setHomeSections] = useState<HomeSection[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [legalPages, setLegalPages] = useState<LegalPage[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);
  const [priceUpdateRequests, setPriceUpdateRequests] = useState<PriceUpdateRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [deliveryAgents, setDeliveryAgents] = useState<DeliveryAgent[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const seedCoupons = async () => {
    try {
      const welcomeCoupon = {
        code: 'WELCOME10',
        discountType: 'percentage',
        value: 10,
        minOrderAmount: 100,
        expiryDate: '2026-05-31', // End of next month (May 2026)
        isActive: true
      };

      const { data } = await supabase.from('coupons').select('id').eq('code', 'WELCOME10').single();
      if (!data) {
        await supabase.from('coupons').insert(welcomeCoupon);
        console.log('✅ WELCOME10 coupon seeded successfully');
      }
    } catch (err) {
      console.error('Error seeding coupons:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await testFirestoreConnection(); // Verify Firestore connectivity
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          console.warn('⚠️ Supabase not connected. Falling back to mock data or Firebase.');
        }
        await fetchData();
        await seedCoupons(); // Ensure system coupons exist
        await seedLegalPages(); // Ensure legal pages exist
        await fetchData(); // Fetch again to get seeded data
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Sync data from Supabase
    const fetchData = async () => {
      try {
        const [
          prods,
          cats,
          unts,
          brnchs,
          adItems,
          legal,
          notifs,
          agents,
          invs,
          ordrs,
          cpns,
          usrList,
          promoList,
          sections
        ] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
          api.getUnits(),
          api.getBranches(),
          api.getAds(),
          api.getLegalPages(),
          api.getNotifications(firebaseUser?.uid || ''),
          api.getDeliveryAgents(),
          api.getInvoices(),
          api.getOrders(),
          api.getCoupons(),
          supabase.from('users').select('*').then(res => res.data || []),
          supabase.from('promotions').select('*').then(res => res.data || []),
          api.getHomeSections()
        ]);

        setProducts(prods);
        setCategories(cats);
        setUnits(unts);
        setBranches(brnchs);
        setAds(adItems);
        setHomeSections(sections);
        if (legal && legal.length > 0) {
          setLegalPages(legal);
        }
        setNotifications(notifs as any);
        setDeliveryAgents(agents);
        setInvoices(invs);
        setOrders(ordrs as any);
        setCoupons(cpns);
        setUsers(usrList as any);
        setPromotions(promoList);
        setUnreadCount((notifs as any).filter((n: any) => !n.is_read).length);
      } catch (err) {
        console.error('Error fetching data from Supabase:', err);
      }
    };

    init();

    // Real-time subscriptions for all tables
    const tables = ['products', 'categories', 'units', 'branches', 'ads', 'legal_pages', 'notifications', 'delivery_agents', 'invoices', 'orders', 'coupons', 'home_sections'];
    const subscriptions = tables.map(table =>
      supabase
        .channel(`public:${table}`)
        .on('postgres_changes' as any, { event: '*', schema: 'public', table }, fetchData)
        .subscribe()
    );

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Still use Firebase for user profile for now, or migrate to Supabase users table
        onSnapshot(doc(db, 'users', fbUser.uid), (snapshot) => {
          let userData = snapshot.data() as User;

          // Bootstrap special roles based on email
          let role: UserRole = 'client';
          let type: UserRole = 'client';
          let permissions: string[] = [];

          const adminEmails = ['deltastars777@gmail.com', 'deltastars90@gmail.com', 'marketing@deltastars-ksa.com', 'info@deltastars-ksa.com', 'vipservicesyemen@outlook.sa', 'developer@deltastars-ksa.com'];
          const isAdminEmail = adminEmails.includes(fbUser.email || '');
          const isDevEmail = fbUser.email === 'vipservicesyemen@outlook.sa' || fbUser.email === 'deltastars777@gmail.com';

          if (isDevEmail || isAdminEmail) {
            const isActualDev = isDevEmail;
            role = isActualDev ? 'developer' : 'admin';
            type = isActualDev ? 'developer' : 'admin';
            permissions = [
              'manage_products', 'manage_users', 'manage_accounting', 'manage_branches',
              'manage_prices', 'receive_orders', 'manage_quality', 'manage_complaints',
              'manage_ads', 'manage_coupons', 'manage_developer', 'manage_shipments'
            ];
          }

          if (userData) {
            // Merge permissions for special accounts to ensure they always have access
            if (isAdminEmail || isDevEmail) {
              userData = { ...userData, role, type, permissions };
            }
            setUser(userData);
          } else {
            const newUser: User = {
              id: fbUser.uid,
              uid: fbUser.uid,
              type,
              role,
              email: fbUser.email || '',
              full_name: fbUser.displayName || '',
              name: fbUser.displayName || '',
              permissions
            };
            setUser(newUser);
            // Save to Firestore
            setDoc(doc(db, 'users', fbUser.uid), newUser).catch(err => console.error('Error bootstrapping user:', err));
          }
        }, (err) => handleFirestoreError(err, OperationType.GET, 'users'));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
      unsubscribeAuth();
    };
  }, [firebaseUser]);

  // Sync orders for current user if not admin
  useEffect(() => {
    if (!user || ['admin', 'developer', 'gm', 'ops'].includes(user.role)) return;

    const fetchUserOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setOrders(data as any);
      } catch (err) {
        console.error('Error fetching user orders:', err);
      }
    };

    fetchUserOrders();
  }, [user]);

  // --- Management Methods Implementation ---
  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      await api.createProduct(product);
    } catch (err) { console.error('Error adding product to Supabase:', err); }
  };

  const updateProduct = async (id: number, data: Partial<Product>) => {
    try {
      await api.updateProduct(id, data);
    } catch (err) { console.error('Error updating product in Supabase:', err); }
  };

  const deleteProduct = async (id: number) => {
    try {
      await api.deleteProduct(id);
    } catch (err) { console.error('Error deleting product from Supabase:', err); }
  };

  const addShowroomItem = async (item: Omit<ShowroomItem, 'id'>) => {
    try {
      const { error } = await supabase.from('showroom').insert(item);
      if (error) throw error;
    } catch (err) { console.error('Error adding showroom item to Supabase:', err); }
  };

  const updateShowroomItem = async (id: number, data: Partial<ShowroomItem>) => {
    try {
      const { error } = await supabase.from('showroom').update(data).eq('id', id);
      if (error) throw error;
    } catch (err) { console.error('Error updating showroom item in Supabase:', err); }
  };

  const deleteShowroomItem = async (id: number) => {
    try {
      const { error } = await supabase.from('showroom').delete().eq('id', id);
      if (error) throw error;
    } catch (err) { console.error('Error deleting showroom item from Supabase:', err); }
  };

  const updateOrder = async (id: string, data: Partial<Order>) => {
    try {
      const { error } = await supabase.from('orders').update(data).eq('id', id);
      if (error) throw error;

      // Update corresponding invoice if status or paymentStatus changed
      if (data.status || data.paymentStatus) {
        const { data: invoiceData } = await supabase.from('invoices').select('id').eq('orderId', id).single();
        if (invoiceData) {
          const invoiceUpdate: Partial<Invoice> = {};
          if (data.paymentStatus === 'paid') {
            invoiceUpdate.status = 'Paid';
            invoiceUpdate.status_ar = 'مدفوع';
          }
          if (Object.keys(invoiceUpdate).length > 0) {
            await supabase.from('invoices').update(invoiceUpdate).eq('id', invoiceData.id);
          }
        }
      }

      // If status changed, trigger notification
      if (data.status) {
        const order = orders.find(o => o.id === id);
        if (order && order.customerPhone) {
          await smsService.sendOrderStatusUpdate(order.customerPhone, id, data.status, {
            total: order.total,
            itemsCount: order.items.length
          });
        }

        if (data.status === 'delivered') {
          await supabase.from('notifications').insert({
            title_ar: 'تم تسليم الطلب',
            title_en: 'Order Delivered',
            message_ar: `تم تسليم الطلب رقم ${id} بنجاح. شكراً لتعاملكم معنا.`,
            message_en: `Order #${id} has been delivered successfully. Thank you for choosing us.`,
            created_at: new Date().toISOString(),
            is_read: false,
            type: 'order',
            user_id: orders.find(o => o.id === id)?.customerId || ''
          });
        }
      }
    } catch (err) { console.error('Error updating order in Supabase:', err); }
  };

  const deleteOrder = async (id: string) => {
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
    } catch (err) { console.error('Error deleting order from Supabase:', err); }
  };

  const addCoupon = async (coupon: Omit<Coupon, 'id'>) => {
    try {
      await api.createCoupon(coupon);
    } catch (err) { console.error('Error adding coupon to Supabase:', err); }
  };

  const updateCoupon = async (id: string, data: Partial<Coupon>) => {
    try {
      const { error } = await supabase.from('coupons').update(data).eq('id', id);
      if (error) throw error;
    } catch (err) { console.error('Error updating coupon in Supabase:', err); }
  };

  const deleteCoupon = async (id: string) => {
    try {
      await api.deleteCoupon(id);
    } catch (err) { console.error('Error deleting coupon from Supabase:', err); }
  };

  const addAd = async (ad: Omit<Ad, 'id'>) => {
    try {
      const { error } = await supabase.from('ads').insert(ad);
      if (error) throw error;
    } catch (err) { console.error('Error adding ad to Supabase:', err); }
  };

  const updateAd = async (id: string, data: Partial<Ad>) => {
    try {
      const { error } = await supabase.from('ads').update(data).eq('id', id);
      if (error) throw error;
    } catch (err) { console.error('Error updating ad in Supabase:', err); }
  };

  const deleteAd = async (id: string) => {
    try {
      const { error } = await supabase.from('ads').delete().eq('id', id);
      if (error) throw error;
    } catch (err) { console.error('Error deleting ad from Supabase:', err); }
  };

  const addBranch = async (branch: Omit<Branch, 'id'>) => {
    try {
      const { error } = await supabase.from('branches').insert(branch);
      if (error) throw error;
    } catch (err) { console.error('Error adding branch to Supabase:', err); }
  };

  const updateBranch = async (id: string, data: Partial<Branch>) => {
    try {
      const { error } = await supabase.from('branches').update(data).eq('id', id);
      if (error) throw error;
    } catch (err) { console.error('Error updating branch in Supabase:', err); }
  };

  const deleteBranch = async (id: string) => {
    try {
      const { error } = await supabase.from('branches').delete().eq('id', id);
      if (error) throw error;
    } catch (err) { console.error('Error deleting branch from Supabase:', err); }
  };

  const addPriceUpdateRequest = async (request: Omit<PriceUpdateRequest, 'id'>) => {
    try {
      const { error } = await supabase.from('price_update_requests').insert(request);
      if (error) throw error;
    } catch (err) { console.error('Error adding price update request to Supabase:', err); }
  };

  const updatePriceUpdateRequest = async (id: string, data: Partial<PriceUpdateRequest>) => {
    try {
      const { error } = await supabase.from('price_update_requests').update(data).eq('id', id);
      if (error) throw error;
    } catch (err) { console.error('Error updating price update request in Supabase:', err); }
  };

  const updateUserPermissions = async (userId: string, permissions: string[]) => {
    try {
      const { error } = await supabase.from('users').update({ permissions }).eq('id', userId);
      if (error) throw error;
    } catch (err) { console.error('Error updating user permissions in Supabase:', err); }
  };

  const updateLegalPage = async (id: string, data: Partial<LegalPage>) => {
    try {
      await api.updateLegalPage(id, data);
    } catch (err) { console.error('Error updating legal page in Supabase:', err); }
  };

  const updateHomeSection = async (id: string, data: Partial<HomeSection>) => {
    try {
      const { error } = await supabase.from('home_sections').update(data).eq('id', id);
      if (error) throw error;
    } catch (err) { console.error('Error updating home section in Supabase:', err); }
  };

  const addHomeSection = async (section: Omit<HomeSection, 'id'>) => {
    try {
      const { error } = await supabase.from('home_sections').insert(section);
      if (error) throw error;
    } catch (err) { console.error('Error adding home section in Supabase:', err); }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
    } catch (err) { console.error('Error marking notification as read in Supabase:', err); }
  };

  const updateDeliveryAgent = async (id: string, data: Partial<DeliveryAgent>) => {
    try {
      await api.updateDeliveryAgent(id, data);
    } catch (err) { console.error('Error updating delivery agent in Supabase:', err); }
  };

  const addDeliveryAgent = async (agent: Omit<DeliveryAgent, 'id'>) => {
    try {
      await api.createDeliveryAgent(agent);
    } catch (err) { console.error('Error adding delivery agent to Supabase:', err); }
  };

  const deleteDeliveryAgent = async (id: string) => {
    try {
      await api.deleteDeliveryAgent(id);
    } catch (err) { console.error('Error deleting delivery agent from Supabase:', err); }
  };

  const createOrderWithInvoice = async (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'paymentStatus'>) => {
    try {
      const orderId = `DS-${Math.floor(100000 + Math.random() * 900000)}`;
      const timestamp = new Date().toISOString();

      const dueDateObj = new Date();
      dueDateObj.setDate(dueDateObj.getDate() + 3);
      const dueDate = dueDateObj.toISOString();

      const newOrder: Order = {
        ...orderData,
        id: orderId,
        status: 'pending',
        paymentStatus: orderData.paymentMethod === 'cod' ? 'pending' : 'paid',
        createdAt: timestamp,
        dueDate: dueDate,
      };

      // 1. Save Order to Supabase
      const { error: orderError } = await supabase.from('orders').insert(newOrder);
      if (orderError) throw orderError;

      // 2. Create Automated Invoice (ZATCA Compliant)
      const invoiceId = `INV-${orderId.split('-')[1]}`;
      const vatNumber = "310123456700003"; // Mock VAT Number
      const taxAmount = (orderData.subtotal - (orderData.discountAmount || 0) + (orderData.shippingFee || 0)) * 0.15;

      // ZATCA QR Code (Simplified TLV Encoding Placeholder)
      const sellerName = "Delta Stars Trading Co.";
      const qrData = JSON.stringify({
        seller: sellerName,
        vat: vatNumber,
        timestamp: timestamp,
        total: orderData.total,
        tax: taxAmount.toFixed(2)
      });
      const qrCode = btoa(unescape(encodeURIComponent(qrData)));

      const invoiceDueDate = new Date();
      invoiceDueDate.setDate(invoiceDueDate.getDate() + 30); // 30 days credit for VIP

      const newInvoice: Invoice = {
        id: invoiceId,
        orderId: orderId,
        clientId: orderData.customerId,
        customerName: orderData.customerName,
        date: timestamp,
        dueDate: user?.role === 'vip' ? invoiceDueDate.toISOString() : undefined,
        items: orderData.items.map(item => ({
          productId: item.id,
          name_ar: item.name_ar,
          name_en: item.name_en,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: orderData.subtotal,
        shipping: orderData.shippingFee || 0,
        tax: taxAmount,
        total: orderData.total,
        status: newOrder.paymentStatus === 'paid' ? 'Paid' : 'Unpaid',
        status_ar: newOrder.paymentStatus === 'paid' ? 'مدفوع' : 'غير مدفوع',
        type: 'Sales' as const,
        branchId: orderData.branchId,
        sellerVatNumber: vatNumber,
        qrCode: qrCode,
        invoiceType: 'Simplified'
      };
      await api.createInvoice(newInvoice);

      // 3. Handle Wholesale Debt if applicable
      if (user?.role === 'vip') {
        const currentDebt = user.debt_balance || 0;
        const newBalance = currentDebt + (orderData.paymentMethod === 'bank_transfer' ? orderData.total : 0);

        if (orderData.paymentMethod === 'bank_transfer') {
          await supabase.from('users').update({ debt_balance: newBalance }).eq('id', user.id);

          // Add transaction record for wholesale client
          await supabase.from('vip_transactions').insert({
            clientId: user.id,
            date: timestamp,
            description_ar: `فاتورة مبيعات رقم ${invoiceId} (آجل)`,
            description_en: `Sales Invoice #${invoiceId} (Credit)`,
            debit: orderData.total,
            credit: 0,
            balance: newBalance
          });
        }
      }

      // 4. Trigger Onyx Pro Sync (Background)
      try {
        const syncResult = await onyxService.syncOrder(newOrder);
        if (syncResult.success) {
          await supabase.from('orders').update({
            onyx_sync_status: 'synced',
            onyx_invoice_id: syncResult.onyxInvoiceId
          }).eq('id', orderId);

          // Also sync invoice
          await onyxService.syncInvoice(newInvoice);
        }
      } catch (e) {
        console.warn('Onyx sync failed, will retry later', e);
      }

      // 5. Create Admin Notification with Sound Trigger Flag
      const assignedBranch = branches.find(b => b.id === orderData.branchId.toString()) || branches[0];

      // Auto-assign closest driver (Mock logic: pick nearest online driver)
      const availableDrivers = deliveryAgents.filter(a => a.status === 'online');
      let assignedDriverId = '';
      if (availableDrivers.length > 0) {
        assignedDriverId = availableDrivers[0].id; // In production, use lat/lng proximity
        await supabase.from('orders').update({ driverId: assignedDriverId, status: 'preparing' }).eq('id', orderId);
      }

      await supabase.from('notifications').insert({
        title_ar: 'طلب جديد مستلم وموجه',
        title_en: 'New Order Routed',
        message_ar: `طلب ${orderId} من ${orderData.customerName} موجه لفرع ${assignedBranch?.name_ar || 'الرئيسي'}. تم إبلاغ المناديب.`,
        message_en: `Order ${orderId} routed to ${assignedBranch?.name_en || 'Main'} branch. Agents notified.`,
        created_at: timestamp,
        is_read: false,
        type: 'order',
        user_id: 'admin',
        metadata: {
          sound: 'alert_new_order',
          branchId: orderData.branchId,
          driverId: assignedDriverId
        }
      });

      // Notify Driver specifically
      if (assignedDriverId) {
        await supabase.from('notifications').insert({
          title_ar: 'طلب شحن جديد بانتظارك',
          title_en: 'New Shipment Awaiting You',
          message_ar: `طلب رقم ${orderId} جاهز للاستلام من فرع ${assignedBranch?.name_ar}. يرجى التوجه للمخزن.`,
          message_en: `Order #${orderId} is ready for pickup from ${assignedBranch?.name_en}. Proceed to warehouse.`,
          created_at: timestamp,
          is_read: false,
          type: 'order',
          user_id: assignedDriverId
        });
      }

      // 6. Send SMS/WhatsApp Confirmation to Customer
      if (orderData.customerPhone) {
        const estDelivery = language === 'ar' ? 'خلال 6-12 ساعة' : 'within 6-12 hours';
        await smsService.sendOrderStatusUpdate(orderData.customerPhone, orderId, 'received', {
          total: orderData.total,
          itemsCount: orderData.items.length,
          estimatedDelivery: estDelivery
        });

        // WhatsApp Business API Placeholder
        await smsService.sendWhatsAppNotification(orderData.customerPhone,
          language === 'ar'
            ? `*نجوم دلتا للتجارة*\nتم استلام طلبكم بنجاح!\nرقم الطلب: ${orderId}\nالإجمالي: ${orderData.total} ر.س\nالتوصيل المتوقع: ${estDelivery}\nشكراً لثقتكم بنا.`
            : `*Delta Stars Trading*\nYour order has been received successfully!\nOrder ID: ${orderId}\nTotal: ${orderData.total} SAR\nEst. Delivery: ${estDelivery}\nThank you for choosing us.`
        );
      }

      return orderId;
    } catch (err) {
      console.error('Error creating order with invoice in Supabase:', err);
      throw err;
    }
  };

  const syncProductsToFirestore = async () => {
    try {
      for (const p of products) {
        await setDoc(doc(db, 'products', p.id.toString()), p);
      }
      console.log('✅ Products synced to Firestore');
    } catch (err) {
      console.error('Error syncing products:', err);
    }
  };

  const addCategory = async (category: Omit<CategoryConfig, 'id'>) => {
    try {
      await supabase.from('categories').insert(category);
    } catch (err) { console.error('Error adding category:', err); }
  };

  const deleteCategory = async (id: string) => {
    try {
      await supabase.from('categories').delete().eq('id', id);
    } catch (err) { console.error('Error deleting category:', err); }
  };

  const addUnit = async (unit: Omit<ProductUnit, 'id'>) => {
    try {
      await supabase.from('units').insert(unit);
    } catch (err) { console.error('Error adding unit:', err); }
  };

  const deleteUnit = async (id: string) => {
    try {
      await supabase.from('units').delete().eq('id', id);
    } catch (err) { console.error('Error deleting unit:', err); }
  };

  const getLegalPages = async () => {
    return legalPages;
  };

  const seedLegalPages = async () => {
    setIsSeeding(true);
    try {
      for (const page of DEFAULT_LEGAL_PAGES) {
        // Use a more robust check to avoid overwriting unless needed
        const { data: existing } = await supabase.from('legal_pages').select('id').eq('id', page.id).single();
        if (!existing) {
          await supabase.from('legal_pages').insert({
            id: page.id,
            title_ar: page.title_ar,
            title_en: page.title_en,
            content_ar: page.content_ar,
            content_en: page.content_en,
            updatedAt: new Date().toISOString()
          });
        }
      }
      // Fetch latest after seeding
      const { data: freshLegal } = await supabase.from('legal_pages').select('*');
      if (freshLegal && freshLegal.length > 0) {
        setLegalPages(freshLegal as LegalPage[]);
      } else {
        setLegalPages(DEFAULT_LEGAL_PAGES);
      }
      console.log('✅ Legal pages seeded successfully');
    } catch (err) {
      console.error('Error seeding legal pages:', err);
      // Fallback to local state if Supabase fails
      setLegalPages(DEFAULT_LEGAL_PAGES);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <FirebaseContext.Provider value={{
      user, firebaseUser, products, showroomItems, categories, units, homeSections, orders, branches, coupons, ads, legalPages, priceUpdateRequests, notifications, deliveryAgents, invoices, unreadCount, loading, error, db, users, promotions,
      addProduct, updateProduct, deleteProduct, addShowroomItem, updateShowroomItem, deleteShowroomItem, updateOrder, deleteOrder,
      addCoupon, updateCoupon, deleteCoupon, addAd, updateAd, deleteAd, addBranch, updateBranch, deleteBranch, addPriceUpdateRequest, updatePriceUpdateRequest, updateUserPermissions, updateLegalPage, updateHomeSection, addHomeSection, markNotificationAsRead,
      updateDeliveryAgent, addDeliveryAgent, deleteDeliveryAgent, createOrderWithInvoice, seedLegalPages,
      syncProductsToFirestore, addCategory, deleteCategory, addUnit, deleteUnit, getLegalPages
    }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
