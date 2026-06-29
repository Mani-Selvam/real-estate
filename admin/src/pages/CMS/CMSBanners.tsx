import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllBanners, createBanner, updateBanner, deleteBanner, uploadBannerDesktop, uploadBannerMobile } from '../../api/axios';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CMSBanners() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [uploading, setUploading] = useState<{ id: number; type: string } | null>(null);
  const desktopRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();
  const { register, handleSubmit, reset, setValue } = useForm();

  const { data, isLoading } = useQuery({ queryKey: ['admin-banners'], queryFn: getAllBanners });

  const mutation = useMutation({
    mutationFn: (d: any) => editing ? updateBanner(editing.id, d) : createBanner(d),
    onSuccess: () => { toast.success(editing ? 'Updated' : 'Created'); qc.invalidateQueries({ queryKey: ['admin-banners'] }); closeForm(); },
    onError: () => toast.error('Error'),
  });
  const delMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['admin-banners'] }); },
  });

  const openEdit = (b: any) => {
    setEditing(b);
    Object.entries(b).forEach(([k, v]) => setValue(k as any, v));
    setShowForm(true);
  };
  const closeForm = () => { setEditing(null); reset(); setShowForm(false); };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, bannerId: number, type: 'desktop' | 'mobile') => {
    if (!e.target.files?.[0]) return;
    const fd = new FormData();
    fd.append('image', e.target.files[0]);
    setUploading({ id: bannerId, type });
    try {
      if (type === 'desktop') await uploadBannerDesktop(bannerId, fd);
      else await uploadBannerMobile(bannerId, fd);
      toast.success('Image uploaded');
      qc.invalidateQueries({ queryKey: ['admin-banners'] });
    } catch { toast.error('Upload failed'); } finally { setUploading(null); }
  };

  const banners = data?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold">Homepage Banners</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2"><Plus size={16} />Add Banner</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-lg">{editing ? 'Edit' : 'Add'} Banner</h2><button onClick={closeForm}><X size={18} /></button></div>
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-3">
              <div><label className="label">Title</label><input {...register('title')} className="input" placeholder="Banner title" /></div>
              <div><label className="label">Subtitle</label><textarea {...register('subtitle')} className="input" rows={2} placeholder="Subtitle text" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Button Text</label><input {...register('button_text')} className="input" placeholder="e.g. View Properties" /></div>
                <div><label className="label">Button Link</label><input {...register('button_link')} className="input" placeholder="/properties" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Sort Order</label><input {...register('sort_order')} type="number" className="input" defaultValue={0} /></div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><input {...register('is_active')} type="checkbox" defaultChecked />Active</label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">{mutation.isPending ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={closeForm} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? <div className="text-center py-8">Loading...</div> : banners.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">No banners yet. Create your first banner.</div>
        ) : banners.map((b: any) => (
          <div key={b.id} className="card p-4">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{b.title || '(No title)'}</span>
                  <span className={`badge ${b.is_active ? 'badge-green' : 'badge-gray'}`}>{b.is_active ? 'Active' : 'Inactive'}</span>
                </div>
                {b.subtitle && <p className="text-sm text-gray-500">{b.subtitle}</p>}
                {b.button_text && <p className="text-xs text-primary mt-1">Button: {b.button_text} → {b.button_link}</p>}
              </div>
              <div className="flex gap-2 flex-wrap">
                {/* Desktop Image */}
                <div>
                  <p className="text-xs text-gray-400 mb-1">Desktop</p>
                  {b.desktop_image ? <img src={b.desktop_image} alt="" className="h-12 w-24 object-cover rounded border" /> : <div className="h-12 w-24 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-400">No image</div>}
                  <button onClick={() => { desktopRef.current?.click(); desktopRef.current?.setAttribute('data-id', b.id); }} className="text-xs text-primary mt-1 flex items-center gap-1"><Upload size={10} />Upload</button>
                  <input ref={desktopRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, b.id, 'desktop')} />
                </div>
                {/* Mobile Image */}
                <div>
                  <p className="text-xs text-gray-400 mb-1">Mobile</p>
                  {b.mobile_image ? <img src={b.mobile_image} alt="" className="h-12 w-16 object-cover rounded border" /> : <div className="h-12 w-16 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-400">None</div>}
                  <button onClick={() => { mobileRef.current?.click(); mobileRef.current?.setAttribute('data-id', b.id); }} className="text-xs text-primary mt-1 flex items-center gap-1"><Upload size={10} />Upload</button>
                  <input ref={mobileRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, b.id, 'mobile')} />
                </div>
                <div className="flex flex-col gap-2 justify-start">
                  <button onClick={() => openEdit(b)} className="p-1.5 text-primary hover:bg-primary/10 rounded"><Edit size={15} /></button>
                  <button onClick={() => { if (confirm('Delete banner?')) delMutation.mutate(b.id); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
