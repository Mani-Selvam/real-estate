import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNewsletter } from '../../api/axios';
import api from '../../api/axios';
import { Download, Trash2, Search } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Newsletter() {
  const [search, setSearch] = useState('');
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['newsletter'], queryFn: getNewsletter });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/newsletter/${id}`).then(r => r.data),
    onSuccess: () => { toast.success('Subscriber removed'); qc.invalidateQueries({ queryKey: ['newsletter'] }); },
    onError: () => toast.error('Failed to remove subscriber'),
  });

  const allSubscribers = data?.data || [];
  const subscribers = search
    ? allSubscribers.filter((s: any) => s.email.toLowerCase().includes(search.toLowerCase()))
    : allSubscribers;

  const exportCSV = () => {
    if (!subscribers.length) return;
    const content = `Email,Subscribed On\n${subscribers.map((s: any) => `${s.email},${new Date(s.created_at).toLocaleDateString()}`).join('\n')}`;
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'newsletter-subscribers.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold">Newsletter Subscribers</h1>
          <p className="text-sm text-gray-500">{allSubscribers.length} active subscribers</p>
        </div>
        <button onClick={exportCSV} disabled={!subscribers.length} className="btn-secondary flex items-center gap-2">
          <Download size={16} />Export CSV
        </button>
      </div>

      <div className="card p-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" placeholder="Search subscribers..." />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="table-th">#</th>
            <th className="table-th">Email</th>
            <th className="table-th">Subscribed On</th>
            <th className="table-th">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? <tr><td colSpan={4} className="text-center py-8">Loading...</td></tr>
              : subscribers.length === 0 ? <tr><td colSpan={4} className="text-center py-8 text-gray-400">No subscribers found</td></tr>
              : subscribers.map((s: any, i: number) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="table-td text-gray-400">{i + 1}</td>
                  <td className="table-td font-medium">{s.email}</td>
                  <td className="table-td text-gray-400">{new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="table-td">
                    <button onClick={() => { if (confirm(`Remove ${s.email}?`)) deleteMutation.mutate(s.id); }}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                      <Trash2 size={14} />
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
