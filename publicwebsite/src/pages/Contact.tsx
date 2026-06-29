import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { getSettings, submitContact } from '../api/axios';
import toast from 'react-hot-toast';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { data } = useQuery({ queryKey: ['settings'], queryFn: getSettings });
  const s = data?.data || {};

  const onSubmit = async (formData: any) => {
    setLoading(true);
    try {
      await submitContact(formData);
      toast.success('Message sent! We will get back to you shortly.');
      reset();
    } catch {
      toast.error('Failed to send. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="section-title">Contact Us</h1>
          <p className="text-gray-600">Get in touch with our team</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div>
            <h2 className="text-xl font-bold text-primary mb-6">Get In Touch</h2>
            <div className="space-y-6">
              {s.company_address && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><MapPin size={20} className="text-primary" /></div>
                  <div><h3 className="font-semibold mb-1">Address</h3><p className="text-gray-600 text-sm">{s.company_address}</p></div>
                </div>
              )}
              {s.company_phone && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><Phone size={20} className="text-primary" /></div>
                  <div><h3 className="font-semibold mb-1">Phone</h3><a href={`tel:${s.company_phone}`} className="text-gray-600 text-sm hover:text-primary">{s.company_phone}</a></div>
                </div>
              )}
              {s.company_email && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><Mail size={20} className="text-primary" /></div>
                  <div><h3 className="font-semibold mb-1">Email</h3><a href={`mailto:${s.company_email}`} className="text-gray-600 text-sm hover:text-primary">{s.company_email}</a></div>
                </div>
              )}
              {s.working_hours && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><Clock size={20} className="text-primary" /></div>
                  <div><h3 className="font-semibold mb-1">Working Hours</h3><p className="text-gray-600 text-sm">{s.working_hours}</p></div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-8 border">
            <h2 className="text-xl font-bold text-primary mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Name *</label>
                <input {...register('name', { required: true })} className="input" placeholder="Your full name" />
                {errors.name && <span className="text-red-500 text-xs">Name is required</span>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Mobile</label>
                  <input {...register('mobile')} className="input" placeholder="Mobile number" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Email</label>
                  <input {...register('email')} type="email" className="input" placeholder="Email address" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Subject</label>
                <input {...register('subject')} className="input" placeholder="Message subject" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Message *</label>
                <textarea {...register('message', { required: true })} className="input" rows={5} placeholder="Your message..." />
                {errors.message && <span className="text-red-500 text-xs">Message is required</span>}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
