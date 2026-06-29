import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProperty } from '../api/axios';
import { MapPin, Bed, Bath, Car, Home, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import EnquiryModal from '../components/EnquiryModal';
import SiteVisitModal from '../components/SiteVisitModal';

function formatPrice(price: number) {
  if (!price) return 'Price on Request';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price?.toLocaleString()}`;
}

export default function PropertyDetails() {
  const { id } = useParams();
  const [imgIdx, setImgIdx] = useState(0);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [siteVisitOpen, setSiteVisitOpen] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['property', id], queryFn: () => getProperty(id!) });
  const p = data?.data;

  if (isLoading) return <div className="container mx-auto px-4 py-16 text-center">Loading...</div>;
  if (!p) return <div className="container mx-auto px-4 py-16 text-center">Property not found. <Link to="/properties" className="text-primary">Go back</Link></div>;

  const images = p.images || [];

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="mb-4 text-sm text-gray-500">
          <Link to="/" className="hover:text-primary">Home</Link> / <Link to="/properties" className="hover:text-primary">Properties</Link> / {p.title}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Details */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="relative rounded-lg overflow-hidden mb-4 bg-gray-200 h-80 md:h-96">
              {images.length > 0
                ? <img src={images[imgIdx]?.image_url} alt={p.title} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">{p.title?.[0]}</div>}
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"><ChevronLeft size={20} /></button>
                  <button onClick={() => setImgIdx(i => (i + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"><ChevronRight size={20} /></button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                {images.map((img: any, i: number) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-16 h-16 rounded flex-shrink-0 overflow-hidden border-2 ${i === imgIdx ? 'border-primary' : 'border-transparent'}`}>
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-medium">{p.category}</span>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${p.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status?.toUpperCase()}</span>
                {p.is_featured && <span className="bg-accent/10 text-accent text-xs px-3 py-1 rounded-full font-medium">⭐ Featured</span>}
              </div>
              <h1 className="text-2xl font-bold text-primary mb-2">{p.title}</h1>
              {p.code && <p className="text-sm text-gray-500 mb-3">Code: {p.code}</p>}
              {p.project_location && <p className="flex items-center gap-1 text-gray-600 mb-4"><MapPin size={16} />{p.project_location}</p>}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                {p.bedrooms && <div className="text-center"><Bed size={20} className="mx-auto mb-1 text-primary" /><div className="font-bold">{p.bedrooms}</div><div className="text-xs text-gray-500">Bedrooms</div></div>}
                {p.bathrooms && <div className="text-center"><Bath size={20} className="mx-auto mb-1 text-primary" /><div className="font-bold">{p.bathrooms}</div><div className="text-xs text-gray-500">Bathrooms</div></div>}
                {p.area && <div className="text-center"><Home size={20} className="mx-auto mb-1 text-primary" /><div className="font-bold">{p.area}</div><div className="text-xs text-gray-500">Area</div></div>}
                {p.parking !== undefined && <div className="text-center"><Car size={20} className="mx-auto mb-1 text-primary" /><div className="font-bold">{p.parking}</div><div className="text-xs text-gray-500">Parking</div></div>}
              </div>

              {p.facing && <p className="text-sm text-gray-600 mb-2"><strong>Facing:</strong> {p.facing}</p>}
              {p.description && <div className="mt-4"><h3 className="font-bold text-primary mb-2">Description</h3><p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{p.description}</p></div>}
            </div>

            {/* Amenities */}
            {p.amenities?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 border mb-6">
                <h3 className="font-bold text-primary mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {p.amenities.map((a: string, i: number) => <span key={i} className="bg-primary/5 text-primary text-sm px-3 py-1 rounded-full">{a}</span>)}
                </div>
              </div>
            )}

            {/* Floor Plan */}
            {p.floor_plan && (
              <div className="bg-white rounded-lg shadow-sm p-6 border mb-6">
                <h3 className="font-bold text-primary mb-3">Floor Plan</h3>
                <img src={p.floor_plan} alt="Floor Plan" className="max-w-full rounded" />
              </div>
            )}

            {/* Map */}
            {p.google_map && (
              <div className="bg-white rounded-lg shadow-sm p-6 border mb-6">
                <h3 className="font-bold text-primary mb-3">Location</h3>
                <div className="h-64 rounded overflow-hidden" dangerouslySetInnerHTML={{ __html: p.google_map }} />
              </div>
            )}

            {/* Nearby */}
            {p.nearby_places && (
              <div className="bg-white rounded-lg shadow-sm p-6 border mb-6">
                <h3 className="font-bold text-primary mb-3">Nearby Places</h3>
                <p className="text-gray-600 text-sm whitespace-pre-line">{p.nearby_places}</p>
              </div>
            )}
          </div>

          {/* Right: Pricing & Enquiry */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 border sticky top-20">
              <div className="mb-4">
                {p.offer_price && p.offer_price < p.price ? (
                  <>
                    <div className="text-3xl font-bold text-accent">{formatPrice(p.offer_price)}</div>
                    <div className="text-gray-400 line-through">{formatPrice(p.price)}</div>
                    <div className="text-green-600 text-sm font-medium">Save {formatPrice(p.price - p.offer_price)}</div>
                  </>
                ) : <div className="text-3xl font-bold text-accent">{formatPrice(p.price)}</div>}
              </div>
              {p.project_name && <p className="text-sm text-gray-600 mb-4">Project: <strong>{p.project_name}</strong></p>}
              <div className="space-y-3">
                <button onClick={() => setEnquiryOpen(true)} className="btn-primary w-full">Enquire Now</button>
                <button onClick={() => setSiteVisitOpen(true)} className="btn-accent w-full">Book Site Visit</button>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {p.related?.length > 0 && (
          <div className="mt-12">
            <h2 className="section-title mb-6">Related Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {p.related.map((r: any) => (
                <Link key={r.id} to={`/properties/${r.id}`} className="card hover:shadow-lg transition-shadow">
                  <div className="h-36 bg-gray-200 overflow-hidden">
                    {r.images?.[0] ? <img src={r.images[0]} alt={r.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">{r.title[0]}</div>}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm text-primary truncate">{r.title}</h3>
                    <p className="text-accent font-bold text-sm mt-1">{formatPrice(r.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {enquiryOpen && <EnquiryModal propertyId={p.id} propertyTitle={p.title} onClose={() => setEnquiryOpen(false)} />}
      {siteVisitOpen && <SiteVisitModal propertyId={p.id} onClose={() => setSiteVisitOpen(false)} />}
    </div>
  );
}
