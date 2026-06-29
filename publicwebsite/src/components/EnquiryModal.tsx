import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { submitPropertyEnquiry } from '../api/axios';

interface Props {
  propertyId?: number;
  propertyTitle?: string;
  onClose: () => void;
}

export default function EnquiryModal({ propertyId, propertyTitle, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await submitPropertyEnquiry({ ...data, property_id: propertyId });
      toast.success('Enquiry submitted! We will contact you shortly.');
      onClose();
    } catch {
      toast.error('Failed to submit. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-primary">Property Enquiry</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-3">
          {propertyTitle && <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">Property: <strong>{propertyTitle}</strong></p>}
          <div>
            <label className="text-sm font-medium">Name *</label>
            <input {...register('name', { required: true })} className="input mt-1" placeholder="Your name" />
            {errors.name && <span className="text-red-500 text-xs">Required</span>}
          </div>
          <div>
            <label className="text-sm font-medium">Mobile *</label>
            <input {...register('mobile', { required: true })} className="input mt-1" placeholder="Mobile number" />
            {errors.mobile && <span className="text-red-500 text-xs">Required</span>}
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input {...register('email')} type="email" className="input mt-1" placeholder="Email address" />
          </div>
          <div>
            <label className="text-sm font-medium">Message</label>
            <textarea {...register('message')} className="input mt-1" rows={3} placeholder="Your message" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit Enquiry'}
          </button>
        </form>
      </div>
    </div>
  );
}
