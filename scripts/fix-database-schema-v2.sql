-- Fix the data types for month and year columns
ALTER TABLE transactions 
ALTER COLUMN month TYPE INTEGER USING month::integer;

ALTER TABLE transactions 
ALTER COLUMN year TYPE INTEGER USING year::integer;

-- Ensure revenue is calculated correctly for existing records
UPDATE transactions 
SET revenue = selling_price - purchase_price 
WHERE revenue IS NULL OR revenue = 0;

-- Add any missing indexes
CREATE INDEX IF NOT EXISTS idx_transactions_month_year_int ON transactions(month, year);

-- Update any records that might have string values
UPDATE transactions 
SET month = CAST(month AS INTEGER), 
    year = CAST(year AS INTEGER)
WHERE month IS NOT NULL AND year IS NOT NULL;
