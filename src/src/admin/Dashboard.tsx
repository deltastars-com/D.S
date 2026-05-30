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

export default function AdminDashboard({ onNavigate }: { onNavigate: (page: string, params?: any) => void }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const fetchTickets = async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setTickets(data);
    };
    fetchTickets();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-black mb-6">لوحة تحكم الدعم</h1>
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="min-w-full text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">العميل</th>
              <th>البريد</th>
              <th>الموضوع</th>
              <th>الحالة</th>
              <th>التاريخ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-bold">{ticket.user_name}</td>
                <td>{ticket.email}</td>
                <td>{ticket.subject}</td>
                <td>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${ticket.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {ticket.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                  </span>
                </td>
                <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => onNavigate('admin_ticket', { id: ticket.id })}
                    className="text-primary underline"
                  >
                    عرض
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
