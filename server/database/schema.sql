-- =============================================
-- Enterprise Real Estate Platform - Database Schema
-- =============================================

-- Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  avatar VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Company Settings
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Banners (Homepage Hero)
CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500),
  subtitle TEXT,
  button_text VARCHAR(255),
  button_link VARCHAR(500),
  desktop_image VARCHAR(500),
  mobile_image VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  code VARCHAR(100) UNIQUE,
  slug VARCHAR(500) UNIQUE,
  description TEXT,
  location VARCHAR(500),
  google_map TEXT,
  price_starting_from NUMERIC(15,2),
  status VARCHAR(50) DEFAULT 'upcoming',
  possession_date DATE,
  amenities TEXT[],
  brochure VARCHAR(500),
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  meta_title VARCHAR(500),
  meta_description TEXT,
  meta_keywords TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Project Gallery
CREATE TABLE IF NOT EXISTS project_gallery (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  caption VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Project Videos
CREATE TABLE IF NOT EXISTS project_videos (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  video_url VARCHAR(500) NOT NULL,
  title VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Project Floor Plans
CREATE TABLE IF NOT EXISTS project_floor_plans (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(500),
  image_url VARCHAR(500) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Property Categories
CREATE TABLE IF NOT EXISTS property_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Properties
CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  code VARCHAR(100) UNIQUE,
  slug VARCHAR(500) UNIQUE,
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  category VARCHAR(100),
  price NUMERIC(15,2),
  offer_price NUMERIC(15,2),
  area VARCHAR(100),
  bedrooms INTEGER,
  bathrooms INTEGER,
  facing VARCHAR(100),
  parking INTEGER DEFAULT 0,
  description TEXT,
  amenities TEXT[],
  floor_plan VARCHAR(500),
  google_map TEXT,
  nearby_places TEXT,
  status VARCHAR(50) DEFAULT 'available',
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  meta_title VARCHAR(500),
  meta_description TEXT,
  meta_keywords TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Property Images
CREATE TABLE IF NOT EXISTS property_images (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  caption VARCHAR(500),
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Property Videos
CREATE TABLE IF NOT EXISTS property_videos (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  video_url VARCHAR(500) NOT NULL,
  title VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Leads
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  source VARCHAR(100) DEFAULT 'website',
  property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'new',
  notes TEXT,
  assigned_to INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Lead Timeline
CREATE TABLE IF NOT EXISTS lead_timeline (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  note TEXT,
  created_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Follow-ups
CREATE TABLE IF NOT EXISTS followups (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  follow_up_date DATE NOT NULL,
  follow_up_time TIME,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  mobile VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  id_proof_type VARCHAR(100),
  id_proof_number VARCHAR(100),
  id_proof_doc VARCHAR(500),
  lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  booking_number VARCHAR(100) UNIQUE,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  booking_date DATE,
  agreement_date DATE,
  total_price NUMERIC(15,2),
  discount NUMERIC(15,2) DEFAULT 0,
  final_price NUMERIC(15,2),
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  payment_type VARCHAR(100),
  amount NUMERIC(15,2) NOT NULL,
  payment_date DATE,
  payment_mode VARCHAR(100),
  reference_number VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  receipt_url VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Site Visits
CREATE TABLE IF NOT EXISTS site_visits (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
  name VARCHAR(500) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  preferred_date DATE,
  preferred_time TIME,
  remarks TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contact Enquiries
CREATE TABLE IF NOT EXISTS contact_enquiries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  mobile VARCHAR(20),
  email VARCHAR(255),
  subject VARCHAR(500),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  image VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Gallery
CREATE TABLE IF NOT EXISTS gallery (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500),
  image_url VARCHAR(500) NOT NULL,
  category VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(500) NOT NULL,
  designation VARCHAR(255),
  company VARCHAR(255),
  message TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  avatar VARCHAR(500),
  property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE,
  content TEXT,
  excerpt TEXT,
  featured_image VARCHAR(500),
  author_id INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT FALSE,
  meta_title VARCHAR(500),
  meta_description TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- FAQ
CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stats
CREATE TABLE IF NOT EXISTS stats (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  label VARCHAR(255),
  value VARCHAR(255),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Default admin user (password: Admin@123)
INSERT INTO admin_users (name, email, password, role)
VALUES ('Super Admin', 'admin@realestate.com', '$2a$10$rEkHLHJDuAzWnVqYv5bJwuq5A6GGWQPt5OiKL5aqT2KJBhZ.WO7QK', 'superadmin')
ON CONFLICT (email) DO NOTHING;

-- Default settings
INSERT INTO settings (key, value) VALUES
  ('company_name', 'Elite Realty'),
  ('company_email', 'info@eliterealty.com'),
  ('company_phone', '+91 98765 43210'),
  ('company_address', '123 Business Park, Mumbai, Maharashtra 400001'),
  ('company_logo', ''),
  ('footer_copyright', '© 2024 Elite Realty. All rights reserved.'),
  ('social_facebook', ''),
  ('social_instagram', ''),
  ('social_twitter', ''),
  ('social_linkedin', ''),
  ('social_youtube', ''),
  ('working_hours', 'Mon - Sat: 9:00 AM - 7:00 PM')
ON CONFLICT (key) DO NOTHING;

-- Default stats
INSERT INTO stats (key, label, value) VALUES
  ('years_experience', 'Years Experience', '15'),
  ('projects_completed', 'Projects Completed', '150'),
  ('happy_customers', 'Happy Customers', '5000'),
  ('properties_sold', 'Properties Sold', '3000')
ON CONFLICT (key) DO NOTHING;
