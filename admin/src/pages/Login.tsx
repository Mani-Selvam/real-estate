import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { login } from '../api/axios';
import toast from 'react-hot-toast';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Redirect if already logged in
  if (localStorage.getItem('admin_token')) { navigate('/dashboard'); return null; }

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await login(data.email, data.password);
      localStorage.setItem('admin_token', res.token);
      localStorage.setItem('admin_user', JSON.stringify(res.user));
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">Elite Realty</h1>
          <p className="text-gray-500 text-sm mt-1">Admin CRM Portal</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Email Address</label>
            <input {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
              type="email" className="input" placeholder="admin@realestate.com" autoComplete="email" />
            {errors.email && <span className="text-red-500 text-xs">Valid email required</span>}
          </div>
          <div>
            <label className="label">Password</label>
            <input {...register('password', { required: true })}
              type="password" className="input" placeholder="Enter password" autoComplete="current-password" />
            {errors.password && <span className="text-red-500 text-xs">Password required</span>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-6">Contact your administrator for login credentials.</p>
      </div>
    </div>
  );
}
