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
  const [newReply, setNewReply] = useState('');

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

  const sendReply = async () => {
    if (!newReply.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('ticket_replies').insert({
      ticket_id: id,
      sender_id: user?.id,
      sender_name: user?.user_metadata?.name || 'المشرف',
      text: newReply,
      is_admin: true,
      created_at: new Date().toISOString()
    });
    setNewReply('');
    // إعادة تحميل الردود
    const { data } = await supabase.from('ticket_replies').select('*').eq('ticket_id', id).order('created_at', { ascending: true });
    if (data) setReplies(data);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-black mb-6">تفاصيل التذكرة</h1>
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        {replies.map(reply => (
          <div key={reply.id} className={`mb-4 p-4 rounded-xl ${reply.is_admin ? 'bg-blue-50 text-right' : 'bg-gray-100'}`}>
            <div className="flex justify-between">
              <span className="font-bold">{reply.sender_name}</span>
              <span className="text-xs text-gray-500">{new Date(reply.created_at).toLocaleString()}</span>
            </div>
            <p className="mt-2">{reply.text}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-4">
        <textarea
          value={newReply}
          onChange={e => setNewReply(e.target.value)}
          rows={3}
          className="flex-1 border rounded-2xl p-4"
          placeholder="اكتب ردك هنا..."
        />
        <button
          onClick={sendReply}
          className="bg-primary text-white px-6 py-2 rounded-2xl"
        >
          إرسال
        </button>
      </div>
    </div>
  );
}
