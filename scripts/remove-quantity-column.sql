-- Remove quantity column from products table
ALTER TABLE products DROP COLUMN IF EXISTS quantity;
