-- Add unique constraint on product name
ALTER TABLE products 
ADD CONSTRAINT product UNIQUE (name);

-- Create index for better performance (if not already exists)
CREATE INDEX IF NOT EXISTS idx_products_name_unique ON products(name);
