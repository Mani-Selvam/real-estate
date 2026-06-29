import { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Home, Users, Phone, Calendar, BookOpen,
  Image, MessageSquare, HelpCircle, Newspaper, BarChart2, Settings,
  Menu, X, LogOut, ChevronDown, ChevronRight, Mail
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: Building2, label: 'Projects', to: '/projects' },
  { icon: Home, label: 'Properties', to: '/properties' },
  {
    icon: Users, label: 'Leads & CRM', children: [
      { label: 'All Leads', to: '/leads' },
      { label: 'Enquiries', to: '/enquiries' },
      { label: 'Customers', to: '/customers' },
      { label: 'Bookings', to: '/bookings' },
    ]
  },
  {
    icon: Image, label: 'CMS', children: [
      { label: 'Banners', to: '/cms/banners' },
      { label: 'Services', to: '/cms/services' },
      { label: 'Gallery', to: '/cms/gallery' },
      { label: 'Testimonials', to: '/cms/testimonials' },
      { label: 'FAQs', to: '/cms/faqs' },
      { label: 'Blog', to: '/cms/blog' },
    ]
  },
  { icon: BarChart2, label: 'Reports', to: '/reports' },
  { icon: Mail, label: 'Newsletter', to: '/newsletter' },
  { icon: Settings, label: 'Settings', to: '/settings' },
];

function NavItem({ item, onClose }: { item: any; onClose?: () => void }) {
  const [open, setOpen] = useState(false);

  if (item.children) {
    return (
      <div>
        <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors text-sm">
          <span className="flex items-center gap-3"><item.icon size={18} />{item.label}</span>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {open && (
          <div className="ml-7 mt-1 space-y-1">
            {item.children.map((c: any) => (
              <NavLink key={c.to} to={c.to} onClick={onClose}
                className={({ isActive }) => `block px-3 py-1.5 rounded text-xs transition-colors ${isActive ? 'bg-accent text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
                {c.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink to={item.to} onClick={onClose}
      className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-accent text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
      <item.icon size={18} />{item.label}
    </NavLink>
  );
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/login');
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`bg-primary h-full flex flex-col ${mobile ? '' : 'w-60'}`}>
      <div className="p-4 border-b border-white/20 flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-lg">Elite Realty</h1>
          <p className="text-xs text-gray-400">Admin CRM</p>
        </div>
        {mobile && <button onClick={() => setSidebarOpen(false)} className="text-gray-400"><X size={20} /></button>}
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => <NavItem key={item.label} item={item} onClose={() => setSidebarOpen(false)} />)}
      </nav>
      <div className="p-3 border-t border-white/20">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">{user.name?.[0] || 'A'}</div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">{user.name || 'Admin'}</div>
            <div className="text-gray-400 text-xs truncate">{user.role}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-colors">
          <LogOut size={16} />Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-60 flex-shrink-0"><Sidebar mobile /></div>
          <div className="flex-1 bg-black/60" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden"><Menu size={20} /></button>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-600 hidden sm:block">Welcome, {user.name || 'Admin'}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
