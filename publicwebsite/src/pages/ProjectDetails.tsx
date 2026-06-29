import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProject } from '../api/axios';
import { MapPin, Download, Bed, Bath, ChevronLeft, ChevronRight } from 'lucide-react';
import EnquiryModal from '../components/EnquiryModal';

function formatPrice(p: number) {
  if (!p) return 'Price on Request';
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(2)} L`;
  return `₹${p.toLocaleString()}`;
}

export default function ProjectDetails() {
  const { id } = useParams();
  const [imgIdx, setImgIdx] = useState(0);
  const [tab, setTab] = useState('gallery');
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['project', id], queryFn: () => getProject(id!) });
  const p = data?.data;

  if (isLoading) return <div className="container mx-auto px-4 py-16 text-center">Loading...</div>;
  if (!p) return <div className="container mx-auto px-4 py-16 text-center">Project not found. <Link to="/projects" className="text-primary">Go back</Link></div>;

  const gallery = p.gallery || [];

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="mb-4 text-sm text-gray-500">
          <Link to="/" className="hover:text-primary">Home</Link> / <Link to="/projects" className="hover:text-primary">Projects</Link> / {p.name}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Gallery */}
            {gallery.length > 0 && (
              <div className="relative h-80 md:h-96 rounded-lg overflow-hidden bg-gray-200 mb-4">
                <img src={gallery[imgIdx]?.image_url} alt={p.name} className="w-full h-full object-cover" />
                {gallery.length > 1 && (
                  <>
                    <button onClick={() => setImgIdx(i => (i - 1 + gallery.length) % gallery.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"><ChevronLeft size={20} /></button>
                    <button onClick={() => setImgIdx(i => (i + 1) % gallery.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"><ChevronRight size={20} /></button>
                  </>
                )}
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm p-6 border mb-6">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${p.status === 'completed' ? 'bg-green-100 text-green-700' : p.status === 'ongoing' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span>
                {p.is_featured && <span className="bg-accent/10 text-accent text-xs px-3 py-1 rounded-full">⭐ Featured</span>}
              </div>
              <h1 className="text-2xl font-bold text-primary mb-2">{p.name}</h1>
              {p.location && <p className="flex items-center gap-1 text-gray-600 mb-4"><MapPin size={16} />{p.location}</p>}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg mb-4">
                {p.price_starting_from && <div><div className="text-xs text-gray-500">Starting From</div><div className="font-bold text-accent">{formatPrice(p.price_starting_from)}</div></div>}
                {p.possession_date && <div><div className="text-xs text-gray-500">Possession</div><div className="font-bold">{new Date(p.possession_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</div></div>}
                {p.code && <div><div className="text-xs text-gray-500">Project Code</div><div className="font-bold">{p.code}</div></div>}
              </div>

              {p.description && <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{p.description}</p>}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="flex border-b">
                {['gallery', 'amenities', 'floor_plans', 'videos'].map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    {t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </button>
                ))}
              </div>
              <div className="p-4">
                {tab === 'gallery' && (
                  <div className="grid grid-cols-3 gap-2">
                    {gallery.length === 0 ? <p className="text-gray-400 col-span-3 text-center py-4">No gallery images</p>
                      : gallery.map((g: any, i: number) => <button key={i} onClick={() => setImgIdx(i)} className="h-24 rounded overflow-hidden"><img src={g.image_url} alt="" className="w-full h-full object-cover hover:opacity-90 transition-opacity" /></button>)}
                  </div>
                )}
                {tab === 'amenities' && (
                  <div>{p.amenities?.length > 0 ? <div className="flex flex-wrap gap-2">{p.amenities.map((a: string, i: number) => <span key={i} className="bg-primary/5 text-primary text-sm px-3 py-1 rounded-full">{a}</span>)}</div> : <p className="text-gray-400">No amenities listed</p>}</div>
                )}
                {tab === 'floor_plans' && (
                  <div className="grid grid-cols-2 gap-3">{p.floor_plans?.length > 0 ? p.floor_plans.map((f: any, i: number) => <div key={i}>{f.title && <p className="text-sm font-medium mb-1">{f.title}</p>}<img src={f.image_url} alt={f.title} className="rounded border w-full" /></div>) : <p className="text-gray-400 col-span-2">No floor plans available</p>}</div>
                )}
                {tab === 'videos' && (
                  <div>{p.videos?.length > 0 ? p.videos.map((v: any, i: number) => <div key={i} className="mb-3"><p className="text-sm font-medium mb-1">{v.title}</p><a href={v.video_url} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline">{v.video_url}</a></div>) : <p className="text-gray-400">No videos available</p>}</div>
                )}
              </div>
            </div>

            {p.google_map && (
              <div className="bg-white rounded-lg shadow-sm p-6 border mt-6">
                <h3 className="font-bold text-primary mb-3">Location</h3>
                <div className="h-64 rounded overflow-hidden" dangerouslySetInnerHTML={{ __html: p.google_map }} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 border sticky top-20 space-y-3">
              <h3 className="font-bold text-primary text-lg">Interested in this project?</h3>
              <button onClick={() => setEnquiryOpen(true)} className="btn-primary w-full">Enquire Now</button>
              {p.brochure && <a href={p.brochure} download className="btn-accent w-full flex items-center justify-center gap-2"><Download size={16} />Download Brochure</a>}
            </div>
            {/* Related properties */}
            {p.properties?.length > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow-sm p-4 border">
                <h3 className="font-bold text-primary mb-3">Units Available</h3>
                <div className="space-y-3">
                  {p.properties.map((prop: any) => (
                    <Link key={prop.id} to={`/properties/${prop.id}`} className="block border rounded-lg p-3 hover:border-primary transition-colors">
                      <div className="font-medium text-sm">{prop.title}</div>
                      <div className="flex gap-3 text-xs text-gray-500 mt-1">
                        {prop.bedrooms && <span><Bed size={10} className="inline mr-1" />{prop.bedrooms}</span>}
                        {prop.bathrooms && <span><Bath size={10} className="inline mr-1" />{prop.bathrooms}</span>}
                        {prop.area && <span>{prop.area}</span>}
                      </div>
                      {prop.price && <div className="text-accent font-bold text-sm mt-1">{formatPrice(prop.price)}</div>}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {enquiryOpen && <EnquiryModal onClose={() => setEnquiryOpen(false)} />}
    </div>
  );
}
