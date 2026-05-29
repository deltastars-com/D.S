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

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('support_tickets').update({ status }).eq('id', id);
    fetchTickets();
  };

  useEffect(() => {
    fetchTickets();
    const channel = supabase
      .channel('admin-tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => fetchTickets())
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-black mb-6 text-right">لوحة تحكم الدعم</h1>
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="min-w-full text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">العميل</th>
              <th>الموضوع</th>
              <th>الحالة</th>
              <th>التاريخ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket.id} className="border-b">
                <td className="p-4">
                  {ticket.user_name}<br />
                  <span className="text-xs text-gray-500">{ticket.email}</span>
                </td>
                <td>{ticket.subject}</td>
                <td>
                  <select
                    value={ticket.status}
                    onChange={(e) => updateStatus(ticket.id, e.target.value)}
                    className="border rounded p-1 text-sm"
                  >
                    <option value="open">مفتوحة</option>
                    <option value="in-progress">قيد المعالجة</option>
                    <option value="closed">مغلقة</option>
                  </select>
                </td>
                <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                <td>
                  <Link to={`/admin/ticket/${ticket.id}`} className="text-blue-600 underline">عرض</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
