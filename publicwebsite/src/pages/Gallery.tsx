import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getGallery } from '../api/axios';
import { X } from 'lucide-react';

export default function Gallery() {
  const [cat, setCat] = useState('');
  const [lightbox, setLightbox] = useState<string | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ['gallery', cat], queryFn: () => getGallery(cat || undefined) });
  const images = data?.data || [];
  const categories = [...new Set(images.map((g: any) => g.category).filter(Boolean))];

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10"><h1 className="section-title">Gallery</h1><p className="text-gray-600">A glimpse of our properties and projects</p></div>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {['', ...categories].map(c => (
              <button key={c} onClick={() => setCat(c)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${cat === c ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {c || 'All'}
              </button>
            ))}
          </div>
        )}
        {isLoading ? <div className="text-center py-16">Loading...</div> : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {images.map((img: any) => (
              <button key={img.id} onClick={() => setLightbox(img.image_url)} className="break-inside-avoid block w-full rounded-lg overflow-hidden hover:opacity-90 transition-opacity">
                <img src={img.image_url} alt={img.title || ''} className="w-full" />
              </button>
            ))}
          </div>
        )}
        {images.length === 0 && !isLoading && <p className="text-center text-gray-500 py-16">No gallery images yet.</p>}
      </div>
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white"><X size={28} /></button>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
