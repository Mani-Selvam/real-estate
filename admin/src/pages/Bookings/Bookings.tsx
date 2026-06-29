import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBookings, createBooking, updateBooking, addPayment, getCustomers, getAdminProperties, getBooking } from '../../api/axios';
import { Plus, Eye, Edit, CreditCard, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

function formatPrice(p: number) {
  if (!p) return '—';
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(2)} L`;
  return `₹${p.toLocaleString()}`;
}

const STATUS_COLORS: Record<string, string> = {
  completed: 'badge-green',
  confirmed: 'badge-blue',
  cancelled: 'badge-red',
  pending: 'badge-yellow',
};

export default function Bookings() {
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const qc = useQueryClient();
  const { register, handleSubmit, reset, watch } = useForm();
  const { register: regPay, handleSubmit: handlePaySubmit, reset: resetPay } = useForm();

  const { data, isLoading } = useQuery({ queryKey: ['bookings'], queryFn: () => getBookings() });
  const { data: custData } = useQuery({ queryKey: ['customers-dropdown'], queryFn: () => getCustomers() });
  const { data: propData } = useQuery({ queryKey: ['props-dropdown'], queryFn: () => getAdminProperties({ limit: 200 }) });

  const totalPrice = watch('total_price');
  const discount = watch('discount') || 0;
  const finalPrice = (parseFloat(totalPrice || '0') - parseFloat(discount)).toFixed(2);

  const createMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => { toast.success('Booking created'); qc.invalidateQueries({ queryKey: ['bookings'] }); setShowForm(false); reset(); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error creating booking'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => updateBooking(id, data),
    onSuccess: () => {
      toast.success('Booking updated');
      qc.invalidateQueries({ queryKey: ['bookings'] });
      setEditingBooking(null);
      if (selected) {
        qc.invalidateQueries({ queryKey: ['booking-detail', selected.id] });
      }
    },
    onError: () => toast.error('Update failed'),
  });

  const paymentMutation = useMutation({
    mutationFn: ({ id, data }: any) => addPayment(id, data),
    onSuccess: () => {
      toast.success('Payment recorded');
      qc.invalidateQueries({ queryKey: ['bookings'] });
      if (selected) qc.invalidateQueries({ queryKey: ['booking-detail', selected.id] });
      setShowPayment(false);
      resetPay();
    },
    onError: () => toast.error('Payment failed'),
  });

  const bookings = data?.data || [];
  const customers = custData?.data || [];
  const properties = propData?.data || [];

  const viewBooking = async (b: any) => {
    setSelected(b);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold">Bookings</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2"><Plus size={16} />New Booking</button>
      </div>

      {/* New Booking Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 my-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">New Booking</h2>
              <button onClick={() => { setShowForm(false); reset(); }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-3">
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
                  {properties.map((p: any) => <option key={p.id} value={p.id}>{p.title} {p.code ? `(${p.code})` : ''}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Total Price (₹)</label>
                  <input {...register('total_price')} type="number" step="0.01" className="input" placeholder="0.00" />
                </div>
                <div>
                  <label className="label">Discount (₹)</label>
                  <input {...register('discount')} type="number" step="0.01" className="input" defaultValue={0} />
                </div>
              </div>
              {totalPrice && (
                <div className="bg-gray-50 p-3 rounded border text-sm">
                  <span className="text-gray-600">Final Price: </span>
                  <strong className="text-primary">{formatPrice(parseFloat(finalPrice))}</strong>
                </div>
              )}
              <div><label className="label">Booking Date</label><input {...register('booking_date')} type="date" className="input" /></div>
              <div><label className="label">Notes</label><textarea {...register('notes')} className="input" rows={2} /></div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1">
                  {createMutation.isPending ? 'Creating...' : 'Create Booking'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); reset(); }} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Edit Booking</h2>
              <button onClick={() => setEditingBooking(null)}><X size={18} /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target as HTMLFormElement);
              const d: any = Object.fromEntries(fd);
              updateMutation.mutate({ id: editingBooking.id, data: { ...editingBooking, ...d } });
            }} className="space-y-3">
              <div>
                <label className="label">Status</label>
                <select name="status" defaultValue={editingBooking.status} className="input">
                  {['pending', 'confirmed', 'completed', 'cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div><label className="label">Agreement Date</label><input name="agreement_date" type="date" defaultValue={editingBooking.agreement_date?.split('T')[0]} className="input" /></div>
              <div><label className="label">Notes</label><textarea name="notes" defaultValue={editingBooking.notes} className="input" rows={3} /></div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={updateMutation.isPending} className="btn-primary flex-1">
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditingBooking(null)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bookings Table */}
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
                    <td className="table-td font-mono text-xs font-bold">{b.booking_number}</td>
                    <td className="table-td font-medium">{b.customer_name}<div className="text-xs text-gray-400">{b.customer_mobile}</div></td>
                    <td className="table-td text-sm">{b.property_title}</td>
                    <td className="table-td font-bold text-primary">{formatPrice(b.final_price)}</td>
                    <td className="table-td">
                      <span className={`badge ${STATUS_COLORS[b.status] || 'badge-gray'}`}>{b.status}</span>
                    </td>
                    <td className="table-td text-xs text-gray-400">{b.booking_date ? new Date(b.booking_date).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="table-td">
                      <div className="flex gap-1">
                        <button onClick={() => viewBooking(b)} title="View" className="p-1.5 text-primary hover:bg-primary/10 rounded"><Eye size={15} /></button>
                        <button onClick={() => setEditingBooking(b)} title="Edit" className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"><Edit size={15} /></button>
                        <button onClick={() => { setSelected(b); setShowPayment(true); }} title="Add Payment" className="p-1.5 text-green-600 hover:bg-green-50 rounded"><CreditCard size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Booking Detail Modal */}
      {selected && !showPayment && !editingBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Booking: {selected.booking_number}</h2>
              <button onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between"><span className="text-gray-500">Customer:</span> <span className="font-medium">{selected.customer_name} ({selected.customer_mobile})</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Property:</span> <span className="font-medium">{selected.property_title}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Booking Date:</span> <span>{selected.booking_date ? new Date(selected.booking_date).toLocaleDateString('en-IN') : '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total Price:</span> <span>{formatPrice(selected.total_price)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Discount:</span> <span>{formatPrice(selected.discount)}</span></div>
              <div className="flex justify-between border-t pt-2"><span className="text-gray-500">Final Price:</span> <strong className="text-primary text-base">{formatPrice(selected.final_price)}</strong></div>
              <div className="flex justify-between"><span className="text-gray-500">Status:</span>
                <span className={`badge ${STATUS_COLORS[selected.status] || 'badge-gray'}`}>{selected.status}</span>
              </div>
              {selected.notes && <div className="bg-gray-50 rounded p-2 text-gray-600">{selected.notes}</div>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setShowPayment(true); }} className="btn-success flex-1 flex items-center justify-center gap-2"><CreditCard size={14} />Add Payment</button>
              <button onClick={() => setSelected(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {showPayment && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Record Payment</h2>
              <button onClick={() => { setShowPayment(false); resetPay(); }}><X size={18} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Booking: {selected.booking_number} | Final: {formatPrice(selected.final_price)}</p>
            <form onSubmit={handlePaySubmit((d) => paymentMutation.mutate({ id: selected.id, data: d }))} className="space-y-3">
              <div>
                <label className="label">Payment Type</label>
                <select {...regPay('payment_type', { required: true })} className="input">
                  <option value="">Select type</option>
                  {['Advance', 'Installment', 'Full Payment', 'Registration', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Amount (₹) *</label><input {...regPay('amount', { required: true })} type="number" step="0.01" className="input" /></div>
                <div><label className="label">Payment Date *</label><input {...regPay('payment_date', { required: true })} type="date" className="input" /></div>
              </div>
              <div>
                <label className="label">Payment Mode</label>
                <select {...regPay('payment_mode')} className="input">
                  <option value="">Select mode</option>
                  {['Cash', 'Cheque', 'NEFT/RTGS', 'UPI', 'Credit Card', 'Debit Card', 'Other'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div><label className="label">Reference Number</label><input {...regPay('reference_number')} className="input" placeholder="Cheque/Transaction no." /></div>
              <div><label className="label">Notes</label><textarea {...regPay('notes')} className="input" rows={2} /></div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={paymentMutation.isPending} className="btn-success flex-1">
                  {paymentMutation.isPending ? 'Saving...' : 'Record Payment'}
                </button>
                <button type="button" onClick={() => { setShowPayment(false); resetPay(); }} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
