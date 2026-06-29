import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSettings } from '../api/axios';
import { useState } from 'react';
import { subscribeNewsletter } from '../api/axios';
import toast from 'react-hot-toast';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Youtube, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
  const { data } = useQuery({ queryKey: ['settings'], queryFn: getSettings });
  const s = data?.data || {};
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await subscribeNewsletter(email);
      toast.success('Subscribed successfully!');
      setEmail('');
    } catch {
      toast.error('Something went wrong. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">{s.company_name || 'Elite Realty'}</h3>
            <div className="space-y-3 text-sm text-gray-300">
              {s.company_address && <p className="flex gap-2"><MapPin size={16} className="shrink-0 mt-0.5" />{s.company_address}</p>}
              {s.company_phone && <p className="flex gap-2"><Phone size={16} className="shrink-0" /><a href={`tel:${s.company_phone}`} className="hover:text-white">{s.company_phone}</a></p>}
              {s.company_email && <p className="flex gap-2"><Mail size={16} className="shrink-0" /><a href={`mailto:${s.company_email}`} className="hover:text-white">{s.company_email}</a></p>}
              {s.working_hours && <p className="flex gap-2"><Clock size={16} className="shrink-0" />{s.working_hours}</p>}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {[['/', 'Home'], ['/about', 'About Us'], ['/projects', 'Projects'], ['/properties', 'Properties'], ['/services', 'Services'], ['/contact', 'Contact']].map(([to, label]) => (
                <li key={to}><Link to={to} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Explore</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {[['/gallery', 'Gallery'], ['/testimonials', 'Testimonials'], ['/blog', 'Blog'], ['/faq', 'FAQ'], ['/privacy-policy', 'Privacy Policy'], ['/terms', 'Terms']].map(([to, label]) => (
                <li key={to}><Link to={to} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Newsletter</h3>
            <p className="text-sm text-gray-300 mb-3">Subscribe to get latest property updates.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Your email" className="flex-1 px-3 py-2 rounded text-gray-800 text-sm focus:outline-none" />
              <button type="submit" disabled={loading}
                className="bg-accent px-4 py-2 rounded text-sm font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50">
                {loading ? '...' : 'Go'}
              </button>
            </form>
            <div className="flex gap-3 mt-4">
              {s.social_facebook && <a href={s.social_facebook} target="_blank" rel="noopener noreferrer" className="hover:text-accent"><Facebook size={18} /></a>}
              {s.social_instagram && <a href={s.social_instagram} target="_blank" rel="noopener noreferrer" className="hover:text-accent"><Instagram size={18} /></a>}
              {s.social_twitter && <a href={s.social_twitter} target="_blank" rel="noopener noreferrer" className="hover:text-accent"><Twitter size={18} /></a>}
              {s.social_linkedin && <a href={s.social_linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-accent"><Linkedin size={18} /></a>}
              {s.social_youtube && <a href={s.social_youtube} target="_blank" rel="noopener noreferrer" className="hover:text-accent"><Youtube size={18} /></a>}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-blue-900 py-4 text-center text-sm text-gray-300">
        {s.footer_copyright || `© ${new Date().getFullYear()} Elite Realty. All rights reserved.`}
      </div>
    </footer>
  );
}
