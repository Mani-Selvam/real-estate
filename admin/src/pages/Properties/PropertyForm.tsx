import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProperty, createProperty, updateProperty, uploadPropertyImages, deletePropertyImage, getAdminProjects } from '../../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, X } from 'lucide-react';

const AMENITIES_OPTIONS = ['Swimming Pool', 'Gymnasium', 'Clubhouse', 'Children Play Area', 'Security', 'Power Backup', 'Lift', 'Parking', 'Garden', 'CCTV', 'Modular Kitchen', 'Intercom'];

export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = !!id;
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [amenities, setAmenities] = useState<string[]>([]);

  const { data: propData } = useQuery({ queryKey: ['property', id], queryFn: () => getProperty(Number(id)), enabled: isEdit });
  const { data: projData } = useQuery({ queryKey: ['projects-dropdown'], queryFn: () => getAdminProjects({ limit: 100 }) });
  const prop = propData?.data;
  const projects = projData?.data || [];

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (prop) { reset(prop); setAmenities(prop.amenities || []); }
  }, [prop, reset]);

  const mutation = useMutation({
    mutationFn: (data: any) => isEdit ? updateProperty(Number(id), data) : createProperty(data),
    onSuccess: (res) => {
      toast.success(isEdit ? 'Property updated!' : 'Property created!');
      qc.invalidateQueries({ queryKey: ['admin-properties'] });
      if (!isEdit) navigate(`/properties/${res.data.id}/edit`);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  });

  const onSubmit = (data: any) => mutation.mutate({ ...data, amenities });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!id || !e.target.files?.length) return;
    const fd = new FormData();
    Array.from(e.target.files).forEach(f => fd.append('images', f));
    setUploading(true);
    try {
      await uploadPropertyImages(Number(id), fd);
      toast.success('Images uploaded');
      qc.invalidateQueries({ queryKey: ['property', id] });
    } catch { toast.error('Upload failed'); } finally { setUploading(false); }
  };

  const toggleAmenity = (a: string) => setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/properties')} className="p-2 hover:bg-gray-100 rounded"><ArrowLeft size={18} /></button>
        <h1 className="text-xl font-bold">{isEdit ? 'Edit Property' : 'New Property'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <h2 className="col-span-full font-semibold border-b pb-2">Basic Info</h2>
          <div className="col-span-full">
            <label className="label">Property Title *</label>
            <input {...register('title', { required: true })} className="input" placeholder="e.g. 3BHK Apartment in Bandra" />
            {errors.title && <span className="text-red-500 text-xs">Required</span>}
          </div>
          <div>
            <label className="label">Property Code</label>
            <input {...register('code')} className="input" placeholder="e.g. PROP-001" />
          </div>
          <div>
            <label className="label">Project</label>
            <select {...register('project_id')} className="input">
              <option value="">No Project</option>
              {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Category</label>
            <select {...register('category')} className="input">
              <option value="">Select</option>
              {['Apartment', 'Villa', 'Plot', 'Commercial', 'Independent House'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select {...register('status')} className="input">
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="booked">Booked</option>
              <option value="sold">Sold</option>
            </select>
          </div>
          <div>
            <label className="label">Price (₹)</label>
            <input {...register('price')} type="number" className="input" placeholder="0" />
          </div>
          <div>
            <label className="label">Offer Price (₹)</label>
            <input {...register('offer_price')} type="number" className="input" placeholder="0" />
          </div>
          <div>
            <label className="label">Area</label>
            <input {...register('area')} className="input" placeholder="e.g. 1200 sq.ft" />
          </div>
          <div>
            <label className="label">Bedrooms</label>
            <input {...register('bedrooms')} type="number" className="input" placeholder="0" />
          </div>
          <div>
            <label className="label">Bathrooms</label>
            <input {...register('bathrooms')} type="number" className="input" placeholder="0" />
          </div>
          <div>
            <label className="label">Facing</label>
            <select {...register('facing')} className="input">
              <option value="">Select</option>
              {['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'].map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Parking Slots</label>
            <input {...register('parking')} type="number" className="input" placeholder="0" />
          </div>
          <div className="col-span-full">
            <label className="label">Description</label>
            <textarea {...register('description')} className="input" rows={4} placeholder="Property description..." />
          </div>
          <div className="col-span-full">
            <label className="label">Nearby Places</label>
            <textarea {...register('nearby_places')} className="input" rows={3} placeholder="School: 500m, Hospital: 1km..." />
          </div>
          <div className="col-span-full">
            <label className="label">Google Map Embed</label>
            <textarea {...register('google_map')} className="input" rows={2} placeholder='<iframe src="..." />' />
          </div>
          <div className="flex gap-4 items-center pt-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input {...register('is_featured')} type="checkbox" />Featured
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input {...register('is_published')} type="checkbox" />Published
            </label>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold border-b pb-2 mb-4">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {AMENITIES_OPTIONS.map(a => (
              <button key={a} type="button" onClick={() => toggleAmenity(a)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${amenities.includes(a) ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600 hover:border-primary'}`}>
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-6 grid grid-cols-1 gap-4">
          <h2 className="font-semibold border-b pb-2">SEO</h2>
          <input {...register('meta_title')} className="input" placeholder="Meta title" />
          <textarea {...register('meta_description')} className="input" rows={2} placeholder="Meta description" />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={mutation.isPending} className="btn-primary px-8 py-2.5">
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update Property' : 'Create Property'}
          </button>
          <button type="button" onClick={() => navigate('/properties')} className="btn-secondary">Cancel</button>
        </div>
      </form>

      {isEdit && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Property Images</h2>
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-primary flex items-center gap-2">
              <Upload size={14} />{uploading ? 'Uploading...' : 'Upload'}
            </button>
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
          </div>
          {prop?.images?.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {prop.images.map((img: any) => (
                <div key={img.id} className="relative group h-20 rounded overflow-hidden bg-gray-100">
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  <button onClick={async () => { if (confirm('Delete?')) { await deletePropertyImage(Number(id), img.id); qc.invalidateQueries({ queryKey: ['property', id] }); } }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm">No images yet</p>}
        </div>
      )}
    </div>
  );
}
