-- Insert sample products
INSERT INTO products (name, type, quantity, price) VALUES
('Wireless Headphones', 'Electronics', 25, 1499850),
('Coffee Mug', 'Kitchenware', 50, 194850),
('Notebook Set', 'Stationery', 75, 389850),
('Laptop', 'Electronics', 10, 19499850),
('T-Shirt', 'Clothing', 100, 374850),
('Water Bottle', 'Sports', 40, 284850),
('Desk Lamp', 'Home & Garden', 15, 689850),
('Phone Case', 'Electronics', 80, 299850)
ON CONFLICT DO NOTHING;

-- Insert sample transactions
INSERT INTO transactions (date, item_purchased, customer_name, store_name, payment_method, purchase_price, selling_price, revenue, notes, month, year) VALUES
('2024-01-15', 'Wireless Headphones', 'John Smith', 'Tech Store Downtown', 'Credit Card', 1125000, 1499850, 374850, 'Customer was very satisfied with the product', 1, 2024),
('2024-01-16', 'Coffee Mug', 'Sarah Johnson', 'Home Goods Plus', 'Cash', 127500, 194850, 67350, 'Part of a bulk order', 1, 2024),
('2024-01-17', 'Notebook Set', 'Mike Davis', 'Office Supplies Co', 'Debit Card', 225000, 389850, 164850, 'Customer requested gift wrapping', 1, 2024),
('2024-02-10', 'Laptop', 'Emma Wilson', 'Tech Hub', 'Bank Transfer', 15000000, 19499850, 4499850, 'Corporate purchase', 2, 2024),
('2024-02-15', 'T-Shirt', 'David Brown', 'Fashion Store', 'Cash', 250000, 374850, 124850, 'Regular customer', 2, 2024),
('2024-03-05', 'Water Bottle', 'Lisa Garcia', 'Sports Center', 'Credit Card', 200000, 284850, 84850, 'Gym membership discount applied', 3, 2024)
ON CONFLICT DO NOTHING;
