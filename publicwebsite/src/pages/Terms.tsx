import { useQuery } from '@tanstack/react-query';
import { getSettings } from '../api/axios';

export default function Terms() {
  const { data } = useQuery({ queryKey: ['settings'], queryFn: getSettings });
  const s = data?.data || {};

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="section-title mb-8">Terms & Conditions</h1>
        <div className="bg-white rounded-xl shadow-sm border p-8 prose max-w-none text-gray-700 space-y-6">
          <p>By accessing and using the {s.company_name || 'Elite Realty'} website, you accept and agree to be bound by these Terms and Conditions.</p>
          <h2 className="text-xl font-bold text-primary">Property Information</h2>
          <p>All property details, prices, and availability are subject to change without notice. Information is provided for reference only and should be verified before making any decisions.</p>
          <h2 className="text-xl font-bold text-primary">Enquiries and Site Visits</h2>
          <p>Submitting an enquiry or booking a site visit does not constitute a binding agreement. All transactions are subject to formal agreement and documentation.</p>
          <h2 className="text-xl font-bold text-primary">Intellectual Property</h2>
          <p>All content on this website is the property of {s.company_name || 'Elite Realty'} and may not be reproduced without permission.</p>
          <h2 className="text-xl font-bold text-primary">Contact</h2>
          <p>For any queries, contact us at {s.company_email || 'info@eliterealty.com'}.</p>
        </div>
      </div>
    </div>
  );
}
