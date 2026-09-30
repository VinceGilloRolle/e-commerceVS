-- ============================================
-- Vape Shop E-Commerce - Database Schema
-- Run this script in PostgreSQL (psql or pgAdmin)
-- ============================================

-- Create database first (run separately if needed):
-- CREATE DATABASE vape_shop;

-- Connect to vape_shop, then run the rest:

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer'
);

-- Existing databases created before roles were added
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'customer';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_role_check
      CHECK (role IN ('customer', 'store-owner'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  price NUMERIC(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  total NUMERIC(10, 2) NOT NULL,
  channel VARCHAR(20) NOT NULL DEFAULT 'online',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS channel VARCHAR(20) NOT NULL DEFAULT 'online';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_channel_check'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_channel_check
      CHECK (channel IN ('online', 'pos'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL
);
