-- First, let's check if the tables exist and see their structure
-- If you're running this manually, you can check the current schema first

-- Drop existing tables if they have the wrong structure
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create transactions table with correct column names
CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL,
  item_purchased TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  store_name TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  purchase_price DECIMAL(15,2) NOT NULL,
  selling_price DECIMAL(15,2) NOT NULL,
  revenue DECIMAL(15,2) NOT NULL,
  notes TEXT,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_transactions_month_year ON transactions(month, year);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_products_name ON products(name);

-- Enable Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for now
CREATE POLICY "Allow all operations on transactions" ON transactions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on products" ON products
  FOR ALL USING (true) WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO transactions (date, item_purchased, customer_name, store_name, payment_method, purchase_price, selling_price, revenue, notes, month, year) VALUES
('2024-01-15', 'Wireless Headphones', 'John Smith', 'Tech Store Downtown', 'Credit Card', 1125000, 1499850, 374850, 'Customer was very satisfied with the product', 1, 2024),
('2024-01-16', 'Coffee Mug', 'Sarah Johnson', 'Home Goods Plus', 'Cash', 127500, 194850, 67350, 'Part of a bulk order', 1, 2024),
('2024-01-17', 'Notebook Set', 'Mike Davis', 'Office Supplies Co', 'Debit Card', 225000, 389850, 164850, 'Customer requested gift wrapping', 1, 2024),
('2024-02-10', 'Laptop', 'Emma Wilson', 'Tech Hub', 'Bank Transfer', 15000000, 19499850, 4499850, 'Corporate purchase', 2, 2024),
('2024-02-15', 'T-Shirt', 'David Brown', 'Fashion Store', 'Cash', 250000, 374850, 124850, 'Regular customer', 2, 2024),
('2024-03-05', 'Water Bottle', 'Lisa Garcia', 'Sports Center', 'Credit Card', 200000, 284850, 84850, 'Gym membership discount applied', 3, 2024),
('2024-12-01', 'Phone Case', 'Alex Johnson', 'Mobile Store', 'Credit Card', 150000, 299850, 149850, 'Holiday season purchase', 12, 2024),
('2024-12-15', 'Desk Lamp', 'Maria Rodriguez', 'Office Depot', 'Debit Card', 450000, 689850, 239850, 'Office setup', 12, 2024);

INSERT INTO products (name, type, quantity, price) VALUES
('Wireless Headphones', 'Electronics', 25, 1499850),
('Coffee Mug', 'Kitchenware', 50, 194850),
('Notebook Set', 'Stationery', 75, 389850),
('Laptop', 'Electronics', 10, 19499850),
('T-Shirt', 'Clothing', 100, 374850),
('Water Bottle', 'Sports', 40, 284850),
('Desk Lamp', 'Home & Garden', 15, 689850),
('Phone Case', 'Electronics', 80, 299850);
