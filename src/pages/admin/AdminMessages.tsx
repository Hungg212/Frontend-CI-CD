import { useEffect, useState } from 'react';
import { Mail, Phone, Trash2, MessageSquare, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  content: string;
  status: 'UNREAD' | 'READ' | 'REPLIED' | 'ARCHIVED';
  createdAt: string;
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  UNREAD: { label: 'Chưa đọc', cls: 'bg-amber-100 text-amber-700' },
  READ: { label: 'Đã đọc', cls: 'bg-blue-100 text-blue-700' },
  REPLIED: { label: 'Đã trả lời', cls: 'bg-green-100 text-green-700' },
  ARCHIVED: { label: 'Đã lưu trữ', cls: 'bg-stone-100 text-stone-600' },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

export default function AdminMessages() {
  const token = useAuthStore((s) => s.token) || '';
  const notify = useNotificationStore();
  const [items, setItems] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/messages', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Tải tin nhắn thất bại');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.messages || []);
    } catch (e: unknown) {
      notify.error('Lỗi', e instanceof Error ? e.message : 'Không thể tải tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStatus = async (id: string, status: Message['status']) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Cập nhật thất bại');
      setItems((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    } catch (e: unknown) {
      notify.error('Lỗi', e instanceof Error ? e.message : 'Cập nhật thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa tin nhắn này?')) return;
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Xóa thất bại');
      notify.success('Thành công', 'Đã xóa tin nhắn');
      load();
    } catch (e: unknown) {
      notify.error('Lỗi', e instanceof Error ? e.message : 'Không thể xóa');
    }
  };

  const filtered =
    filter === 'ALL' ? items : items.filter((m) => m.status === filter);
  const unread = items.filter((m) => m.status === 'UNREAD').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Tin nhắn</h1>
        <p className="text-sm text-stone-500">
          {items.length} tin nhắn
          {unread > 0 && <span className="ml-1 text-amber-600">({unread} chưa đọc)</span>}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          ['ALL', 'Tất cả'],
          ['UNREAD', 'Chưa đọc'],
          ['READ', 'Đã đọc'],
          ['REPLIED', 'Đã trả lời'],
          ['ARCHIVED', 'Lưu trữ'],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              filter === k
                ? 'bg-coffee-700 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-12 text-center text-stone-500">Đang tải tin nhắn...</p>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-stone-300" />
          <p className="mt-3 text-sm text-stone-500">Chưa có tin nhắn nào.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => {
            const st = STATUS_LABELS[m.status] || STATUS_LABELS.READ;
            return (
              <article
                key={m.id}
                className={`rounded-xl border bg-white p-5 shadow-sm ${
                  m.status === 'UNREAD' ? 'border-amber-300' : 'border-stone-200'
                }`}
              >
                <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{m.name}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.cls}`}
                      >
                        {st.label}
                      </span>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {m.email}
                      </span>
                      {m.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {m.phone}
                        </span>
                      )}
                      <span>{formatDate(m.createdAt)}</span>
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {m.status !== 'READ' && m.status !== 'REPLIED' && (
                      <button
                        onClick={() => setStatus(m.id, 'READ')}
                        title="Đánh dấu đã đọc"
                        aria-label="Đánh dấu đã đọc"
                        className="rounded-full p-1.5 text-stone-500 transition hover:bg-stone-100"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(m.id)}
                      title="Xóa"
                      aria-label="Xóa tin nhắn"
                      className="rounded-full p-1.5 text-red-500 transition hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {m.subject && <p className="text-sm font-medium">{m.subject}</p>}
                <p className="mt-1 whitespace-pre-line text-sm text-stone-600">{m.content}</p>
                <div className="mt-3 flex gap-2">
                  <a
                    href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || 'Liên hệ')}`}
                    className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium transition hover:bg-stone-50"
                  >
                    Trả lời
                  </a>
                  {m.status !== 'REPLIED' && (
                    <button
                      onClick={() => setStatus(m.id, 'REPLIED')}
                      className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium transition hover:bg-stone-50"
                    >
                      Đánh dấu đã trả lời
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
