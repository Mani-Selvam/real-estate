import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── Auth ────────────────────────────────────────────────────────────────────
export const login = (email: string, password: string) => api.post('/auth/login', { email, password }).then(r => r.data);
export const getMe = () => api.get('/auth/me').then(r => r.data);

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const getDashboard = () => api.get('/reports/dashboard').then(r => r.data);

// ─── Projects ────────────────────────────────────────────────────────────────
export const getAdminProjects = (params?: object) => api.get('/projects/admin', { params }).then(r => r.data);
export const getProject = (id: number) => api.get(`/projects/${id}`).then(r => r.data);
export const createProject = (data: object) => api.post('/projects', data).then(r => r.data);
export const updateProject = (id: number, data: object) => api.put(`/projects/${id}`, data).then(r => r.data);
export const deleteProject = (id: number) => api.delete(`/projects/${id}`).then(r => r.data);
export const uploadProjectImages = (id: number, files: FormData) => api.post(`/projects/${id}/gallery`, files, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
export const deleteProjectImage = (id: number, imgId: number) => api.delete(`/projects/${id}/gallery/${imgId}`).then(r => r.data);

// ─── Properties ──────────────────────────────────────────────────────────────
export const getAdminProperties = (params?: object) => api.get('/properties/admin', { params }).then(r => r.data);
export const getProperty = (id: number) => api.get(`/properties/${id}`).then(r => r.data);
export const createProperty = (data: object) => api.post('/properties', data).then(r => r.data);
export const updateProperty = (id: number, data: object) => api.put(`/properties/${id}`, data).then(r => r.data);
export const deleteProperty = (id: number) => api.delete(`/properties/${id}`).then(r => r.data);
export const uploadPropertyImages = (id: number, files: FormData) => api.post(`/properties/${id}/images`, files, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
export const deletePropertyImage = (id: number, imgId: number) => api.delete(`/properties/${id}/images/${imgId}`).then(r => r.data);

// ─── Leads ───────────────────────────────────────────────────────────────────
export const getLeads = (params?: object) => api.get('/leads', { params }).then(r => r.data);
export const getLead = (id: number) => api.get(`/leads/${id}`).then(r => r.data);
export const createLead = (data: object) => api.post('/leads', data).then(r => r.data);
export const updateLead = (id: number, data: object) => api.put(`/leads/${id}`, data).then(r => r.data);
export const deleteLead = (id: number) => api.delete(`/leads/${id}`).then(r => r.data);
export const addLeadNote = (id: number, note: string) => api.post(`/leads/${id}/notes`, { note }).then(r => r.data);
export const addFollowup = (id: number, data: object) => api.post(`/leads/${id}/followups`, data).then(r => r.data);
export const getTodayFollowups = () => api.get('/leads/followups/today').then(r => r.data);

// ─── Enquiries ───────────────────────────────────────────────────────────────
export const getContactEnquiries = (params?: object) => api.get('/enquiries/contact', { params }).then(r => r.data);
export const getSiteVisits = () => api.get('/enquiries/site-visits').then(r => r.data);
export const markEnquiryRead = (id: number) => api.put(`/enquiries/contact/${id}/read`).then(r => r.data);

// ─── CMS ─────────────────────────────────────────────────────────────────────
export const getAllBanners = () => api.get('/cms/banners/all').then(r => r.data);
export const createBanner = (data: object) => api.post('/cms/banners', data).then(r => r.data);
export const updateBanner = (id: number, data: object) => api.put(`/cms/banners/${id}`, data).then(r => r.data);
export const deleteBanner = (id: number) => api.delete(`/cms/banners/${id}`).then(r => r.data);
export const uploadBannerDesktop = (id: number, f: FormData) => api.post(`/cms/banners/${id}/desktop-image`, f, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
export const uploadBannerMobile = (id: number, f: FormData) => api.post(`/cms/banners/${id}/mobile-image`, f, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);

export const getAllServices = () => api.get('/cms/services/all').then(r => r.data);
export const createService = (data: object) => api.post('/cms/services', data).then(r => r.data);
export const updateService = (id: number, data: object) => api.put(`/cms/services/${id}`, data).then(r => r.data);
export const deleteService = (id: number) => api.delete(`/cms/services/${id}`).then(r => r.data);

export const getAdminGallery = () => api.get('/cms/gallery').then(r => r.data);
export const uploadGallery = (f: FormData) => api.post('/cms/gallery', f, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
export const deleteGalleryItem = (id: number) => api.delete(`/cms/gallery/${id}`).then(r => r.data);

export const getAllTestimonials = () => api.get('/cms/testimonials/all').then(r => r.data);
export const createTestimonial = (data: object) => api.post('/cms/testimonials', data).then(r => r.data);
export const updateTestimonial = (id: number, data: object) => api.put(`/cms/testimonials/${id}`, data).then(r => r.data);
export const deleteTestimonial = (id: number) => api.delete(`/cms/testimonials/${id}`).then(r => r.data);

export const getAllFaqs = () => api.get('/cms/faqs').then(r => r.data);
export const createFaq = (data: object) => api.post('/cms/faqs', data).then(r => r.data);
export const updateFaq = (id: number, data: object) => api.put(`/cms/faqs/${id}`, data).then(r => r.data);
export const deleteFaq = (id: number) => api.delete(`/cms/faqs/${id}`).then(r => r.data);

export const getAllBlog = () => api.get('/cms/blog/all').then(r => r.data);
export const createBlogPost = (data: object) => api.post('/cms/blog', data).then(r => r.data);
export const updateBlogPost = (id: number, data: object) => api.put(`/cms/blog/${id}`, data).then(r => r.data);
export const deleteBlogPost = (id: number) => api.delete(`/cms/blog/${id}`).then(r => r.data);

// ─── Settings ─────────────────────────────────────────────────────────────────
export const getSettings = () => api.get('/settings').then(r => r.data);
export const updateSettings = (data: object) => api.put('/settings', data).then(r => r.data);
export const getStats = () => api.get('/settings/stats').then(r => r.data);
export const updateStats = (stats: any[]) => api.put('/settings/stats', { stats }).then(r => r.data);

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const getBookings = (params?: object) => api.get('/bookings', { params }).then(r => r.data);
export const getBooking = (id: number) => api.get(`/bookings/${id}`).then(r => r.data);
export const createBooking = (data: object) => api.post('/bookings', data).then(r => r.data);
export const updateBooking = (id: number, data: object) => api.put(`/bookings/${id}`, data).then(r => r.data);
export const addPayment = (bookingId: number, data: object) => api.post(`/bookings/${bookingId}/payments`, data).then(r => r.data);
export const getCustomers = (params?: object) => api.get('/bookings/customers/all', { params }).then(r => r.data);
export const createCustomer = (data: object) => api.post('/bookings/customers', data).then(r => r.data);

// ─── Reports ─────────────────────────────────────────────────────────────────
export const getLeadsReport = (params?: object) => api.get('/reports/leads', { params }).then(r => r.data);
export const getRevenueReport = () => api.get('/reports/revenue').then(r => r.data);

// ─── Newsletter ──────────────────────────────────────────────────────────────
export const getNewsletter = () => api.get('/newsletter').then(r => r.data);
