import { useQuery } from '@tanstack/react-query';
import { getSettings, getStats } from '../api/axios';

export default function About() {
  const { data: settingsData } = useQuery({ queryKey: ['settings'], queryFn: getSettings });
  const { data: statsData } = useQuery({ queryKey: ['stats'], queryFn: getStats });
  const s = settingsData?.data || {};
  const stats = statsData?.data || [];

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12"><h1 className="section-title">About Us</h1></div>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">{s.company_name || 'Elite Realty'}</h2>
            <p className="text-gray-600 leading-relaxed mb-4">Welcome to {s.company_name || 'Elite Realty'}, your trusted partner in real estate. We are committed to helping you find the perfect property that meets your needs and budget.</p>
            <p className="text-gray-600 leading-relaxed">Our team of experienced professionals is dedicated to providing you with the highest level of service, ensuring a smooth and hassle-free property buying experience.</p>
          </div>
          {stats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {stats.map((stat: any) => (
                <div key={stat.key} className="bg-primary text-white rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold mb-1">{stat.value}+</div>
                  <div className="text-sm text-gray-200">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[['Our Mission', 'To provide exceptional real estate services with integrity, transparency, and professionalism, making your property journey memorable.'],
              ['Our Vision', 'To become the most trusted real estate brand, known for quality, reliability, and customer satisfaction across the region.'],
              ['Our Values', 'Integrity, Innovation, Customer First, Excellence, and Community — these values guide every decision we make.']
            ].map(([title, desc]) => (
              <div key={title} className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-bold text-primary text-lg mb-3">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
