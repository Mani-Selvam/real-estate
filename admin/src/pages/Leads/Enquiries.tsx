import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getContactEnquiries, getSiteVisits, markEnquiryRead } from '../../api/axios';
import { Mail, Calendar } from 'lucide-react';

export default function Enquiries() {
  const [tab, setTab] = useState<'contact' | 'sitevisit'>('contact');
  const qc = useQueryClient();

  const { data: contactData, isLoading: contactLoading } = useQuery({ queryKey: ['contact-enquiries'], queryFn: () => getContactEnquiries() });
  const { data: visitData, isLoading: visitLoading } = useQuery({ queryKey: ['site-visits'], queryFn: getSiteVisits });

  const readMutation = useMutation({
    mutationFn: markEnquiryRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contact-enquiries'] }),
  });

  const enquiries = contactData?.data || [];
  const visits = visitData?.data || [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Enquiries</h1>

      <div className="flex gap-3 border-b">
        <button onClick={() => setTab('contact')} className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${tab === 'contact' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <Mail size={16} />Contact Enquiries ({enquiries.length})
        </button>
        <button onClick={() => setTab('sitevisit')} className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${tab === 'sitevisit' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <Calendar size={16} />Site Visit Requests ({visits.length})
        </button>
      </div>

      {tab === 'contact' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b"><tr>
                <th className="table-th">Name</th>
                <th className="table-th">Contact</th>
                <th className="table-th">Subject</th>
                <th className="table-th">Message</th>
                <th className="table-th">Status</th>
                <th className="table-th">Date</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {contactLoading ? <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
                  : enquiries.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">No enquiries yet</td></tr>
                  : enquiries.map((e: any) => (
                    <tr key={e.id} className={`hover:bg-gray-50 ${!e.is_read ? 'bg-blue-50' : ''}`}>
                      <td className="table-td font-medium">{e.name}</td>
                      <td className="table-td text-xs">
                        {e.mobile && <div>{e.mobile}</div>}
                        {e.email && <div className="text-gray-400">{e.email}</div>}
                      </td>
                      <td className="table-td">{e.subject || '—'}</td>
                      <td className="table-td max-w-xs truncate text-gray-600 text-xs">{e.message}</td>
                      <td className="table-td">
                        {!e.is_read
                          ? <button onClick={() => readMutation.mutate(e.id)} className="badge badge-blue cursor-pointer hover:bg-blue-200">Unread</button>
                          : <span className="badge badge-gray">Read</span>}
                      </td>
                      <td className="table-td text-xs text-gray-400">{new Date(e.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'sitevisit' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b"><tr>
                <th className="table-th">Name</th>
                <th className="table-th">Mobile</th>
                <th className="table-th">Property</th>
                <th className="table-th">Preferred Date</th>
                <th className="table-th">Time</th>
                <th className="table-th">Status</th>
                <th className="table-th">Submitted</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {visitLoading ? <tr><td colSpan={7} className="text-center py-8">Loading...</td></tr>
                  : visits.length === 0 ? <tr><td colSpan={7} className="text-center py-8 text-gray-400">No site visit requests yet</td></tr>
                  : visits.map((v: any) => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="table-td font-medium">{v.name}</td>
                      <td className="table-td">{v.mobile}</td>
                      <td className="table-td text-xs">{v.property_title || '—'}</td>
                      <td className="table-td">{v.preferred_date ? new Date(v.preferred_date).toLocaleDateString('en-IN') : '—'}</td>
                      <td className="table-td">{v.preferred_time || '—'}</td>
                      <td className="table-td"><span className={`badge ${v.status === 'pending' ? 'badge-yellow' : 'badge-green'}`}>{v.status}</span></td>
                      <td className="table-td text-xs text-gray-400">{new Date(v.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
