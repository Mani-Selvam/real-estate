import { useQuery } from '@tanstack/react-query';
import { getSettings } from '../api/axios';

export default function Privacy() {
  const { data } = useQuery({ queryKey: ['settings'], queryFn: getSettings });
  const s = data?.data || {};

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="section-title mb-8">Privacy Policy</h1>
        <div className="bg-white rounded-xl shadow-sm border p-8 prose max-w-none text-gray-700 space-y-6">
          <p>This Privacy Policy describes how {s.company_name || 'Elite Realty'} collects, uses, and protects your personal information.</p>
          <h2 className="text-xl font-bold text-primary">Information We Collect</h2>
          <p>We collect information you provide when submitting enquiries, booking site visits, or contacting us including name, mobile, email, and property preferences.</p>
          <h2 className="text-xl font-bold text-primary">How We Use Your Information</h2>
          <p>Your information is used to respond to enquiries, schedule site visits, send property updates, and improve our services.</p>
          <h2 className="text-xl font-bold text-primary">Data Protection</h2>
          <p>We implement appropriate security measures to protect your personal information from unauthorized access, disclosure, or alteration.</p>
          <h2 className="text-xl font-bold text-primary">Contact</h2>
          <p>For privacy concerns, contact us at {s.company_email || 'info@eliterealty.com'}.</p>
        </div>
      </div>
    </div>
  );
}
