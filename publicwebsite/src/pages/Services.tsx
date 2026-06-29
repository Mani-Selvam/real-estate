import { useQuery } from '@tanstack/react-query';
import { getServices } from '../api/axios';

export default function Services() {
  const { data, isLoading } = useQuery({ queryKey: ['services'], queryFn: getServices });
  const services = data?.data || [];

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12"><h1 className="section-title">Our Services</h1><p className="text-gray-600">Comprehensive real estate solutions tailored for you</p></div>
        {isLoading ? <div className="text-center py-16">Loading...</div> : services.length === 0 ? (
          <p className="text-center text-gray-500 py-16">No services listed yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s: any) => (
              <div key={s.id} className="bg-white rounded-xl shadow-sm border p-8 text-center hover:shadow-md transition-shadow">
                {s.icon && <div className="text-5xl mb-4">{s.icon}</div>}
                {s.image && <img src={s.image} alt={s.title} className="w-16 h-16 object-contain mx-auto mb-4" />}
                <h3 className="text-xl font-bold text-primary mb-3">{s.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
