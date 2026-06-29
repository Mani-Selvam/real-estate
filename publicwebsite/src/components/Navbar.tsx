import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSettings } from '../api/axios';
import { Menu, X, Phone } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data } = useQuery({ queryKey: ['settings'], queryFn: getSettings });
  const s = data?.data || {};

  const links = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/projects', label: 'Projects' },
    { to: '/properties', label: 'Properties' },
    { to: '/services', label: 'Services' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/blog', label: 'Blog' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            {s.company_logo
              ? <img src={s.company_logo} alt="Logo" className="h-10 object-contain" />
              : <span className="text-xl font-bold text-primary">{s.company_name || 'Elite Realty'}</span>
            }
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'}
                className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {s.company_phone && (
              <a href={`tel:${s.company_phone}`} className="flex items-center gap-1 text-sm text-primary font-medium">
                <Phone size={14} /> {s.company_phone}
              </a>
            )}
            <Link to="/contact" className="btn-primary text-sm py-2 px-4">Enquire Now</Link>
          </div>

          <button className="lg:hidden" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-white border-t px-4 pb-4">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `block py-2 text-sm font-medium ${isActive ? 'text-primary' : 'text-gray-700'}`}>
              {l.label}
            </NavLink>
          ))}
          <Link to="/contact" className="btn-primary block text-center mt-3 text-sm py-2">Enquire Now</Link>
        </div>
      )}
    </header>
  );
}
