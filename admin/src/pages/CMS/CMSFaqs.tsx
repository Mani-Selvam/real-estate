import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllFaqs, createFaq, updateFaq, deleteFaq } from '../../api/axios';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CMSFaqs() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const qc = useQueryClient();
  const { register, handleSubmit, reset, setValue } = useForm();

  const { data, isLoading } = useQuery({ queryKey: ['admin-faqs'], queryFn: getAllFaqs });

  const mutation = useMutation({
    mutationFn: (d: any) => editing ? updateFaq(editing.id, d) : createFaq(d),
    onSuccess: () => { toast.success('Saved'); qc.invalidateQueries({ queryKey: ['admin-faqs'] }); closeForm(); },
  });
  const delMutation = useMutation({
    mutationFn: deleteFaq,
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['admin-faqs'] }); },
  });

  const openEdit = (f: any) => { setEditing(f); Object.entries(f).forEach(([k, v]) => setValue(k as any, v)); setShowForm(true); };
  const closeForm = () => { setEditing(null); reset(); setShowForm(false); };

  const faqs = data?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold">FAQs</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2"><Plus size={16} />Add FAQ</button></div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="font-bold">{editing ? 'Edit' : 'Add'} FAQ</h2><button onClick={closeForm}><X size={18} /></button></div>
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-3">
              <div><label className="label">Question *</label><input {...register('question', { required: true })} className="input" /></div>
              <div><label className="label">Answer *</label><textarea {...register('answer', { required: true })} className="input" rows={4} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Category</label><input {...register('category')} className="input" placeholder="e.g. General, Buying" /></div>
                <div><label className="label">Sort Order</label><input {...register('sort_order')} type="number" className="input" defaultValue={0} /></div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input {...register('is_active')} type="checkbox" defaultChecked />Active</label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">Save</button>
                <button type="button" onClick={closeForm} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="table-th">Question</th><th className="table-th">Category</th><th className="table-th">Order</th><th className="table-th">Active</th><th className="table-th">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>
              : faqs.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">No FAQs yet</td></tr>
              : faqs.map((f: any) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="table-td max-w-sm truncate font-medium">{f.question}</td>
                  <td className="table-td text-xs text-gray-500">{f.category || '—'}</td>
                  <td className="table-td">{f.sort_order}</td>
                  <td className="table-td"><span className={`badge ${f.is_active ? 'badge-green' : 'badge-gray'}`}>{f.is_active ? 'Yes' : 'No'}</span></td>
                  <td className="table-td"><div className="flex gap-2">
                    <button onClick={() => openEdit(f)} className="p-1.5 text-primary hover:bg-primary/10 rounded"><Edit size={15} /></button>
                    <button onClick={() => { if (confirm('Delete?')) delMutation.mutate(f.id); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
                  </div></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
