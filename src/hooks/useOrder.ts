import { useState } from 'react';

export const useOrder = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshOrders = async () => {
    setLoading(true);
    setLoading(false);
  };

  return { orders, setOrders, loading, refreshOrders };
};
