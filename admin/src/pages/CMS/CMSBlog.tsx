import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllBlog, createBlogPost, updateBlogPost, deleteBlogPost } from '../../api/axios';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CMSBlog() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const qc = useQueryClient();
  const { register, handleSubmit, reset, setValue } = useForm();

  const { data, isLoading } = useQuery({ queryKey: ['admin-blog'], queryFn: getAllBlog });

  const mutation = useMutation({
    mutationFn: (d: any) => editing ? updateBlogPost(editing.id, d) : createBlogPost(d),
    onSuccess: () => { toast.success('Saved'); qc.invalidateQueries({ queryKey: ['admin-blog'] }); closeForm(); },
  });
  const delMutation = useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['admin-blog'] }); },
  });

  const openEdit = (p: any) => { setEditing(p); Object.entries(p).forEach(([k, v]) => setValue(k as any, v)); setShowForm(true); };
  const closeForm = () => { setEditing(null); reset(); setShowForm(false); };

  const posts = data?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold">Blog Posts</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2"><Plus size={16} />New Post</button></div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 my-4">
            <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-lg">{editing ? 'Edit' : 'New'} Blog Post</h2><button onClick={closeForm}><X size={18} /></button></div>
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-3">
              <div><label className="label">Title *</label><input {...register('title', { required: true })} className="input" /></div>
              <div><label className="label">Excerpt</label><textarea {...register('excerpt')} className="input" rows={2} placeholder="Brief summary..." /></div>
              <div><label className="label">Content *</label><textarea {...register('content', { required: true })} className="input" rows={8} placeholder="Full blog content..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Meta Title</label><input {...register('meta_title')} className="input" /></div>
                <div><label className="label">Meta Description</label><input {...register('meta_description')} className="input" /></div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input {...register('is_published')} type="checkbox" />Publish (make live)</label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">Save Post</button>
                <button type="button" onClick={closeForm} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="table-th">Title</th><th className="table-th">Author</th><th className="table-th">Published</th><th className="table-th">Date</th><th className="table-th">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>
              : posts.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">No blog posts yet</td></tr>
              : posts.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="table-td font-medium max-w-xs truncate">{p.title}</td>
                  <td className="table-td text-sm">{p.author_name || '—'}</td>
                  <td className="table-td"><span className={`badge ${p.is_published ? 'badge-green' : 'badge-gray'}`}>{p.is_published ? 'Live' : 'Draft'}</span></td>
                  <td className="table-td text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="table-td"><div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="p-1.5 text-primary hover:bg-primary/10 rounded"><Edit size={15} /></button>
                    <button onClick={() => { if (confirm('Delete post?')) delMutation.mutate(p.id); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
                  </div></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
