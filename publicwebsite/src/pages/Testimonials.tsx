import { useQuery } from '@tanstack/react-query';
import { getTestimonials } from '../api/axios';
import { Star } from 'lucide-react';

export default function Testimonials() {
  const { data, isLoading } = useQuery({ queryKey: ['testimonials'], queryFn: getTestimonials });
  const testimonials = data?.data || [];

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12"><h1 className="section-title">Client Testimonials</h1><p className="text-gray-600">What our clients say about us</p></div>
        {isLoading ? <div className="text-center py-16">Loading...</div> : testimonials.length === 0 ? (
          <p className="text-center text-gray-500 py-16">No testimonials yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t: any) => (
              <div key={t.id} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex text-yellow-400 mb-3">{Array.from({ length: t.rating || 5 }).map((_, i) => <Star key={i} size={18} fill="currentColor" />)}</div>
                <p className="text-gray-600 text-sm mb-5 italic">"{t.message}"</p>
                <div className="flex items-center gap-3">
                  {t.avatar ? <img src={t.avatar} alt={t.customer_name} className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">{t.customer_name[0]}</div>}
                  <div>
                    <div className="font-semibold">{t.customer_name}</div>
                    {t.designation && <div className="text-xs text-gray-500">{t.designation}{t.company ? `, ${t.company}` : ''}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
