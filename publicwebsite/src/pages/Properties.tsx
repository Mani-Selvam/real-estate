import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getProperties } from '../api/axios';
import { MapPin, Bed, Bath, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { SkeletonList } from '../components/Skeleton';

function formatPrice(price: number) {
  if (!price) return 'Price on Request';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price?.toLocaleString()}`;
}

const CATEGORIES = ['Apartment', 'Villa', 'Plot', 'Commercial', 'Independent House'];

export default function Properties() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', category: '', bedrooms: '', min_price: '', max_price: '', status: 'available' });
  const [applied, setApplied] = useState(filters);

  const { data, isLoading } = useQuery({
    queryKey: ['properties', applied, page],
    queryFn: () => getProperties({ ...applied, page, limit: 12 }),
  });

  const properties = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 12);

  const applyFilters = () => { setApplied({ ...filters }); setPage(1); };
  const clearFilters = () => { const f = { search: '', category: '', bedrooms: '', min_price: '', max_price: '', status: 'available' }; setFilters(f); setApplied(f); setPage(1); };

  return (
    <div className="py-10">
      <div className="container mx-auto px-4">
        <h1 className="section-title mb-2">Properties</h1>
        <p className="text-gray-600 mb-6">Find your perfect property from our curated listings</p>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                className="input pl-9" placeholder="Search properties..." />
            </div>
            <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} className="input">
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filters.bedrooms} onChange={e => setFilters(f => ({ ...f, bedrooms: e.target.value }))} className="input">
              <option value="">Bedrooms</option>
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} BHK</option>)}
            </select>
            <input value={filters.min_price} onChange={e => setFilters(f => ({ ...f, min_price: e.target.value }))}
              type="number" className="input" placeholder="Min Price" />
            <input value={filters.max_price} onChange={e => setFilters(f => ({ ...f, max_price: e.target.value }))}
              type="number" className="input" placeholder="Max Price" />
            <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="input">
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>
          <div className="flex gap-3 mt-3">
            <button onClick={applyFilters} className="btn-primary py-2 flex items-center gap-2"><Filter size={14} />Apply Filters</button>
            <button onClick={clearFilters} className="border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50">Clear</button>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-4">{total} properties found</div>

        {isLoading ? <SkeletonList /> : properties.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-xl mb-2">No properties found</p>
            <button onClick={clearFilters} className="text-primary hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p: any) => (
              <Link key={p.id} to={`/properties/${p.id}`} className="card hover:shadow-lg transition-shadow group">
                <div className="h-48 bg-gray-200 overflow-hidden relative">
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-4xl">{p.title[0]}</div>}
                  <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">{p.category}</span>
                  <span className={`absolute top-2 right-2 text-white text-xs px-2 py-1 rounded ${p.status === 'available' ? 'bg-green-600' : 'bg-yellow-600'}`}>{p.status}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-primary mb-1 truncate">{p.title}</h3>
                  {p.project_location && <p className="text-sm text-gray-500 flex items-center gap-1 mb-2"><MapPin size={12} />{p.project_location}</p>}
                  <div className="flex gap-4 text-sm text-gray-600 mb-3">
                    {p.bedrooms && <span className="flex items-center gap-1"><Bed size={14} />{p.bedrooms} Bed</span>}
                    {p.bathrooms && <span className="flex items-center gap-1"><Bath size={14} />{p.bathrooms} Bath</span>}
                    {p.area && <span>{p.area}</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      {p.offer_price && p.offer_price < p.price ? (
                        <>
                          <span className="text-accent font-bold">{formatPrice(p.offer_price)}</span>
                          <span className="text-gray-400 line-through text-sm ml-2">{formatPrice(p.price)}</span>
                        </>
                      ) : <span className="text-accent font-bold">{formatPrice(p.price)}</span>}
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{p.code}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded border disabled:opacity-50 hover:bg-gray-50"><ChevronLeft size={16} /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                className={`w-8 h-8 rounded border text-sm ${n === page ? 'bg-primary text-white border-primary' : 'hover:bg-gray-50'}`}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-2 rounded border disabled:opacity-50 hover:bg-gray-50"><ChevronRight size={16} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
