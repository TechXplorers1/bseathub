--liquibase formatted sql

-- changeset eathub:1.0.0 logicalFilePath:db/changelog/db.changelog-master.sql
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
    is_special BOOLEAN DEFAULT FALSE,
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
    source_type VARCHAR(50), -- Restaurant | HomeFood
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
    item_type VARCHAR(50), -- MenuItem | HomeFoodItem
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
    target_type VARCHAR(50), -- Restaurant | HomeFood | Chef
    rating FLOAT,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_customer FOREIGN KEY (customer_id) REFERENCES users(id)
);