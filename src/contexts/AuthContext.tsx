import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, onAuthStateChanged } from '../firebase';
import api from '@/services/api';
import { User } from '../types';
import { webAuthn } from '../lib/webAuthn';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithOtp: (phone: string) => Promise<void>;
  verifyOtpAndLogin: (phone: string, code: string) => Promise<{ isNewUser: boolean }>;
  setPassword: (password: string) => Promise<void>;
  loginWithPassword: (phone: string, password: string) => Promise<void>;
  loginWithBiometrics: () => Promise<void>;
  registerBiometrics: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginToAdminDashboard: (username: string, password: string) => Promise<{ success: boolean; needsPasswordChange?: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  changeAdminPassword: (newPassword: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  isRole: (roles: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'delta_stars_user';
const SESSION_KEY = 'delta_stars_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEY);
        const sessionId = sessionStorage.getItem(SESSION_KEY);
        
        if (storedUser && sessionId) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log('✅ Session restored for:', parsedUser.phone || parsedUser.email);
        }
      } catch (error) {
        console.error('Failed to load session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSession();

    // Sync with Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // If we have a firebase user but no context user, or they differ
        // We should fetch the profile
        try {
          const PRIMARY_EMAIL = 'deltastars777@gmail.com';
          const ADMIN_EMAIL = 'marketing@deltastars-ksa.com';
          const DEV_EMAIL = 'deltastars@zoho.mail.com';

          // Check if it's a special admin email
          if (fbUser.email === PRIMARY_EMAIL || fbUser.email === ADMIN_EMAIL) {
             const adminUser: User = {
               id: 'admin_sovereign',
               uid: fbUser.uid,
               email: fbUser.email,
               name: 'المدير العام',
               full_name: 'المدير العام',
               type: 'admin',
               role: 'admin',
               permissions: ['manage_products', 'manage_users', 'manage_orders', 'manage_accounting', 'manage_quality', 'manage_ads', 'manage_coupons', 'manage_branches', 'manage_prices', 'manage_developer', 'manage_shipments'],
               clientStatus: 'active'
             } as any;
             setUser(adminUser);
             localStorage.setItem(STORAGE_KEY, JSON.stringify(adminUser));
             sessionStorage.setItem(SESSION_KEY, Date.now().toString());
          } else if (fbUser.email === DEV_EMAIL || fbUser.email === 'vipservicesyemen@outlook.sa') {
             const devUser: User = {
               id: 'dev_root',
               uid: fbUser.uid,
               email: fbUser.email,
               name: 'المطور التقني',
               full_name: 'المطور التقني',
               type: 'developer',
               role: 'developer',
               permissions: ['manage_developer', 'manage_products', 'manage_users', 'manage_orders', 'manage_accounting', 'manage_quality', 'manage_ads', 'manage_coupons', 'manage_branches', 'manage_prices', 'root_access'],
               clientStatus: 'active'
             } as any;
             setUser(devUser);
             localStorage.setItem(STORAGE_KEY, JSON.stringify(devUser));
             sessionStorage.setItem(SESSION_KEY, Date.now().toString());
          }
        } catch (err) {
          console.error('Error syncing firebase user:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithOtp = useCallback(async (phone: string) => {
    await authService.sendOTP(phone);
  }, []);

  const verifyOtpAndLogin = useCallback(async (phone: string, code: string) => {
    setIsLoading(true);
    try {
      const data = await authService.verifyOTPAndSignIn(phone, code);
      if (!data?.user) throw new Error('Verification failed');

      // Map Supabase user to App user type
      const verifiedUser: User = {
        id: data.user.id,
        uid: data.user.id,
        phone: data.user.phone || phone,
        name: data.user.user_metadata?.full_name || 'VIP User',
        role: data.user.user_metadata?.role || 'customer',
        permissions: data.user.user_metadata?.permissions || [],
        is_verified: data.user.user_metadata?.phone_verified || true
      } as any;

      setUser(verifiedUser);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(verifiedUser));
      sessionStorage.setItem(SESSION_KEY, Date.now().toString());
      
      console.log('✅ User logged in with Supabase OTP:', verifiedUser.phone);
      return { isNewUser: !verifiedUser.is_verified };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setPassword = useCallback(async (password: string) => {
    if (!user) throw new Error('No user logged in');
    
    setIsLoading(true);
    try {
      await api.updateUser(user.id, { is_verified: true });
      const updatedUser = { ...user, is_verified: true };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      localStorage.setItem(`pwd_${user.phone}`, password); // Mock password storage
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const loginWithPassword = useCallback(async (phone: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock password check
      const storedPwd = localStorage.getItem(`pwd_${phone}`);
      if (storedPwd !== password) throw new Error('Invalid password');
      
      // Fetch user data
      const { user: verifiedUser } = await api.checkPhoneVerification(phone);
      if (!verifiedUser) throw new Error('User not found');
      
      setUser(verifiedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(verifiedUser));
      localStorage.setItem('last_vip_user', JSON.stringify(verifiedUser));
      sessionStorage.setItem(SESSION_KEY, Date.now().toString());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithBiometrics = useCallback(async () => {
    setIsLoading(true);
    try {
      const lastUser = localStorage.getItem('last_vip_user');
      if (!lastUser) throw new Error('No previous VIP session found');
      
      const parsed = JSON.parse(lastUser);
      const success = await webAuthn.authenticate(parsed.id);
      
      if (success) {
        setUser(parsed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        sessionStorage.setItem(SESSION_KEY, Date.now().toString());
      } else {
        throw new Error('Biometric authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerBiometrics = useCallback(async () => {
    if (!user) throw new Error('No user logged in');
    
    setIsLoading(true);
    try {
      const key = await webAuthn.register(user.id, user.name || user.phone || 'VIP User');
      await api.updateUser(user.id, { biometric_key: key });
      
      const updatedUser = { ...user, biometric_key: key };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      localStorage.setItem('last_vip_user', JSON.stringify(updatedUser));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: verifiedUser } = await api.loginWithEmail(email, password);
      setUser(verifiedUser);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(verifiedUser));
      sessionStorage.setItem(SESSION_KEY, Date.now().toString());
      
      console.log('✅ User logged in with email:', verifiedUser.email);
    } catch (error) {
      console.error('Email login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginToAdminDashboard = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: verifiedUser } = await api.loginToAdminDashboard(username, password);
      setUser(verifiedUser);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(verifiedUser));
      sessionStorage.setItem(SESSION_KEY, Date.now().toString());
      
      return { success: true, needsPasswordChange: verifiedUser.force_password_change };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    return await api.requestPasswordReset(email);
  }, []);

  const changeAdminPassword = useCallback(async (newPassword: string) => {
    if (!user) throw new Error('No user logged in');
    await api.changeAdminPassword(user.id, newPassword);
    const updatedUser = { ...user, force_password_change: false };
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    console.log('👋 User logged out');
  }, []);

  const updateUser = useCallback(async (data: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    
    // In a real app, we'd call an API to update the user in DB
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
  }, [user]);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions?.includes(permission) || false;
  }, [user]);

  const isRole = useCallback((roles: string | string[]): boolean => {
    if (!user) return false;
    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(user.role);
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    loginWithOtp,
    verifyOtpAndLogin,
    setPassword,
    loginWithPassword,
    loginWithBiometrics,
    registerBiometrics,
    loginWithEmail,
    loginToAdminDashboard,
    requestPasswordReset,
    changeAdminPassword,
    logout,
    updateUser,
    hasPermission,
    isRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
