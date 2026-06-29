import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getProjects } from '../api/axios';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { SkeletonList } from '../components/Skeleton';

function formatPrice(p: number) {
  if (!p) return '';
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(2)} L`;
  return `₹${p.toLocaleString()}`;
}

export default function Projects() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['projects', status, page], queryFn: () => getProjects({ status: status || undefined, page, limit: 9 }) });
  const projects = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 9);

  return (
    <div className="py-10">
      <div className="container mx-auto px-4">
        <h1 className="section-title mb-2">Our Projects</h1>
        <p className="text-gray-600 mb-6">Explore our ongoing, upcoming and completed developments</p>

        <div className="flex gap-3 mb-6 flex-wrap">
          {['', 'upcoming', 'ongoing', 'completed'].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${status === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>

        {isLoading ? <SkeletonList count={3} /> : projects.length === 0 ? (
          <p className="text-center text-gray-500 py-16">No projects found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p: any) => (
              <Link key={p.id} to={`/projects/${p.id}`} className="card hover:shadow-lg transition-shadow group">
                <div className="h-52 bg-gray-200 overflow-hidden">
                  {p.gallery_images?.[0]
                    ? <img src={p.gallery_images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-5xl font-bold">{p.name[0]}</div>}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.status === 'completed' ? 'bg-green-100 text-green-700' : p.status === 'ongoing' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {p.status?.charAt(0).toUpperCase() + p.status?.slice(1)}
                    </span>
                    {p.property_count > 0 && <span className="text-xs text-gray-500">{p.property_count} units</span>}
                  </div>
                  <h3 className="font-bold text-lg text-primary mb-1">{p.name}</h3>
                  {p.location && <p className="text-sm text-gray-500 flex items-center gap-1 mb-2"><MapPin size={12} />{p.location}</p>}
                  {p.price_starting_from && <p className="text-accent font-bold">From {formatPrice(p.price_starting_from)}</p>}
                  {p.possession_date && <p className="text-xs text-gray-400 mt-1">Possession: {new Date(p.possession_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded border disabled:opacity-50 hover:bg-gray-50"><ChevronLeft size={16} /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)} className={`w-8 h-8 rounded border text-sm ${n === page ? 'bg-primary text-white border-primary' : 'hover:bg-gray-50'}`}>{n}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded border disabled:opacity-50 hover:bg-gray-50"><ChevronRight size={16} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
