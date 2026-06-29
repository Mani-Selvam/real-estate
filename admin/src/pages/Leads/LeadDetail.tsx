import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLead, updateLead, addLeadNote, addFollowup } from '../../api/axios';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ArrowLeft, Phone, Mail, MessageSquare, Calendar, Edit } from 'lucide-react';

const STATUSES = ['new', 'contacted', 'follow-up', 'qualified', 'lost', 'closed'];

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [showFollowup, setShowFollowup] = useState(false);
  const { register: fReg, handleSubmit: fSubmit, reset: fReset } = useForm();

  const { data, isLoading } = useQuery({ queryKey: ['lead', id], queryFn: () => getLead(Number(id)) });
  const lead = data?.data;

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateLead(Number(id), { ...lead, status }),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries({ queryKey: ['lead', id] }); },
  });

  const noteMutation = useMutation({
    mutationFn: (note: string) => addLeadNote(Number(id), note),
    onSuccess: () => { toast.success('Note added'); qc.invalidateQueries({ queryKey: ['lead', id] }); setNoteText(''); setAddingNote(false); },
    onError: () => toast.error('Failed'),
  });

  const followupMutation = useMutation({
    mutationFn: (data: any) => addFollowup(Number(id), data),
    onSuccess: () => { toast.success('Follow-up scheduled'); qc.invalidateQueries({ queryKey: ['lead', id] }); setShowFollowup(false); fReset(); },
  });

  if (isLoading) return <div className="text-center py-16">Loading...</div>;
  if (!lead) return <div className="text-center py-16">Lead not found</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => navigate('/leads')} className="p-2 hover:bg-gray-100 rounded"><ArrowLeft size={18} /></button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{lead.name}</h1>
          <p className="text-sm text-gray-500">Lead #{lead.id} · {new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
        <Link to={`/leads/${id}/edit`} className="btn-secondary flex items-center gap-2"><Edit size={14} />Edit</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5 grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-400 uppercase mb-1">Status</div>
              <select value={lead.status} onChange={e => statusMutation.mutate(e.target.value)} className="input">
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div><div className="text-xs text-gray-400 uppercase mb-1">Source</div><span className="badge-blue">{lead.source}</span></div>
            <div className="flex items-center gap-2 text-sm"><Phone size={14} className="text-gray-400" /><a href={`tel:${lead.mobile}`} className="text-primary hover:underline">{lead.mobile}</a></div>
            {lead.email && <div className="flex items-center gap-2 text-sm"><Mail size={14} className="text-gray-400" /><a href={`mailto:${lead.email}`} className="text-primary hover:underline">{lead.email}</a></div>}
            {lead.property_title && <div><div className="text-xs text-gray-400 mb-1">Interested Property</div><div className="text-sm font-medium">{lead.property_title}</div></div>}
            {lead.project_name && <div><div className="text-xs text-gray-400 mb-1">Project</div><div className="text-sm font-medium">{lead.project_name}</div></div>}
            {lead.assigned_name && <div><div className="text-xs text-gray-400 mb-1">Assigned To</div><div className="text-sm font-medium">{lead.assigned_name}</div></div>}
            {lead.notes && <div className="col-span-2"><div className="text-xs text-gray-400 mb-1">Initial Notes</div><p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{lead.notes}</p></div>}
          </div>

          {/* Timeline */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Activity Timeline</h2>
              <button onClick={() => setAddingNote(!addingNote)} className="btn-secondary flex items-center gap-1"><MessageSquare size={14} />Add Note</button>
            </div>
            {addingNote && (
              <div className="mb-4 flex gap-2">
                <textarea value={noteText} onChange={e => setNoteText(e.target.value)} className="input flex-1" rows={2} placeholder="Write a note..." />
                <div className="flex flex-col gap-2">
                  <button onClick={() => noteMutation.mutate(noteText)} disabled={!noteText || noteMutation.isPending} className="btn-primary text-xs">Save</button>
                  <button onClick={() => setAddingNote(false)} className="btn-secondary text-xs">Cancel</button>
                </div>
              </div>
            )}
            <div className="space-y-4">
              {lead.timeline?.length === 0 ? <p className="text-gray-400 text-sm">No activity yet</p>
                : lead.timeline?.map((t: any) => (
                  <div key={t.id} className="flex gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0" />
                    <div>
                      <div className="text-sm font-medium">{t.action}</div>
                      {t.note && <p className="text-xs text-gray-600 mt-0.5">{t.note}</p>}
                      <div className="text-xs text-gray-400 mt-1">{t.created_by_name && `${t.created_by_name} · `}{new Date(t.created_at).toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right: Follow-ups */}
        <div>
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Follow-ups</h2>
              <button onClick={() => setShowFollowup(!showFollowup)} className="btn-primary flex items-center gap-1 text-xs"><Calendar size={12} />Schedule</button>
            </div>
            {showFollowup && (
              <form onSubmit={fSubmit((d) => followupMutation.mutate(d))} className="mb-4 space-y-2 border p-3 rounded bg-gray-50">
                <div><label className="label text-xs">Date *</label><input {...fReg('follow_up_date', { required: true })} type="date" className="input" min={new Date().toISOString().split('T')[0]} /></div>
                <div><label className="label text-xs">Time</label><input {...fReg('follow_up_time')} type="time" className="input" /></div>
                <div><label className="label text-xs">Notes</label><textarea {...fReg('notes')} className="input" rows={2} placeholder="Follow-up notes" /></div>
                <button type="submit" disabled={followupMutation.isPending} className="btn-primary text-xs w-full">Schedule</button>
              </form>
            )}
            <div className="space-y-3">
              {lead.followups?.length === 0 ? <p className="text-sm text-gray-400">No follow-ups scheduled</p>
                : lead.followups?.map((f: any) => (
                  <div key={f.id} className={`border rounded p-3 ${f.status === 'pending' ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}`}>
                    <div className="text-sm font-medium">{new Date(f.follow_up_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                    {f.follow_up_time && <div className="text-xs text-gray-500">{f.follow_up_time}</div>}
                    {f.notes && <p className="text-xs text-gray-600 mt-1">{f.notes}</p>}
                    <span className={`badge mt-2 ${f.status === 'pending' ? 'badge-yellow' : 'badge-green'}`}>{f.status}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
