import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export default api;

// ─── Settings ────────────────────────────────────────────────────────────────
export const getSettings = () => api.get('/settings').then(r => r.data);
export const getStats = () => api.get('/settings/stats').then(r => r.data);

// ─── Banners ─────────────────────────────────────────────────────────────────
export const getBanners = () => api.get('/cms/banners').then(r => r.data);

// ─── Projects ────────────────────────────────────────────────────────────────
export const getProjects = (params?: object) => api.get('/projects', { params }).then(r => r.data);
export const getProject = (id: string | number) => api.get(`/projects/${id}`).then(r => r.data);

// ─── Properties ──────────────────────────────────────────────────────────────
export const getProperties = (params?: object) => api.get('/properties', { params }).then(r => r.data);
export const getProperty = (id: string | number) => api.get(`/properties/${id}`).then(r => r.data);

// ─── CMS ─────────────────────────────────────────────────────────────────────
export const getServices = () => api.get('/cms/services').then(r => r.data);
export const getGallery = (category?: string) => api.get('/cms/gallery', { params: { category } }).then(r => r.data);
export const getTestimonials = () => api.get('/cms/testimonials').then(r => r.data);
export const getFaqs = () => api.get('/cms/faqs').then(r => r.data);
export const getBlog = (params?: object) => api.get('/cms/blog', { params }).then(r => r.data);
export const getBlogPost = (slug: string) => api.get(`/cms/blog/${slug}`).then(r => r.data);

// ─── Enquiries ───────────────────────────────────────────────────────────────
export const submitPropertyEnquiry = (data: object) => api.post('/enquiries/property', data).then(r => r.data);
export const submitSiteVisit = (data: object) => api.post('/enquiries/site-visit', data).then(r => r.data);
export const submitContact = (data: object) => api.post('/enquiries/contact', data).then(r => r.data);
export const subscribeNewsletter = (email: string) => api.post('/newsletter/subscribe', { email }).then(r => r.data);
