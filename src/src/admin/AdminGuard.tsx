import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Navigate } from 'react-router-dom';

export default function AdminGuard({ children }: { children: JSX.Element }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const role = user.user_metadata?.role || user.app_metadata?.role;
      setIsAdmin(role === 'admin');
    };
    checkAdmin();
  }, []);

  if (isAdmin === null) return <div className="p-8 text-center">جاري التحقق...</div>;
  return isAdmin ? children : <Navigate to="/" />;
}
