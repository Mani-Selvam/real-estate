import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBookings, createBooking, getCustomers, getAdminProperties } from '../../api/axios';
import { Plus, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

function formatPrice(p: number) {
  if (!p) return '—';
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(2)} L`;
  return `₹${p.toLocaleString()}`;
}

export default function Bookings() {
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const qc = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const { data, isLoading } = useQuery({ queryKey: ['bookings'], queryFn: () => getBookings() });
  const { data: custData } = useQuery({ queryKey: ['customers-dropdown'], queryFn: () => getCustomers() });
  const { data: propData } = useQuery({ queryKey: ['props-dropdown'], queryFn: () => getAdminProperties({ limit: 200 }) });

  const mutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => { toast.success('Booking created'); qc.invalidateQueries({ queryKey: ['bookings'] }); setShowForm(false); reset(); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  });

  const bookings = data?.data || [];
  const customers = custData?.data || [];
  const properties = propData?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold">Bookings</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2"><Plus size={16} />New Booking</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h2 className="font-bold text-lg mb-4">New Booking</h2>
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-3">
              <div>
                <label className="label">Customer *</label>
                <select {...register('customer_id', { required: true })} className="input">
                  <option value="">Select customer</option>
                  {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name} – {c.mobile}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Property *</label>
                <select {...register('property_id', { required: true })} className="input">
                  <option value="">Select property</option>
                  {properties.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Total Price</label><input {...register('total_price')} type="number" className="input" /></div>
                <div><label className="label">Discount</label><input {...register('discount')} type="number" className="input" defaultValue={0} /></div>
              </div>
              <div><label className="label">Booking Date</label><input {...register('booking_date')} type="date" className="input" /></div>
              <div><label className="label">Notes</label><textarea {...register('notes')} className="input" rows={2} /></div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">{mutation.isPending ? 'Creating...' : 'Create Booking'}</button>
                <button type="button" onClick={() => { setShowForm(false); reset(); }} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="table-th">Booking #</th>
              <th className="table-th">Customer</th>
              <th className="table-th">Property</th>
              <th className="table-th">Final Price</th>
              <th className="table-th">Status</th>
              <th className="table-th">Date</th>
              <th className="table-th">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? <tr><td colSpan={7} className="text-center py-8">Loading...</td></tr>
                : bookings.length === 0 ? <tr><td colSpan={7} className="text-center py-8 text-gray-400">No bookings yet</td></tr>
                : bookings.map((b: any) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="table-td font-mono text-xs">{b.booking_number}</td>
                    <td className="table-td font-medium">{b.customer_name}<div className="text-xs text-gray-400">{b.customer_mobile}</div></td>
                    <td className="table-td text-sm">{b.property_title}</td>
                    <td className="table-td font-bold text-primary">{formatPrice(b.final_price)}</td>
                    <td className="table-td"><span className={`badge ${b.status === 'completed' ? 'badge-green' : b.status === 'cancelled' ? 'badge-red' : 'badge-yellow'}`}>{b.status}</span></td>
                    <td className="table-td text-xs text-gray-400">{b.booking_date ? new Date(b.booking_date).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="table-td">
                      <button onClick={() => setSelected(b)} className="p-1.5 text-primary hover:bg-primary/10 rounded"><Eye size={15} /></button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="font-bold text-lg mb-2">Booking: {selected.booking_number}</h2>
            <div className="space-y-2 text-sm mb-4">
              <div><span className="text-gray-500">Customer:</span> {selected.customer_name} ({selected.customer_mobile})</div>
              <div><span className="text-gray-500">Property:</span> {selected.property_title}</div>
              <div><span className="text-gray-500">Total:</span> {formatPrice(selected.total_price)}</div>
              <div><span className="text-gray-500">Discount:</span> {formatPrice(selected.discount)}</div>
              <div><span className="text-gray-500">Final Price:</span> <strong className="text-primary">{formatPrice(selected.final_price)}</strong></div>
              <div><span className="text-gray-500">Status:</span> <span className="badge-yellow">{selected.status}</span></div>
            </div>
            <button onClick={() => setSelected(null)} className="btn-secondary w-full">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
