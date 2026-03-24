--liquibase formatted sql

-- changeset eathub:1.0.0 logicalFilePath:db/changelog/db.changelog-master.sql validCheckSum:ANY
-- Create Users & Access Control
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    phone VARCHAR(20),
    avatar_url VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS user_roles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    role_id VARCHAR(36) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS admins (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    privileges TEXT,
    CONSTRAINT fk_admins_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Onboarding
CREATE TABLE IF NOT EXISTS pending_registrations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    provider_type VARCHAR(50),
    contact_info VARCHAR(255),
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50),
    reviewed_by VARCHAR(36),
    CONSTRAINT fk_pending_reg_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_pending_reg_admin FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Provider: Restaurant
CREATE TABLE IF NOT EXISTS restaurants (
    id VARCHAR(36) PRIMARY KEY,
    owner_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    cuisine VARCHAR(255),
    rating FLOAT DEFAULT 0,
    reviews_count INT DEFAULT 0,
    avg_delivery_time INT,
    base_delivery_fee FLOAT,
    is_open BOOLEAN DEFAULT TRUE,
    operational_status VARCHAR(50),
    CONSTRAINT fk_restaurants_owner FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS restaurant_addresses (
    id VARCHAR(36) PRIMARY KEY,
    restaurant_id VARCHAR(36) NOT NULL UNIQUE,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    latitude FLOAT,
    longitude FLOAT,
    CONSTRAINT fk_res_address_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

CREATE TABLE IF NOT EXISTS restaurant_legal_profiles (
    id VARCHAR(36) PRIMARY KEY,
    restaurant_id VARCHAR(36) NOT NULL UNIQUE,
    legal_business_name VARCHAR(255),
    gst_number VARCHAR(50),
    pan_number VARCHAR(50),
    fssai_license_number VARCHAR(100),
    fssai_expiry_date DATE,
    business_type VARCHAR(100),
    registered_address TEXT,
    bank_account_holder_name VARCHAR(255),
    bank_account_number VARCHAR(100),
    bank_ifsc VARCHAR(50),
    bank_name VARCHAR(255),
    payment_gateway VARCHAR(100),
    gateway_merchant_id VARCHAR(100),
    payout_schedule VARCHAR(50),
    kyc_status VARCHAR(50),
    verified_at TIMESTAMP,
    CONSTRAINT fk_legal_profile_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Provider: Home Food
CREATE TABLE IF NOT EXISTS home_food_providers (
    id VARCHAR(36) PRIMARY KEY,
    owner_id VARCHAR(36) NOT NULL,
    brand_name VARCHAR(255),
    description TEXT,
    food_type VARCHAR(100),
    rating FLOAT DEFAULT 0,
    reviews_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_home_food_owner FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS home_food_addresses (
    id VARCHAR(36) PRIMARY KEY,
    home_food_id VARCHAR(36) NOT NULL UNIQUE,
    address_line1 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    CONSTRAINT fk_home_address_provider FOREIGN KEY (home_food_id) REFERENCES home_food_providers(id)
);

CREATE TABLE IF NOT EXISTS home_food_compliance (
    id VARCHAR(36) PRIMARY KEY,
    home_food_id VARCHAR(36) NOT NULL UNIQUE,
    id_proof_type VARCHAR(50),
    id_proof_number VARCHAR(100),
    hygiene_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    CONSTRAINT fk_compliance_provider FOREIGN KEY (home_food_id) REFERENCES home_food_providers(id)
);

-- Provider: Chef
CREATE TABLE IF NOT EXISTS chefs (
    id VARCHAR(36) PRIMARY KEY,
    owner_id VARCHAR(36) NOT NULL,
    name VARCHAR(255),
    bio TEXT,
    experience VARCHAR(255),
    rating FLOAT DEFAULT 0,
    reviews_count INT DEFAULT 0,
    avatar_url VARCHAR(1000),
    CONSTRAINT fk_chefs_owner FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS chef_services (
    id VARCHAR(36) PRIMARY KEY,
    chef_id VARCHAR(36) NOT NULL,
    name VARCHAR(255),
    description TEXT,
    base_price FLOAT,
    status VARCHAR(50),
    CONSTRAINT fk_chef_service_chef FOREIGN KEY (chef_id) REFERENCES chefs(id)
);

-- Unified Menu System
CREATE TABLE IF NOT EXISTS menu_categories (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    restaurant_id VARCHAR(36),
    home_food_id VARCHAR(36),
    CONSTRAINT fk_menu_cat_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
    CONSTRAINT fk_menu_cat_home_food FOREIGN KEY (home_food_id) REFERENCES home_food_providers(id)
);

CREATE TABLE IF NOT EXISTS menu_items (
    id VARCHAR(36) PRIMARY KEY,
    category_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price FLOAT NOT NULL,
    image_id VARCHAR(255),
    is_special BOOLEAN DEFAULT TRUE,
    status VARCHAR(50),
    restaurant_id VARCHAR(36),
    home_food_id VARCHAR(36),
    chef_id VARCHAR(36),
    CONSTRAINT fk_menu_item_category FOREIGN KEY (category_id) REFERENCES menu_categories(id),
    CONSTRAINT fk_menu_item_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
    CONSTRAINT fk_menu_item_home_food FOREIGN KEY (home_food_id) REFERENCES home_food_providers(id),
    CONSTRAINT fk_menu_item_chef FOREIGN KEY (chef_id) REFERENCES chefs(id)
);

-- Orders and Reviews
CREATE TABLE IF NOT EXISTS order_status (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_terminal BOOLEAN DEFAULT FALSE,
    sequence INT
);

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    source_type VARCHAR(50),
    restaurant_id VARCHAR(36),
    home_food_provider_id VARCHAR(36),
    current_status_id VARCHAR(36) NOT NULL,
    order_placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expected_delivery_at TIMESTAMP,
    delivery_address TEXT,
    subtotal_amount FLOAT,
    tax_amount FLOAT,
    delivery_fee FLOAT,
    platform_fee FLOAT,
    discount_amount FLOAT,
    total_amount FLOAT,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50),
    order_notes TEXT,
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES users(id),
    CONSTRAINT fk_orders_status FOREIGN KEY (current_status_id) REFERENCES order_status(id)
);

CREATE TABLE IF NOT EXISTS order_status_history (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    status_id VARCHAR(36) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by VARCHAR(255),
    reason TEXT,
    CONSTRAINT fk_osh_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_osh_status FOREIGN KEY (status_id) REFERENCES order_status(id)
);

CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    item_name VARCHAR(255),
    item_type VARCHAR(50),
    item_ref_id VARCHAR(36),
    quantity INT,
    unit_price FLOAT,
    total_price FLOAT,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS chef_bookings (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    chef_id VARCHAR(36) NOT NULL,
    service_id VARCHAR(36) NOT NULL,
    event_date TIMESTAMP,
    guests INT,
    total_amount FLOAT,
    status VARCHAR(50),
    CONSTRAINT fk_chef_booking_customer FOREIGN KEY (customer_id) REFERENCES users(id),
    CONSTRAINT fk_chef_booking_chef FOREIGN KEY (chef_id) REFERENCES chefs(id),
    CONSTRAINT fk_chef_booking_service FOREIGN KEY (service_id) REFERENCES chef_services(id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    target_id VARCHAR(36) NOT NULL,
    target_type VARCHAR(50),
    rating FLOAT,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_customer FOREIGN KEY (customer_id) REFERENCES users(id)
);

-- changeset eathub:1.0.1
-- Add password support for internal authentication
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- changeset eathub:1.0.2
-- Fix image truncation error by changing image_id to TEXT
ALTER TABLE menu_items ALTER COLUMN image_id TYPE TEXT;

-- changeset eathub:1.0.3
-- Add category column to chef_services for categorization
ALTER TABLE chef_services ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- changeset eathub:1.0.4 validCheckSum:ANY logicalFilePath:db/changelog/db.changelog-master.sql
-- Flatten core fields only: description + images as TEXT
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS image_id TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS cover_image_id TEXT;
ALTER TABLE restaurants ALTER COLUMN description TYPE TEXT;
ALTER TABLE restaurants ALTER COLUMN image_id TYPE TEXT;
ALTER TABLE restaurants ALTER COLUMN cover_image_id TYPE TEXT;

-- changeset eathub:1.0.5
-- Add join columns for @OneToOne relationships
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS address_id VARCHAR(36);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS legal_profile_id VARCHAR(36);

-- changeset eathub:1.0.6
-- Add working_hours to restaurants
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS working_hours TEXT;

-- changeset eathub:1.0.7
-- Add restaurant_type to restaurants
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS restaurant_type VARCHAR(255);

-- changeset eathub:1.0.8
-- Ensure operational_status exists to store OPEN/CLOSED state
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS operational_status VARCHAR(50) DEFAULT 'OPEN';

-- changeset eathub:1.0.9 validCheckSum:ANY logicalFilePath:db/changelog/db.changelog-master.sql
-- Expand Home Food Provider schema
ALTER TABLE home_food_providers ADD COLUMN IF NOT EXISTS cover_image_id TEXT;
ALTER TABLE home_food_providers ADD COLUMN IF NOT EXISTS working_hours TEXT;
ALTER TABLE home_food_providers ADD COLUMN IF NOT EXISTS operational_status VARCHAR(50) DEFAULT 'OPEN';
ALTER TABLE home_food_providers ADD COLUMN IF NOT EXISTS address_id VARCHAR(36);
ALTER TABLE home_food_providers ADD COLUMN IF NOT EXISTS legal_profile_id VARCHAR(36);
ALTER TABLE home_food_addresses ADD COLUMN IF NOT EXISTS address_line2 VARCHAR(255);
ALTER TABLE home_food_addresses ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'India';

CREATE TABLE IF NOT EXISTS home_food_legal_profiles (
    id VARCHAR(36) PRIMARY KEY,
    home_food_id VARCHAR(36) NOT NULL UNIQUE,
    legal_business_name VARCHAR(255),
    gst_number VARCHAR(50),
    pan_number VARCHAR(50),
    fssai_license_number VARCHAR(100),
    business_type VARCHAR(100),
    bank_account_holder_name VARCHAR(255),
    bank_account_number VARCHAR(100),
    bank_ifsc VARCHAR(50),
    bank_name VARCHAR(255),
    CONSTRAINT fk_legal_profile_home_food FOREIGN KEY (home_food_id) REFERENCES home_food_providers(id)
);

-- changeset eathub:1.1.0 validCheckSum:ANY logicalFilePath:db/changelog/db.changelog-master.sql
-- Expand Chef schema
ALTER TABLE chefs ADD COLUMN IF NOT EXISTS specialties TEXT;
ALTER TABLE chefs ADD COLUMN IF NOT EXISTS working_hours TEXT;
ALTER TABLE chefs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE chefs ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE chefs ADD COLUMN IF NOT EXISTS experience VARCHAR(100);
ALTER TABLE chefs ADD COLUMN IF NOT EXISTS address_id VARCHAR(36);
ALTER TABLE chefs ADD COLUMN IF NOT EXISTS legal_profile_id VARCHAR(36);

CREATE TABLE IF NOT EXISTS chef_addresses (
    id VARCHAR(36) PRIMARY KEY,
    chef_id VARCHAR(36) NOT NULL UNIQUE,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(20),
    CONSTRAINT fk_chef_address_chef FOREIGN KEY (chef_id) REFERENCES chefs(id)
);

CREATE TABLE IF NOT EXISTS chef_legal_profiles (
    id VARCHAR(36) PRIMARY KEY,
    chef_id VARCHAR(36) NOT NULL UNIQUE,
    legal_business_name VARCHAR(255),
    gst_number VARCHAR(50),
    pan_number VARCHAR(50),
    fssai_license_number VARCHAR(100),
    bank_account_holder_name VARCHAR(255),
    bank_account_number VARCHAR(100),
    bank_ifsc VARCHAR(50),
    bank_name VARCHAR(255),
    CONSTRAINT fk_legal_profile_chef FOREIGN KEY (chef_id) REFERENCES chefs(id)
);

-- changeset eathub:1.1.2
-- Add missing columns to chefs and chef_services
ALTER TABLE chefs ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE chefs ADD COLUMN IF NOT EXISTS experience VARCHAR(100);
ALTER TABLE chef_services ADD COLUMN IF NOT EXISTS base_price VARCHAR(50);

-- changeset eathub:1.1.3
-- Explicitly change avatar_url to TEXT for Postgres to support large Base64 data
ALTER TABLE chefs ALTER COLUMN avatar_url TYPE TEXT;

-- changeset eathub:1.1.4
-- Remove redundant columns for clean schema
ALTER TABLE chefs DROP COLUMN IF EXISTS specialties;
ALTER TABLE chef_legal_profiles DROP COLUMN IF EXISTS bankifsc;

-- changeset eathub:1.1.5
-- Add document storage columns to chef_legal_profiles
ALTER TABLE chef_legal_profiles ADD COLUMN IF NOT EXISTS pan_document_url TEXT;
ALTER TABLE chef_legal_profiles ADD COLUMN IF NOT EXISTS gst_document_url TEXT;
ALTER TABLE chef_legal_profiles ADD COLUMN IF NOT EXISTS fssai_document_url TEXT;
ALTER TABLE chef_legal_profiles ADD COLUMN IF NOT EXISTS culinary_diploma_url TEXT;

-- changeset eathub:1.1.6 validCheckSum:ANY logicalFilePath:db/changelog/db.changelog-master.sql
-- Cleanup unused document and legal columns
ALTER TABLE chef_legal_profiles DROP COLUMN IF EXISTS pan_document_url;
ALTER TABLE chef_legal_profiles DROP COLUMN IF EXISTS gst_document_url;
ALTER TABLE chef_legal_profiles DROP COLUMN IF EXISTS fssai_document_url;
ALTER TABLE chef_legal_profiles DROP COLUMN IF EXISTS fssai_license_number;
ALTER TABLE chef_legal_profiles DROP COLUMN IF EXISTS bankifsc;
ALTER TABLE chef_legal_profiles ADD COLUMN IF NOT EXISTS food_safety_cert_url TEXT;

-- changeset eathub:1.1.7 validCheckSum:ANY logicalFilePath:db/changelog/db.changelog-master.sql
-- Create users_profile table for user-specific profile and address details
CREATE TABLE IF NOT EXISTS users_profile (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    house_number VARCHAR(255),
    street VARCHAR(255),
    area VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    CONSTRAINT fk_users_profile_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- changeset eathub:1.1.8
-- Fix profile save 500 error by changing users avatar_url to TEXT
ALTER TABLE users ALTER COLUMN avatar_url TYPE TEXT;

-- changeset eathub:1.1.9
-- Add menu and signature dish support to chef_services
ALTER TABLE chef_services ADD COLUMN IF NOT EXISTS item_type VARCHAR(50);
ALTER TABLE chef_services ADD COLUMN IF NOT EXISTS is_signature BOOLEAN DEFAULT FALSE;
ALTER TABLE chef_services ADD COLUMN IF NOT EXISTS is_negotiable BOOLEAN DEFAULT FALSE;
ALTER TABLE chef_services ADD COLUMN IF NOT EXISTS image_id TEXT;

-- Move non-numeric base_price values to is_negotiable flag and set price to 0
-- This prevents the cast failure: "We will negotiate with the client 1 to 1"
UPDATE chef_services 
SET is_negotiable = TRUE, base_price = '0' 
WHERE base_price IS NOT NULL AND base_price !~ '^([0-9]+[.]?[0-9]*|[.][0-9]+)$';

-- Convert base_price to FLOAT for numeric operations
ALTER TABLE chef_services ALTER COLUMN base_price TYPE FLOAT USING base_price::double precision;
