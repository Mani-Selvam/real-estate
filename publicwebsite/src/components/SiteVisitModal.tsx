import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { submitSiteVisit } from '../api/axios';
import { useQuery } from '@tanstack/react-query';
import { getProperties } from '../api/axios';

interface Props { onClose: () => void; propertyId?: number; }

export default function SiteVisitModal({ onClose, propertyId }: Props) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { property_id: propertyId } });
  const { data: propsData } = useQuery({ queryKey: ['properties-list'], queryFn: () => getProperties({ limit: 100 }) });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await submitSiteVisit(data);
      toast.success('Site visit booked! We will confirm shortly.');
      onClose();
    } catch {
      toast.error('Failed to submit. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-primary">Book Site Visit</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-3">
          <div>
            <label className="text-sm font-medium">Name *</label>
            <input {...register('name', { required: true })} className="input mt-1" placeholder="Your name" />
            {errors.name && <span className="text-red-500 text-xs">Required</span>}
          </div>
          <div>
            <label className="text-sm font-medium">Mobile *</label>
            <input {...register('mobile', { required: true })} className="input mt-1" placeholder="Mobile number" />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input {...register('email')} type="email" className="input mt-1" placeholder="Email" />
          </div>
          <div>
            <label className="text-sm font-medium">Property</label>
            <select {...register('property_id')} className="input mt-1">
              <option value="">Select Property</option>
              {propsData?.data?.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Preferred Date</label>
            <input {...register('preferred_date')} type="date" className="input mt-1" min={new Date().toISOString().split('T')[0]} />
          </div>
          <div>
            <label className="text-sm font-medium">Preferred Time</label>
            <input {...register('preferred_time')} type="time" className="input mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Remarks</label>
            <textarea {...register('remarks')} className="input mt-1" rows={2} placeholder="Any specific requirements" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Booking...' : 'Book Site Visit'}
          </button>
        </form>
      </div>
    </div>
  );
}
