import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../../api/axios';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, X, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CMSTestimonials() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const qc = useQueryClient();
  const { register, handleSubmit, reset, setValue } = useForm();

  const { data, isLoading } = useQuery({ queryKey: ['admin-testimonials'], queryFn: getAllTestimonials });

  const mutation = useMutation({
    mutationFn: (d: any) => editing ? updateTestimonial(editing.id, d) : createTestimonial(d),
    onSuccess: () => { toast.success('Saved'); qc.invalidateQueries({ queryKey: ['admin-testimonials'] }); closeForm(); },
  });
  const delMutation = useMutation({
    mutationFn: deleteTestimonial,
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['admin-testimonials'] }); },
  });

  const openEdit = (t: any) => { setEditing(t); Object.entries(t).forEach(([k, v]) => setValue(k as any, v)); setShowForm(true); };
  const closeForm = () => { setEditing(null); reset(); setShowForm(false); };

  const items = data?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold">Testimonials</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2"><Plus size={16} />Add Testimonial</button></div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="font-bold">{editing ? 'Edit' : 'Add'} Testimonial</h2><button onClick={closeForm}><X size={18} /></button></div>
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-3">
              <div><label className="label">Customer Name *</label><input {...register('customer_name', { required: true })} className="input" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Designation</label><input {...register('designation')} className="input" /></div>
                <div><label className="label">Company</label><input {...register('company')} className="input" /></div>
              </div>
              <div><label className="label">Message *</label><textarea {...register('message', { required: true })} className="input" rows={4} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="label">Rating (1-5)</label><input {...register('rating')} type="number" min={1} max={5} className="input" defaultValue={5} /></div>
                <div><label className="label">Sort Order</label><input {...register('sort_order')} type="number" className="input" defaultValue={0} /></div>
                <div className="flex items-end pb-2"><label className="flex items-center gap-2 text-sm cursor-pointer"><input {...register('is_active')} type="checkbox" defaultChecked />Active</label></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">Save</button>
                <button type="button" onClick={closeForm} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? <div className="col-span-2 text-center py-8">Loading...</div>
          : items.length === 0 ? <div className="col-span-2 card p-12 text-center text-gray-400">No testimonials yet</div>
          : items.map((t: any) => (
            <div key={t.id} className="card p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex text-yellow-400">{Array.from({ length: t.rating || 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(t)} className="p-1 text-primary hover:bg-primary/10 rounded"><Edit size={14} /></button>
                  <button onClick={() => { if (confirm('Delete?')) delMutation.mutate(t.id); }} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="text-sm text-gray-600 italic mb-3">"{t.message}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">{t.customer_name}</div>
                  {t.designation && <div className="text-xs text-gray-400">{t.designation}{t.company ? `, ${t.company}` : ''}</div>}
                </div>
                <span className={`badge ${t.is_active ? 'badge-green' : 'badge-gray'}`}>{t.is_active ? 'Active' : 'Hidden'}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
