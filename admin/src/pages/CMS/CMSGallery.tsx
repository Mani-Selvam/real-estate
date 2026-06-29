import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminGallery, uploadGallery, deleteGalleryItem } from '../../api/axios';
import { Upload, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CMSGallery() {
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['admin-gallery'], queryFn: getAdminGallery });
  const delMutation = useMutation({
    mutationFn: deleteGalleryItem,
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['admin-gallery'] }); },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const fd = new FormData();
    Array.from(e.target.files).forEach(f => fd.append('images', f));
    if (category) fd.append('category', category);
    setUploading(true);
    try {
      await uploadGallery(fd);
      toast.success('Uploaded!');
      qc.invalidateQueries({ queryKey: ['admin-gallery'] });
    } catch { toast.error('Upload failed'); } finally { setUploading(false); e.target.value = ''; }
  };

  const images = data?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold">Gallery ({images.length})</h1>
        <div className="flex gap-2">
          <input value={category} onChange={e => setCategory(e.target.value)} className="input w-40" placeholder="Category (optional)" />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-primary flex items-center gap-2">
            <Upload size={16} />{uploading ? 'Uploading...' : 'Upload Images'}
          </button>
          <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
        </div>
      </div>

      {isLoading ? <div className="text-center py-8">Loading...</div> : images.length === 0 ? (
        <div className="card p-16 text-center text-gray-400">No gallery images. Upload some.</div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {images.map((img: any) => (
            <div key={img.id} className="relative group h-28 rounded-lg overflow-hidden bg-gray-100">
              <img src={img.image_url} alt={img.title || ''} className="w-full h-full object-cover" />
              {img.category && <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1 py-0.5 truncate">{img.category}</div>}
              <button onClick={() => { if (confirm('Delete image?')) delMutation.mutate(img.id); }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
