import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';

interface Ticket {
  id: string;
  user_name: string;
  email: string;
  subject: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setTickets(data);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">لوحة تحكم الدعم</h1>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">الاسم</th>
            <th className="border p-2">البريد</th>
            <th className="border p-2">الموضوع</th>
            <th className="border p-2">الحالة</th>
            <th className="border p-2">التاريخ</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td className="border p-2">{ticket.id}</td>
              <td className="border p-2">{ticket.user_name}</td>
              <td className="border p-2">{ticket.email}</td>
              <td className="border p-2">{ticket.subject}</td>
              <td className="border p-2">{ticket.status}</td>
              <td className="border p-2">{new Date(ticket.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
