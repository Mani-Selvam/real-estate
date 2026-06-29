import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getAdminProperties, deleteProperty } from '../../api/axios';
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

function formatPrice(p: number) {
  if (!p) return '—';
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(2)} L`;
  return `₹${p.toLocaleString()}`;
}

export default function PropertiesList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const LIMIT = 20;
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-properties', search, status, category, page],
    queryFn: () => getAdminProperties({ search: search || undefined, status: status || undefined, category: category || undefined, page, limit: LIMIT }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => { toast.success('Property deleted'); qc.invalidateQueries({ queryKey: ['admin-properties'] }); },
    onError: () => toast.error('Delete failed'),
  });

  const properties = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold">Properties</h1>
          <p className="text-sm text-gray-500">{total} total properties</p>
        </div>
        <Link to="/properties/new" className="btn-primary flex items-center gap-2"><Plus size={16} />New Property</Link>
      </div>

      <div className="card p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="input pl-9" placeholder="Search properties..." />
        </div>
        <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className="input w-auto">
          <option value="">All Types</option>
          {['Apartment', 'Villa', 'Plot', 'Commercial', 'Independent House'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input w-auto">
          <option value="">All Status</option>
          {['available', 'reserved', 'booked', 'sold'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="table-th">Title</th>
              <th className="table-th">Code</th>
              <th className="table-th">Category</th>
              <th className="table-th">Price</th>
              <th className="table-th">Beds/Baths</th>
              <th className="table-th">Status</th>
              <th className="table-th">Published</th>
              <th className="table-th">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={8}><div className="h-10 m-2 animate-pulse bg-gray-100 rounded" /></td></tr>
              )) : properties.length === 0 ? (
                <tr><td colSpan={8} className="table-td text-center py-12 text-gray-400">No properties found. <Link to="/properties/new" className="text-primary hover:underline">Create one</Link></td></tr>
              ) : properties.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="table-td font-medium">
                    <div>{p.title}</div>
                    {p.project_name && <div className="text-xs text-gray-400">{p.project_name}</div>}
                  </td>
                  <td className="table-td text-gray-500">{p.code || '—'}</td>
                  <td className="table-td"><span className="badge badge-blue">{p.category}</span></td>
                  <td className="table-td font-medium text-primary">{formatPrice(p.price)}</td>
                  <td className="table-td">{p.bedrooms ? `${p.bedrooms}B / ${p.bathrooms}Ba` : '—'}</td>
                  <td className="table-td">
                    <span className={`badge ${p.status === 'available' ? 'badge-green' : p.status === 'booked' ? 'badge-yellow' : p.status === 'sold' ? 'badge-red' : 'badge-gray'}`}>{p.status}</span>
                  </td>
                  <td className="table-td"><span className={`badge ${p.is_published ? 'badge-green' : 'badge-gray'}`}>{p.is_published ? 'Live' : 'Draft'}</span></td>
                  <td className="table-td">
                    <div className="flex gap-2">
                      <Link to={`/properties/${p.id}/edit`} className="p-1.5 text-primary hover:bg-primary/10 rounded"><Edit size={15} /></Link>
                      <button onClick={() => { if (confirm(`Delete "${p.title}"?`)) deleteMutation.mutate(p.id); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <span className="text-sm text-gray-500">Page {page} of {totalPages} ({total} total)</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded border disabled:opacity-40 hover:bg-white"><ChevronLeft size={16} /></button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const pg = start + i;
                return pg <= totalPages ? (
                  <button key={pg} onClick={() => setPage(pg)} className={`w-8 h-8 text-sm rounded ${pg === page ? 'bg-primary text-white' : 'border hover:bg-white'}`}>{pg}</button>
                ) : null;
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded border disabled:opacity-40 hover:bg-white"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
