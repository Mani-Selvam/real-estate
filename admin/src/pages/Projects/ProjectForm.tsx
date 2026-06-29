import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProject, createProject, updateProject, uploadProjectImages, deleteProjectImage } from '../../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, X } from 'lucide-react';

const AMENITIES_OPTIONS = ['Swimming Pool', 'Gymnasium', 'Clubhouse', 'Children Play Area', 'Security', 'Power Backup', 'Lift', 'Parking', 'Garden', 'Basketball Court', 'Tennis Court', 'Jogging Track'];

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = !!id;
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [amenities, setAmenities] = useState<string[]>([]);

  const { data: projectData } = useQuery({ queryKey: ['project', id], queryFn: () => getProject(Number(id)), enabled: isEdit });
  const project = projectData?.data;

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (project) {
      reset({ ...project, possession_date: project.possession_date?.split('T')[0] || '' });
      setAmenities(project.amenities || []);
    }
  }, [project, reset]);

  const mutation = useMutation({
    mutationFn: (data: any) => isEdit ? updateProject(Number(id), data) : createProject(data),
    onSuccess: (res) => {
      toast.success(isEdit ? 'Project updated!' : 'Project created!');
      qc.invalidateQueries({ queryKey: ['admin-projects'] });
      if (!isEdit) navigate(`/projects/${res.data.id}/edit`);
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
      await uploadProjectImages(Number(id), fd);
      toast.success('Images uploaded');
      qc.invalidateQueries({ queryKey: ['project', id] });
    } catch { toast.error('Upload failed'); } finally { setUploading(false); }
  };

  const handleDeleteImg = async (imgId: number) => {
    if (!id || !confirm('Delete image?')) return;
    await deleteProjectImage(Number(id), imgId);
    qc.invalidateQueries({ queryKey: ['project', id] });
  };

  const toggleAmenity = (a: string) => setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/projects')} className="p-2 hover:bg-gray-100 rounded"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-xl font-bold">{isEdit ? 'Edit Project' : 'New Project'}</h1>
          {project && <p className="text-sm text-gray-500">{project.name}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <h2 className="col-span-full font-semibold text-gray-700 border-b pb-2">Basic Information</h2>
          <div>
            <label className="label">Project Name *</label>
            <input {...register('name', { required: true })} className="input" placeholder="Project name" />
            {errors.name && <span className="text-red-500 text-xs">Required</span>}
          </div>
          <div>
            <label className="label">Project Code</label>
            <input {...register('code')} className="input" placeholder="e.g. PROJ-001" />
          </div>
          <div className="col-span-full">
            <label className="label">Location</label>
            <input {...register('location')} className="input" placeholder="City, Area" />
          </div>
          <div className="col-span-full">
            <label className="label">Description</label>
            <textarea {...register('description')} className="input" rows={4} placeholder="Project description..." />
          </div>
          <div>
            <label className="label">Price Starting From (₹)</label>
            <input {...register('price_starting_from')} type="number" className="input" placeholder="0" />
          </div>
          <div>
            <label className="label">Status</label>
            <select {...register('status')} className="input">
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="label">Possession Date</label>
            <input {...register('possession_date')} type="date" className="input" />
          </div>
          <div className="flex gap-4 items-center pt-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input {...register('is_featured')} type="checkbox" className="rounded" />Featured
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input {...register('is_published')} type="checkbox" className="rounded" />Published (Live)
            </label>
          </div>
        </div>

        {/* Amenities */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-700 border-b pb-2 mb-4">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {AMENITIES_OPTIONS.map(a => (
              <button key={a} type="button" onClick={() => toggleAmenity(a)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${amenities.includes(a) ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600 hover:border-primary'}`}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* SEO */}
        <div className="card p-6 grid grid-cols-1 gap-4">
          <h2 className="font-semibold text-gray-700 border-b pb-2">SEO</h2>
          <div>
            <label className="label">Meta Title</label>
            <input {...register('meta_title')} className="input" placeholder="SEO title" />
          </div>
          <div>
            <label className="label">Meta Description</label>
            <textarea {...register('meta_description')} className="input" rows={2} placeholder="SEO description" />
          </div>
        </div>

        {/* Google Map */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-700 border-b pb-2 mb-4">Google Map</h2>
          <div>
            <label className="label">Embed Code (iframe)</label>
            <textarea {...register('google_map')} className="input" rows={3} placeholder='<iframe src="..." />' />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={mutation.isPending} className="btn-primary px-8 py-2.5">
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
          </button>
          <button type="button" onClick={() => navigate('/projects')} className="btn-secondary">Cancel</button>
        </div>
      </form>

      {/* Gallery - only show in edit mode */}
      {isEdit && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Project Gallery</h2>
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-primary flex items-center gap-2">
              <Upload size={14} />{uploading ? 'Uploading...' : 'Upload Images'}
            </button>
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
          </div>
          {project?.gallery?.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {project.gallery.map((img: any) => (
                <div key={img.id} className="relative group h-24 rounded overflow-hidden bg-gray-100">
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => handleDeleteImg(img.id)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm">No images uploaded yet</p>}
        </div>
      )}
    </div>
  );
}
