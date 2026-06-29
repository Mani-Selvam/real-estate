import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCustomers, createCustomer } from '../../api/axios';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

export default function Customers() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const { data, isLoading } = useQuery({ queryKey: ['customers', search], queryFn: () => getCustomers({ search: search || undefined }) });

  const mutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => { toast.success('Customer created'); qc.invalidateQueries({ queryKey: ['customers'] }); setShowForm(false); reset(); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  });

  const customers = data?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold">Customers</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2"><Plus size={16} />Add Customer</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="font-bold text-lg mb-4">Add Customer</h2>
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-3">
              <div><label className="label">Name *</label><input {...register('name', { required: true })} className="input" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Mobile</label><input {...register('mobile')} className="input" /></div>
                <div><label className="label">Email</label><input {...register('email')} type="email" className="input" /></div>
              </div>
              <div><label className="label">Address</label><textarea {...register('address')} className="input" rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">ID Proof Type</label><select {...register('id_proof_type')} className="input"><option value="">Select</option><option>Aadhar</option><option>PAN</option><option>Passport</option><option>DL</option></select></div>
                <div><label className="label">ID Number</label><input {...register('id_proof_number')} className="input" /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">{mutation.isPending ? 'Saving...' : 'Add Customer'}</button>
                <button type="button" onClick={() => { setShowForm(false); reset(); }} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" placeholder="Search customers..." />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="table-th">Name</th>
              <th className="table-th">Mobile</th>
              <th className="table-th">Email</th>
              <th className="table-th">Address</th>
              <th className="table-th">ID Proof</th>
              <th className="table-th">Added</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
                : customers.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">No customers yet</td></tr>
                : customers.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="table-td font-medium">{c.name}</td>
                    <td className="table-td">{c.mobile || '—'}</td>
                    <td className="table-td text-sm text-gray-500">{c.email || '—'}</td>
                    <td className="table-td text-xs text-gray-500 max-w-xs truncate">{c.address || '—'}</td>
                    <td className="table-td text-xs">{c.id_proof_type ? `${c.id_proof_type}: ${c.id_proof_number}` : '—'}</td>
                    <td className="table-td text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
