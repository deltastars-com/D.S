
-- Delta Stars Sovereign Database Schema v50.0
-- Target: PostgreSQL 15+

-- 1. Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'normal', -- normal, vip, admin, ops
  phone_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. OTP Requests Table (Sovereign Security Layer)
CREATE TABLE otp_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose VARCHAR(30) NOT NULL, -- login, order_confirm, reset_password
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Orders Table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  total_amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(30) DEFAULT 'awaiting_verification', -- awaiting_verification, processing, shipped, delivered
  is_verified BOOLEAN DEFAULT FALSE,
  delivery_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Audit Logs (Compliance)
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  action VARCHAR(50),
  detail TEXT,
  user_id INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
