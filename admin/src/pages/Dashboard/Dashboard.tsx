import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Home, Building2, Calendar, TrendingUp, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#1B4F72', '#2E86C1', '#D4AC0D', '#27AE60', '#E74C3C'];

function StatCard({ icon: Icon, label, value, color, to }: any) {
  const card = (
    <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-800">{value?.toLocaleString() ?? 0}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );
  return to ? <Link to={to}>{card}</Link> : card;
}

export default function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard, refetchInterval: 30000 });
  const d = data?.data;

  if (isLoading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 animate-pulse bg-gray-200 rounded-lg" />)}
      </div>
    </div>
  );

  const stats = d?.stats || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Today's Leads" value={stats.today_leads} color="bg-blue-600" to="/leads" />
        <StatCard icon={Calendar} label="Today's Follow-ups" value={stats.today_followups} color="bg-yellow-500" to="/leads" />
        <StatCard icon={Home} label="Total Properties" value={stats.total_properties} color="bg-green-600" to="/properties" />
        <StatCard icon={Building2} label="Total Projects" value={stats.total_projects} color="bg-purple-600" to="/projects" />
        <StatCard icon={Phone} label="Total Leads" value={stats.total_leads} color="bg-primary" to="/leads" />
        <StatCard icon={Home} label="Available Properties" value={stats.available_properties} color="bg-teal-600" to="/properties" />
        <StatCard icon={Calendar} label="Total Bookings" value={stats.total_bookings} color="bg-orange-600" to="/bookings" />
        <StatCard icon={TrendingUp} label="Total Revenue" value={`₹${((stats.total_revenue || 0) / 100000).toFixed(1)}L`} color="bg-accent" to="/reports" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Leads */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-700 mb-4">Leads (Last 6 Months)</h2>
          {d?.monthly_leads?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={d.monthly_leads}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1B4F72" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-52 flex items-center justify-center text-gray-400">No data yet</div>}
        </div>

        {/* Leads by Source */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-700 mb-4">Leads by Source</h2>
          {d?.leads_by_source?.length > 0 ? (
            <div className="flex items-center gap-4">
              <PieChart width={160} height={160}>
                <Pie data={d.leads_by_source} dataKey="count" nameKey="source" cx="50%" cy="50%" outerRadius={70} label={false}>
                  {d.leads_by_source.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
              <div className="space-y-2">
                {d.leads_by_source.map((s: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="capitalize">{s.source}</span>
                    <span className="text-gray-500">({s.count})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="h-52 flex items-center justify-center text-gray-400">No data yet</div>}
        </div>
      </div>

      {/* Recent Leads */}
      {d?.recent_leads?.length > 0 && (
        <div className="card">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-bold text-gray-700">Recent Leads</h2>
            <Link to="/leads" className="text-primary text-sm hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr>
                <th className="table-th">Name</th>
                <th className="table-th">Mobile</th>
                <th className="table-th">Source</th>
                <th className="table-th">Property</th>
                <th className="table-th">Status</th>
                <th className="table-th">Date</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {d.recent_leads.map((l: any) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="table-td font-medium"><Link to={`/leads/${l.id}`} className="text-primary hover:underline">{l.name}</Link></td>
                    <td className="table-td">{l.mobile}</td>
                    <td className="table-td"><span className="badge-blue">{l.source}</span></td>
                    <td className="table-td">{l.property_title || '—'}</td>
                    <td className="table-td"><span className={`badge ${l.status === 'new' ? 'badge-blue' : l.status === 'closed' ? 'badge-green' : 'badge-yellow'}`}>{l.status}</span></td>
                    <td className="table-td text-gray-400">{new Date(l.created_at).toLocaleDateString('en-IN')}</td>
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
