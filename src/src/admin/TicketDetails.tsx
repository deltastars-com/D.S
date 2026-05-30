import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface Reply {
  id: string;
  text: string;
  sender_name: string;
  is_admin: boolean;
  created_at: string;
}

export default function TicketDetails() {
  const { id } = useParams<{ id: string }>();
  const [replies, setReplies] = useState<Reply[]>([]);

  useEffect(() => {
    if (!id) return;
    const fetchReplies = async () => {
      const { data, error } = await supabase
        .from('ticket_replies')
        .select('*')
        .eq('ticket_id', id)
        .order('created_at', { ascending: true });
      if (!error && data) setReplies(data);
    };
    fetchReplies();
  }, [id]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">تفاصيل التذكرة</h1>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">النص</th>
            <th className="border p-2">المرسل</th>
            <th className="border p-2">مشرف</th>
            <th className="border p-2">التاريخ</th>
          </tr>
        </thead>
        <tbody>
          {replies.map((reply) => (
            <tr key={reply.id}>
              <td className="border p-2">{reply.id}</td>
              <td className="border p-2">{reply.text}</td>
              <td className="border p-2">{reply.sender_name}</td>
              <td className="border p-2">{reply.is_admin ? 'نعم' : 'لا'}</td>
              <td className="border p-2">{new Date(reply.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
