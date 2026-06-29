import { useQuery } from '@tanstack/react-query';
import { getNewsletter } from '../../api/axios';
import { Download } from 'lucide-react';

export default function Newsletter() {
  const { data, isLoading } = useQuery({ queryKey: ['newsletter'], queryFn: getNewsletter });
  const subscribers = data?.data || [];

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
          <p className="text-sm text-gray-500">{subscribers.length} active subscribers</p>
        </div>
        <button onClick={exportCSV} disabled={!subscribers.length} className="btn-secondary flex items-center gap-2"><Download size={16} />Export CSV</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="table-th">#</th>
            <th className="table-th">Email</th>
            <th className="table-th">Subscribed On</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? <tr><td colSpan={3} className="text-center py-8">Loading...</td></tr>
              : subscribers.length === 0 ? <tr><td colSpan={3} className="text-center py-8 text-gray-400">No subscribers yet</td></tr>
              : subscribers.map((s: any, i: number) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="table-td text-gray-400">{i + 1}</td>
                  <td className="table-td font-medium">{s.email}</td>
                  <td className="table-td text-gray-400">{new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
