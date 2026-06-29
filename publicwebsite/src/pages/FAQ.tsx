import { useQuery } from '@tanstack/react-query';
import { getFaqs } from '../api/axios';

export default function FAQ() {
  const { data, isLoading } = useQuery({ queryKey: ['faqs'], queryFn: getFaqs });
  const faqs = data?.data || [];
  const categories = [...new Set(faqs.map((f: any) => f.category).filter(Boolean))];

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12"><h1 className="section-title">Frequently Asked Questions</h1><p className="text-gray-600">Find answers to common questions</p></div>
        {isLoading ? <div className="text-center py-16">Loading...</div> : (
          <>
            {categories.length > 0 ? categories.map(cat => (
              <div key={cat} className="mb-8">
                <h2 className="text-lg font-bold text-primary mb-4 border-b pb-2">{cat}</h2>
                <div className="space-y-3">{faqs.filter((f: any) => f.category === cat).map((f: any) => (
                  <details key={f.id} className="bg-white rounded-lg shadow-sm p-4 group border">
                    <summary className="font-semibold cursor-pointer text-gray-800 list-none flex justify-between items-center">
                      {f.question}<span className="text-gray-400 group-open:rotate-180 transition-transform text-sm">▼</span>
                    </summary>
                    <p className="text-gray-600 text-sm mt-3 leading-relaxed">{f.answer}</p>
                  </details>
                ))}</div>
              </div>
            )) : (
              <div className="space-y-3">{faqs.map((f: any) => (
                <details key={f.id} className="bg-white rounded-lg shadow-sm p-4 group border">
                  <summary className="font-semibold cursor-pointer text-gray-800 list-none flex justify-between items-center">
                    {f.question}<span className="text-gray-400 group-open:rotate-180 transition-transform text-sm">▼</span>
                  </summary>
                  <p className="text-gray-600 text-sm mt-3 leading-relaxed">{f.answer}</p>
                </details>
              ))}</div>
            )}
            {faqs.length === 0 && <p className="text-center text-gray-500 py-8">No FAQs yet.</p>}
          </>
        )}
      </div>
    </div>
  );
}
