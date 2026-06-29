import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getBanners, getProjects, getProperties, getServices, getTestimonials, getFaqs, getStats } from '../api/axios';
import { MapPin, Bed, Bath, IndianRupee, ChevronLeft, ChevronRight, Star, ArrowRight } from 'lucide-react';
import { SkeletonList } from '../components/Skeleton';
import EnquiryModal from '../components/EnquiryModal';
import SiteVisitModal from '../components/SiteVisitModal';

function formatPrice(price: number) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price?.toLocaleString()}`;
}

export default function Home() {
  const [bannerIdx, setBannerIdx] = useState(0);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [siteVisitOpen, setSiteVisitOpen] = useState(false);

  const { data: bannersData } = useQuery({ queryKey: ['banners'], queryFn: getBanners });
  const { data: projectsData, isLoading: projLoading } = useQuery({ queryKey: ['featured-projects'], queryFn: () => getProjects({ featured: true, limit: 6 }) });
  const { data: propertiesData, isLoading: propLoading } = useQuery({ queryKey: ['featured-properties'], queryFn: () => getProperties({ featured: 'true', status: 'available', limit: 6 }) });
  const { data: servicesData } = useQuery({ queryKey: ['services'], queryFn: getServices });
  const { data: testimonialsData } = useQuery({ queryKey: ['testimonials'], queryFn: getTestimonials });
  const { data: faqsData } = useQuery({ queryKey: ['faqs'], queryFn: getFaqs });
  const { data: statsData } = useQuery({ queryKey: ['stats'], queryFn: getStats });

  const banners = bannersData?.data || [];
  const projects = projectsData?.data || [];
  const properties = propertiesData?.data || [];
  const services = servicesData?.data || [];
  const testimonials = testimonialsData?.data || [];
  const faqs = faqsData?.data || [];
  const stats = statsData?.data || [];

  return (
    <div>
      {/* Hero Banner */}
      {banners.length > 0 ? (
        <section className="relative h-[85vh] min-h-[500px] overflow-hidden bg-primary">
          {banners.map((b: any, i: number) => (
            <div key={b.id} className={`absolute inset-0 transition-opacity duration-700 ${i === bannerIdx ? 'opacity-100' : 'opacity-0'}`}>
              {b.desktop_image
                ? <img src={b.desktop_image} alt={b.title} className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gradient-to-r from-primary to-primary-dark" />}
              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute inset-0 flex items-center justify-center text-white text-center px-4">
                <div>
                  {b.title && <h1 className="text-4xl md:text-6xl font-bold mb-4">{b.title}</h1>}
                  {b.subtitle && <p className="text-lg md:text-2xl mb-8 max-w-2xl">{b.subtitle}</p>}
                  <div className="flex flex-wrap gap-4 justify-center">
                    {b.button_text && b.button_link && (
                      <Link to={b.button_link} className="btn-accent">{b.button_text}</Link>
                    )}
                    <button onClick={() => setEnquiryOpen(true)} className="bg-white text-primary px-6 py-3 rounded font-semibold hover:bg-gray-100 transition-colors">Enquire Now</button>
                    <button onClick={() => setSiteVisitOpen(true)} className="border-2 border-white text-white px-6 py-3 rounded font-semibold hover:bg-white hover:text-primary transition-colors">Book Site Visit</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {banners.length > 1 && (
            <>
              <button onClick={() => setBannerIdx(i => (i - 1 + banners.length) % banners.length)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white rounded-full p-2"><ChevronLeft size={24} /></button>
              <button onClick={() => setBannerIdx(i => (i + 1) % banners.length)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white rounded-full p-2"><ChevronRight size={24} /></button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_: any, i: number) => <button key={i} onClick={() => setBannerIdx(i)} className={`w-2 h-2 rounded-full transition-colors ${i === bannerIdx ? 'bg-accent' : 'bg-white/50'}`} />)}
              </div>
            </>
          )}
        </section>
      ) : (
        <section className="h-[85vh] min-h-[500px] bg-gradient-to-r from-primary to-primary-dark flex items-center justify-center text-white text-center px-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Find Your Dream Home</h1>
            <p className="text-xl mb-8">Premium Real Estate. Trusted by thousands.</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/properties" className="btn-accent">View Properties</Link>
              <button onClick={() => setEnquiryOpen(true)} className="bg-white text-primary px-6 py-3 rounded font-semibold">Enquire Now</button>
            </div>
          </div>
        </section>
      )}

      {/* Stats */}
      {stats.length > 0 && (
        <section className="bg-accent py-10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
              {stats.map((s: any) => (
                <div key={s.key}>
                  <div className="text-4xl font-bold">{s.value}+</div>
                  <div className="text-sm mt-1 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Projects */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Featured Projects</h2>
              <p className="text-gray-600">Explore our latest developments</p>
            </div>
            <Link to="/projects" className="text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">View All <ArrowRight size={16} /></Link>
          </div>
          {projLoading ? <SkeletonList count={3} /> : projects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No projects available yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p: any) => (
                <Link key={p.id} to={`/projects/${p.id}`} className="card hover:shadow-lg transition-shadow group">
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    {p.gallery_images?.[0]
                      ? <img src={p.gallery_images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-4xl font-bold">{p.name[0]}</div>}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.status === 'completed' ? 'bg-green-100 text-green-700' : p.status === 'ongoing' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {p.status?.charAt(0).toUpperCase() + p.status?.slice(1)}
                      </span>
                      {p.is_featured && <span className="text-xs bg-accent/10 text-accent font-medium px-2 py-1 rounded-full">Featured</span>}
                    </div>
                    <h3 className="font-bold text-lg text-primary mb-1">{p.name}</h3>
                    {p.location && <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={12} />{p.location}</p>}
                    {p.price_starting_from && <p className="text-accent font-bold mt-2">From {formatPrice(p.price_starting_from)}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Available Properties</h2>
              <p className="text-gray-600">Hand-picked properties for you</p>
            </div>
            <Link to="/properties" className="text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">View All <ArrowRight size={16} /></Link>
          </div>
          {propLoading ? <SkeletonList /> : properties.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No properties available yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p: any) => (
                <Link key={p.id} to={`/properties/${p.id}`} className="card hover:shadow-lg transition-shadow group">
                  <div className="h-48 bg-gray-200 overflow-hidden relative">
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-4xl font-bold">{p.title[0]}</div>}
                    <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">{p.category}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-primary mb-1 truncate">{p.title}</h3>
                    {p.project_location && <p className="text-sm text-gray-500 flex items-center gap-1 mb-2"><MapPin size={12} />{p.project_location}</p>}
                    <div className="flex gap-4 text-sm text-gray-600 mb-3">
                      {p.bedrooms && <span className="flex items-center gap-1"><Bed size={14} />{p.bedrooms} Bed</span>}
                      {p.bathrooms && <span className="flex items-center gap-1"><Bath size={14} />{p.bathrooms} Bath</span>}
                      {p.area && <span>{p.area}</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        {p.offer_price && p.offer_price < p.price ? (
                          <>
                            <span className="text-accent font-bold">{formatPrice(p.offer_price)}</span>
                            <span className="text-gray-400 line-through text-sm ml-2">{formatPrice(p.price)}</span>
                          </>
                        ) : <span className="text-accent font-bold">{formatPrice(p.price)}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Services */}
      {services.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="section-title">Our Services</h2>
              <p className="text-gray-600">Comprehensive real estate solutions</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s: any) => (
                <div key={s.id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-center">
                  {s.icon && <div className="text-4xl mb-3">{s.icon}</div>}
                  <h3 className="font-bold text-primary text-lg mb-2">{s.title}</h3>
                  <p className="text-gray-600 text-sm">{s.description}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/services" className="btn-primary">View All Services</Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="section-title">What Our Clients Say</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.slice(0, 6).map((t: any) => (
                <div key={t.id} className="card p-6">
                  <div className="flex text-yellow-400 mb-3">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <p className="text-gray-600 text-sm mb-4 italic">"{t.message}"</p>
                  <div className="flex items-center gap-3">
                    {t.avatar ? <img src={t.avatar} alt={t.customer_name} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">{t.customer_name[0]}</div>}
                    <div>
                      <div className="font-semibold text-sm">{t.customer_name}</div>
                      {t.designation && <div className="text-xs text-gray-500">{t.designation}{t.company ? `, ${t.company}` : ''}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-10">
              <h2 className="section-title">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              {faqs.slice(0, 5).map((f: any) => (
                <details key={f.id} className="bg-white rounded-lg shadow-sm p-4 group">
                  <summary className="font-semibold cursor-pointer text-primary list-none flex justify-between items-center">
                    {f.question}
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-gray-600 text-sm mt-3">{f.answer}</p>
                </details>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link to="/faq" className="btn-primary">View All FAQs</Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-primary text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Dream Property?</h2>
          <p className="mb-8 text-gray-200">Let our experts guide you to the perfect home.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={() => setEnquiryOpen(true)} className="btn-accent">Enquire Now</button>
            <button onClick={() => setSiteVisitOpen(true)} className="bg-white text-primary px-6 py-3 rounded font-semibold hover:bg-gray-100 transition-colors">Book Site Visit</button>
          </div>
        </div>
      </section>

      {enquiryOpen && <EnquiryModal onClose={() => setEnquiryOpen(false)} />}
      {siteVisitOpen && <SiteVisitModal onClose={() => setSiteVisitOpen(false)} />}
    </div>
  );
}
