import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings, getStats, updateStats } from '../../api/axios';
import api from '../../api/axios';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Upload } from 'lucide-react';

export default function Settings() {
  const [tab, setTab] = useState('general');
  const logoRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();
  const { register, handleSubmit, reset } = useForm();
  const { register: sReg, handleSubmit: sSubmit, reset: sReset } = useForm();

  const { data: settingsData } = useQuery({ queryKey: ['settings'], queryFn: getSettings });
  const { data: statsData } = useQuery({ queryKey: ['stats-admin'], queryFn: getStats });

  useEffect(() => {
    if (settingsData?.data) reset(settingsData.data);
  }, [settingsData, reset]);

  useEffect(() => {
    if (statsData?.data) {
      const obj: any = {};
      statsData.data.forEach((s: any, i: number) => {
        obj[`stats_${i}_key`] = s.key;
        obj[`stats_${i}_label`] = s.label;
        obj[`stats_${i}_value`] = s.value;
      });
      sReset(obj);
    }
  }, [statsData, sReset]);

  const settingsMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => { toast.success('Settings saved!'); qc.invalidateQueries({ queryKey: ['settings'] }); },
    onError: () => toast.error('Save failed'),
  });

  const statsMutation = useMutation({
    mutationFn: (data: any) => {
      const stats = statsData?.data?.map((s: any, i: number) => ({
        key: s.key,
        label: data[`stats_${i}_label`],
        value: data[`stats_${i}_value`],
      })) || [];
      return updateStats(stats);
    },
    onSuccess: () => { toast.success('Stats updated!'); qc.invalidateQueries({ queryKey: ['stats-admin'] }); },
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const fd = new FormData();
    fd.append('logo', e.target.files[0]);
    try {
      await api.post('/settings/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Logo uploaded');
      qc.invalidateQueries({ queryKey: ['settings'] });
    } catch { toast.error('Upload failed'); }
  };

  const s = settingsData?.data || {};
  const stats = statsData?.data || [];

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-xl font-bold">Settings</h1>

      <div className="flex gap-3 border-b">
        {['general', 'social', 'stats'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors capitalize ${tab === t ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <form onSubmit={handleSubmit((d) => settingsMutation.mutate(d))} className="card p-6 space-y-4">
          {/* Logo */}
          <div>
            <label className="label">Company Logo</label>
            <div className="flex items-center gap-4">
              {s.company_logo ? <img src={s.company_logo} alt="Logo" className="h-12 object-contain border rounded p-1" /> : <div className="h-12 w-24 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-400">No logo</div>}
              <button type="button" onClick={() => logoRef.current?.click()} className="btn-secondary flex items-center gap-2"><Upload size={14} />Upload Logo</button>
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>
          </div>
          <div><label className="label">Company Name</label><input {...register('company_name')} className="input" /></div>
          <div><label className="label">Company Email</label><input {...register('company_email')} type="email" className="input" /></div>
          <div><label className="label">Company Phone</label><input {...register('company_phone')} className="input" /></div>
          <div><label className="label">Company Address</label><textarea {...register('company_address')} className="input" rows={2} /></div>
          <div><label className="label">Working Hours</label><input {...register('working_hours')} className="input" placeholder="Mon - Sat: 9AM - 7PM" /></div>
          <div><label className="label">Footer Copyright</label><input {...register('footer_copyright')} className="input" /></div>
          <button type="submit" disabled={settingsMutation.isPending} className="btn-primary px-8">{settingsMutation.isPending ? 'Saving...' : 'Save Settings'}</button>
        </form>
      )}

      {tab === 'social' && (
        <form onSubmit={handleSubmit((d) => settingsMutation.mutate(d))} className="card p-6 space-y-4">
          <div><label className="label">Facebook URL</label><input {...register('social_facebook')} type="url" className="input" placeholder="https://facebook.com/yourpage" /></div>
          <div><label className="label">Instagram URL</label><input {...register('social_instagram')} type="url" className="input" /></div>
          <div><label className="label">Twitter/X URL</label><input {...register('social_twitter')} type="url" className="input" /></div>
          <div><label className="label">LinkedIn URL</label><input {...register('social_linkedin')} type="url" className="input" /></div>
          <div><label className="label">YouTube URL</label><input {...register('social_youtube')} type="url" className="input" /></div>
          <button type="submit" disabled={settingsMutation.isPending} className="btn-primary px-8">Save Social Links</button>
        </form>
      )}

      {tab === 'stats' && (
        <form onSubmit={sSubmit((d) => statsMutation.mutate(d))} className="card p-6 space-y-4">
          <p className="text-sm text-gray-500">These statistics are displayed on the home page.</p>
          {stats.map((s: any, i: number) => (
            <div key={s.key} className="flex gap-3 items-center">
              <div className="flex-1"><label className="label text-xs">Label</label><input {...sReg(`stats_${i}_label`)} className="input" /></div>
              <div className="w-32"><label className="label text-xs">Value</label><input {...sReg(`stats_${i}_value`)} className="input" /></div>
            </div>
          ))}
          <button type="submit" disabled={statsMutation.isPending} className="btn-primary px-8">Update Stats</button>
        </form>
      )}
    </div>
  );
}
