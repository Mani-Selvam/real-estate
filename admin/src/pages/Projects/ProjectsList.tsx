import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getAdminProjects, deleteProject } from '../../api/axios';
import { Plus, Edit, Trash2, Search, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

function formatPrice(p: number) {
  if (!p) return '—';
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(2)} L`;
  return `₹${p.toLocaleString()}`;
}

export default function ProjectsList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const LIMIT = 20;
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-projects', search, status, page],
    queryFn: () => getAdminProjects({ search: search || undefined, status: status || undefined, page, limit: LIMIT }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => { toast.success('Project deleted'); qc.invalidateQueries({ queryKey: ['admin-projects'] }); },
    onError: () => toast.error('Delete failed'),
  });

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Delete project "${name}"? This cannot be undone.`)) deleteMutation.mutate(id);
  };

  const projects = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Projects</h1>
          <p className="text-sm text-gray-500">{total} total projects</p>
        </div>
        <Link to="/projects/new" className="btn-primary flex items-center gap-2"><Plus size={16} />New Project</Link>
      </div>

      <div className="card p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="input pl-9" placeholder="Search projects..." />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input w-auto">
          <option value="">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="table-th">Project</th>
              <th className="table-th">Code</th>
              <th className="table-th">Status</th>
              <th className="table-th">Price</th>
              <th className="table-th">Units</th>
              <th className="table-th">Published</th>
              <th className="table-th">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="table-td"><div className="h-8 animate-pulse bg-gray-100 rounded" /></td></tr>
              )) : projects.length === 0 ? (
                <tr><td colSpan={7} className="table-td text-center py-12 text-gray-400">No projects found. <Link to="/projects/new" className="text-primary hover:underline">Create one</Link></td></tr>
              ) : projects.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="table-td">
                    <div className="font-medium text-gray-800">{p.name}</div>
                    {p.location && <div className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10} />{p.location}</div>}
                  </td>
                  <td className="table-td text-gray-500">{p.code || '—'}</td>
                  <td className="table-td">
                    <span className={`badge ${p.status === 'completed' ? 'badge-green' : p.status === 'ongoing' ? 'badge-blue' : 'badge-yellow'}`}>{p.status}</span>
                  </td>
                  <td className="table-td">{formatPrice(p.price_starting_from)}</td>
                  <td className="table-td">{p.property_count}</td>
                  <td className="table-td">
                    <span className={`badge ${p.is_published ? 'badge-green' : 'badge-gray'}`}>{p.is_published ? 'Live' : 'Draft'}</span>
                  </td>
                  <td className="table-td">
                    <div className="flex gap-2">
                      <Link to={`/projects/${p.id}/edit`} className="p-1.5 text-primary hover:bg-primary/10 rounded"><Edit size={15} /></Link>
                      <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
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
