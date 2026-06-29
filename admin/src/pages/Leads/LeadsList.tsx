import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getLeads, deleteLead } from '../../api/axios';
import { Plus, Search, Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SOURCES = ['website', 'manual', 'facebook', 'instagram', 'google', 'walkin', 'referral'];
const STATUSES = ['new', 'contacted', 'follow-up', 'qualified', 'lost', 'closed'];

export default function LeadsList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['leads', search, status, source, page],
    queryFn: () => getLeads({ search: search || undefined, status: status || undefined, source: source || undefined, page, limit: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLead,
    onSuccess: () => { toast.success('Lead deleted'); qc.invalidateQueries({ queryKey: ['leads'] }); },
    onError: () => toast.error('Delete failed'),
  });

  const leads = data?.data || [];
  const total = data?.total || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold">Leads</h1>
          <p className="text-sm text-gray-500">{total} total leads</p>
        </div>
        <Link to="/leads/new" className="btn-primary flex items-center gap-2"><Plus size={16} />Add Lead</Link>
      </div>

      <div className="card p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" placeholder="Search by name, mobile, email..." />
        </div>
        <select value={source} onChange={e => setSource(e.target.value)} className="input w-auto">
          <option value="">All Sources</option>
          {SOURCES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} className="input w-auto">
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="table-th">Lead</th>
              <th className="table-th">Mobile</th>
              <th className="table-th">Source</th>
              <th className="table-th">Property</th>
              <th className="table-th">Assigned To</th>
              <th className="table-th">Status</th>
              <th className="table-th">Date</th>
              <th className="table-th">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={8}><div className="h-10 m-2 animate-pulse bg-gray-100 rounded" /></td></tr>
              )) : leads.length === 0 ? (
                <tr><td colSpan={8} className="table-td text-center py-12 text-gray-400">No leads found</td></tr>
              ) : leads.map((l: any) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="table-td">
                    <div className="font-medium">{l.name}</div>
                    {l.email && <div className="text-xs text-gray-400">{l.email}</div>}
                  </td>
                  <td className="table-td">{l.mobile}</td>
                  <td className="table-td"><span className="badge-blue">{l.source}</span></td>
                  <td className="table-td text-xs">{l.property_title || l.project_name || '—'}</td>
                  <td className="table-td text-xs">{l.assigned_name || '—'}</td>
                  <td className="table-td">
                    <span className={`badge ${l.status === 'new' ? 'badge-blue' : l.status === 'closed' ? 'badge-green' : l.status === 'lost' ? 'badge-red' : 'badge-yellow'}`}>{l.status}</span>
                  </td>
                  <td className="table-td text-gray-400 text-xs">{new Date(l.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="table-td">
                    <div className="flex gap-2">
                      <Link to={`/leads/${l.id}`} className="p-1.5 text-primary hover:bg-primary/10 rounded"><Eye size={15} /></Link>
                      <button onClick={() => { if (confirm('Delete lead?')) deleteMutation.mutate(l.id); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {Math.ceil(total / 20) > 1 && (
          <div className="p-4 border-t flex items-center gap-2 justify-end">
            {Array.from({ length: Math.ceil(total / 20) }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)} className={`w-8 h-8 rounded border text-sm ${n === page ? 'bg-primary text-white' : 'hover:bg-gray-50'}`}>{n}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
