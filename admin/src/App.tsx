import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import ProjectsList from './pages/Projects/ProjectsList';
import ProjectForm from './pages/Projects/ProjectForm';
import PropertiesList from './pages/Properties/PropertiesList';
import PropertyForm from './pages/Properties/PropertyForm';
import LeadsList from './pages/Leads/LeadsList';
import LeadDetail from './pages/Leads/LeadDetail';
import LeadForm from './pages/Leads/LeadForm';
import Enquiries from './pages/Leads/Enquiries';
import Bookings from './pages/Bookings/Bookings';
import Customers from './pages/Bookings/Customers';
import CMSBanners from './pages/CMS/CMSBanners';
import CMSServices from './pages/CMS/CMSServices';
import CMSGallery from './pages/CMS/CMSGallery';
import CMSTestimonials from './pages/CMS/CMSTestimonials';
import CMSFaqs from './pages/CMS/CMSFaqs';
import CMSBlog from './pages/CMS/CMSBlog';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import Newsletter from './pages/Settings/Newsletter';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('admin_token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<ProjectsList />} />
          <Route path="projects/new" element={<ProjectForm />} />
          <Route path="projects/:id/edit" element={<ProjectForm />} />
          <Route path="properties" element={<PropertiesList />} />
          <Route path="properties/new" element={<PropertyForm />} />
          <Route path="properties/:id/edit" element={<PropertyForm />} />
          <Route path="leads" element={<LeadsList />} />
          <Route path="leads/new" element={<LeadForm />} />
          <Route path="leads/:id" element={<LeadDetail />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="customers" element={<Customers />} />
          <Route path="cms/banners" element={<CMSBanners />} />
          <Route path="cms/services" element={<CMSServices />} />
          <Route path="cms/gallery" element={<CMSGallery />} />
          <Route path="cms/testimonials" element={<CMSTestimonials />} />
          <Route path="cms/faqs" element={<CMSFaqs />} />
          <Route path="cms/blog" element={<CMSBlog />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="newsletter" element={<Newsletter />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
