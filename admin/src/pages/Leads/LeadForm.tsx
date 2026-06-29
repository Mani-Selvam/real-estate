import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createLead, getAdminProperties } from '../../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

export default function LeadForm() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { data: propData } = useQuery({ queryKey: ['properties-dropdown'], queryFn: () => getAdminProperties({ limit: 200 }) });
  const properties = propData?.data || [];

  const mutation = useMutation({
    mutationFn: createLead,
    onSuccess: (res) => {
      toast.success('Lead created!');
      qc.invalidateQueries({ queryKey: ['leads'] });
      navigate(`/leads/${res.data.id}`);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/leads')} className="p-2 hover:bg-gray-100 rounded"><ArrowLeft size={18} /></button>
        <h1 className="text-xl font-bold">Add New Lead</h1>
      </div>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="card p-6 space-y-4">
        <div>
          <label className="label">Name *</label>
          <input {...register('name', { required: true })} className="input" placeholder="Lead name" />
          {errors.name && <span className="text-red-500 text-xs">Required</span>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Mobile *</label>
            <input {...register('mobile', { required: true })} className="input" placeholder="Mobile number" />
            {errors.mobile && <span className="text-red-500 text-xs">Required</span>}
          </div>
          <div>
            <label className="label">Email</label>
            <input {...register('email')} type="email" className="input" placeholder="Email" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Source</label>
            <select {...register('source')} className="input">
              {['manual', 'website', 'facebook', 'instagram', 'google', 'walkin', 'referral'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Interested Property</label>
            <select {...register('property_id')} className="input">
              <option value="">None</option>
              {properties.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea {...register('notes')} className="input" rows={3} placeholder="Initial notes..." />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={mutation.isPending} className="btn-primary px-8">{mutation.isPending ? 'Creating...' : 'Create Lead'}</button>
          <button type="button" onClick={() => navigate('/leads')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
