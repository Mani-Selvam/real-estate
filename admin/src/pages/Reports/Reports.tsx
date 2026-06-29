import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboard, getLeadsReport, getRevenueReport, getNewsletter } from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';

function formatPrice(p: number) {
  if (!p) return '₹0';
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(2)} L`;
  return `₹${p.toLocaleString()}`;
}

export default function Reports() {
  const [tab, setTab] = useState('leads');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { data: leadsData } = useQuery({ queryKey: ['leads-report', from, to], queryFn: () => getLeadsReport({ from: from || undefined, to: to || undefined }), enabled: tab === 'leads' });
  const { data: revenueData } = useQuery({ queryKey: ['revenue-report'], queryFn: getRevenueReport, enabled: tab === 'revenue' });
  const { data: dashData } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });
  const { data: newsletterData } = useQuery({ queryKey: ['newsletter'], queryFn: getNewsletter, enabled: tab === 'newsletter' });

  const leads = leadsData?.data || [];
  const payments = revenueData?.data || [];
  const newsletter = newsletterData?.data || [];
  const stats = dashData?.data?.stats || {};
  const monthlyLeads = dashData?.data?.monthly_leads || [];

  const exportCSV = (data: any[], filename: string) => {
    if (!data || !data.length) { alert('No data to export'); return; }
    const safeKeys = Object.keys(data[0]);
    const headers = safeKeys.join(',');
    const rows = data.map(r => safeKeys.map(k => `"${(r[k] ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Reports</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: stats.total_leads || 0 },
          { label: 'Total Bookings', value: stats.total_bookings || 0 },
          { label: 'Total Revenue', value: formatPrice(stats.total_revenue || 0) },
          { label: 'Properties Live', value: stats.total_properties || 0 },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <div className="text-2xl font-bold text-primary">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Monthly Chart */}
      {monthlyLeads.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Monthly Leads Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyLeads}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#1B4F72" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabs */}
      <div>
        <div className="flex gap-3 border-b mb-4">
          {['leads', 'revenue', 'newsletter'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors capitalize ${tab === t ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'leads' && (
          <div className="space-y-3">
            <div className="flex gap-3 flex-wrap items-end">
              <div><label className="label text-xs">From</label><input type="date" value={from} onChange={e => setFrom(e.target.value)} className="input" /></div>
              <div><label className="label text-xs">To</label><input type="date" value={to} onChange={e => setTo(e.target.value)} className="input" /></div>
              <button onClick={() => exportCSV(leads, 'leads-report')} className="btn-secondary flex items-center gap-2"><Download size={14} />Export CSV</button>
              <span className="text-sm text-gray-500">{leads.length} leads</span>
            </div>
            <div className="card overflow-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0"><tr>
                  <th className="table-th">Name</th><th className="table-th">Mobile</th><th className="table-th">Source</th><th className="table-th">Status</th><th className="table-th">Property</th><th className="table-th">Date</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">No leads</td></tr>
                    : leads.map((l: any) => (
                      <tr key={l.id}><td className="table-td font-medium">{l.name}</td><td className="table-td">{l.mobile}</td><td className="table-td"><span className="badge-blue">{l.source}</span></td><td className="table-td"><span className="badge-yellow">{l.status}</span></td><td className="table-td text-xs">{l.property_title || '—'}</td><td className="table-td text-xs text-gray-400">{new Date(l.created_at).toLocaleDateString('en-IN')}</td></tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'revenue' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total: <strong className="text-primary">{formatPrice(revenueData?.total_revenue || 0)}</strong></span>
              <button onClick={() => exportCSV(payments, 'revenue-report')} className="btn-secondary flex items-center gap-2"><Download size={14} />Export</button>
            </div>
            <div className="card overflow-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0"><tr>
                  <th className="table-th">Booking #</th><th className="table-th">Customer</th><th className="table-th">Property</th><th className="table-th">Amount</th><th className="table-th">Mode</th><th className="table-th">Date</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">No payments</td></tr>
                    : payments.map((p: any) => (
                      <tr key={p.id}><td className="table-td font-mono text-xs">{p.booking_number}</td><td className="table-td">{p.customer_name}</td><td className="table-td text-xs">{p.property_title}</td><td className="table-td font-bold text-green-600">{formatPrice(p.amount)}</td><td className="table-td text-xs">{p.payment_mode}</td><td className="table-td text-xs text-gray-400">{p.payment_date ? new Date(p.payment_date).toLocaleDateString('en-IN') : '—'}</td></tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'newsletter' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">{newsletter.length} subscribers</span>
              <button onClick={() => exportCSV(newsletter, 'newsletter')} className="btn-secondary flex items-center gap-2"><Download size={14} />Export CSV</button>
            </div>
            <div className="card overflow-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0"><tr><th className="table-th">Email</th><th className="table-th">Subscribed</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {newsletter.length === 0 ? <tr><td colSpan={2} className="text-center py-8 text-gray-400">No subscribers</td></tr>
                    : newsletter.map((n: any) => (
                      <tr key={n.id}><td className="table-td">{n.email}</td><td className="table-td text-xs text-gray-400">{new Date(n.created_at).toLocaleDateString('en-IN')}</td></tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
