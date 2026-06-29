import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllBlog, createBlogPost, updateBlogPost, deleteBlogPost } from '../../api/axios';
import api from '../../api/axios';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, X, Upload, Image } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CMSBlog() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  const { data, isLoading } = useQuery({ queryKey: ['admin-blog'], queryFn: getAllBlog });

  const mutation = useMutation({
    mutationFn: (d: any) => editing ? updateBlogPost(editing.id, d) : createBlogPost(d),
    onSuccess: () => { toast.success('Saved'); qc.invalidateQueries({ queryKey: ['admin-blog'] }); closeForm(); },
    onError: () => toast.error('Save failed'),
  });

  const delMutation = useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['admin-blog'] }); },
  });

  const openEdit = (p: any) => {
    setEditing(p);
    Object.entries(p).forEach(([k, v]) => setValue(k as any, v));
    setImagePreview(p.featured_image || '');
    setShowForm(true);
  };

  const closeForm = () => {
    setEditing(null);
    reset();
    setImagePreview('');
    setShowForm(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post(`/cms/blog/${editing.id}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = res.data.url;
      setImagePreview(url);
      setValue('featured_image', url);
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const posts = data?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Blog Posts</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2"><Plus size={16} />New Post</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 my-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">{editing ? 'Edit' : 'New'} Blog Post</h2>
              <button onClick={closeForm}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-3">
              <div><label className="label">Title *</label><input {...register('title', { required: true })} className="input" /></div>
              <div><label className="label">Excerpt</label><textarea {...register('excerpt')} className="input" rows={2} placeholder="Brief summary shown on listing page..." /></div>
              <div><label className="label">Content *</label><textarea {...register('content', { required: true })} className="input" rows={10} placeholder="Full blog content..." /></div>

              {/* Featured Image */}
              <div>
                <label className="label">Featured Image</label>
                {editing ? (
                  <div className="space-y-2">
                    {imagePreview && (
                      <img src={imagePreview} alt="preview" className="w-full h-40 object-cover rounded border" />
                    )}
                    <input ref={imgRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <button type="button" onClick={() => imgRef.current?.click()} disabled={uploading}
                      className="btn-secondary flex items-center gap-2 text-sm">
                      {uploading ? 'Uploading...' : <><Upload size={14} />{imagePreview ? 'Change Image' : 'Upload Image'}</>}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded border">Save the post first, then you can upload a featured image.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Meta Title</label><input {...register('meta_title')} className="input" /></div>
                <div><label className="label">Meta Description</label><input {...register('meta_description')} className="input" /></div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input {...register('is_published')} type="checkbox" className="w-4 h-4" />
                Publish (make live on website)
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">{mutation.isPending ? 'Saving...' : 'Save Post'}</button>
                <button type="button" onClick={closeForm} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="table-th">Title</th>
            <th className="table-th">Author</th>
            <th className="table-th">Image</th>
            <th className="table-th">Published</th>
            <th className="table-th">Date</th>
            <th className="table-th">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
              : posts.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">No blog posts yet. Create your first post!</td></tr>
              : posts.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="table-td font-medium max-w-xs">
                    <div className="truncate">{p.title}</div>
                    {p.excerpt && <div className="text-xs text-gray-400 truncate">{p.excerpt}</div>}
                  </td>
                  <td className="table-td text-sm text-gray-500">{p.author_name || '—'}</td>
                  <td className="table-td">
                    {p.featured_image
                      ? <img src={p.featured_image} alt="" className="w-12 h-8 object-cover rounded" />
                      : <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center"><Image size={14} className="text-gray-400" /></div>}
                  </td>
                  <td className="table-td"><span className={`badge ${p.is_published ? 'badge-green' : 'badge-gray'}`}>{p.is_published ? 'Live' : 'Draft'}</span></td>
                  <td className="table-td text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="table-td"><div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="p-1.5 text-primary hover:bg-primary/10 rounded"><Edit size={15} /></button>
                    <button onClick={() => { if (confirm('Delete this post?')) delMutation.mutate(p.id); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
                  </div></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
