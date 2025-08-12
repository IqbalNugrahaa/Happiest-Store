"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, ExternalLink, AlertTriangle, CheckCircle, Loader2, RefreshCw, Copy } from 'lucide-react'
import { isSupabaseConfigured, testSupabaseConnection } from "@/lib/supabase"
import { useLanguage } from "@/contexts/language-context"

export function SupabaseStatus() {
  const { t } = useLanguage()
  const [connectionStatus, setConnectionStatus] = useState<{
    loading: boolean
    success: boolean | null
    message: string
  }>({
    loading: false,
    success: null,
    message: ''
  })

  const testConnection = async () => {
    setConnectionStatus({ loading: true, success: null, message: '' })
    
    const result = await testSupabaseConnection()
    
    setConnectionStatus({
      loading: false,
      success: result.success,
      message: result.success ? result.message! : result.error!
    })
  }

  const copySQL = () => {
    const sqlScript = `-- Run this in your Supabase SQL Editor
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
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
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true) WITH CHECK (true);

-- Insert sample data
INSERT INTO transactions (date, item_purchased, customer_name, store_name, payment_method, purchase_price, selling_price, revenue, notes, month, year) VALUES
('2024-12-15', 'Wireless Headphones', 'John Smith', 'Tech Store Downtown', 'Credit Card', 1125000, 1499850, 374850, 'Customer was very satisfied', 12, 2024),
('2024-12-16', 'Coffee Mug', 'Sarah Johnson', 'Home Goods Plus', 'Cash', 127500, 194850, 67350, 'Part of bulk order', 12, 2024);

INSERT INTO products (name, type, quantity, price) VALUES
('Wireless Headphones', 'Electronics', 25, 1499850),
('Coffee Mug', 'Kitchenware', 50, 194850);`

    navigator.clipboard.writeText(sqlScript)
    alert('SQL script copied to clipboard!')
  }

  useEffect(() => {
    if (isSupabaseConfigured) {
      testConnection()
    }
  }, [])

  if (!isSupabaseConfigured) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <AlertTriangle className="h-5 w-5" />
            Supabase Not Configured
          </CardTitle>
          <CardDescription className="text-amber-700">
            The system is running in demo mode with mock data. To enable full functionality, configure Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-2">To connect Supabase:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Create a Supabase project at supabase.com</li>
              <li>Get your project URL and anon key</li>
              <li>Add environment variables to .env.local:
                <div className="bg-amber-100 p-2 rounded mt-1 font-mono text-xs">
                  NEXT_PUBLIC_SUPABASE_URL=your_url<br/>
                  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
                </div>
              </li>
              <li>Run the SQL scripts to create tables</li>
              <li>Restart the development server</li>
            </ol>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://supabase.com', '_blank')}
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Go to Supabase
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copySQL}
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy SQL Script
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${
      connectionStatus.success === true 
        ? 'border-green-200 bg-green-50' 
        : connectionStatus.success === false 
        ? 'border-red-200 bg-red-50'
        : 'border-blue-200 bg-blue-50'
    }`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${
          connectionStatus.success === true 
            ? 'text-green-900' 
            : connectionStatus.success === false 
            ? 'text-red-900'
            : 'text-blue-900'
        }`}>
          {connectionStatus.loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : connectionStatus.success === true ? (
            <CheckCircle className="h-5 w-5" />
          ) : connectionStatus.success === false ? (
            <AlertTriangle className="h-5 w-5" />
          ) : (
            <Database className="h-5 w-5" />
          )}
          Supabase Connection Status
        </CardTitle>
        <CardDescription className={
          connectionStatus.success === true 
            ? 'text-green-700' 
            : connectionStatus.success === false 
            ? 'text-red-700'
            : 'text-blue-700'
        }>
          {connectionStatus.loading 
            ? 'Testing connection...'
            : connectionStatus.message || 'Supabase is configured'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={testConnection}
            disabled={connectionStatus.loading}
            className={`${
              connectionStatus.success === true 
                ? 'border-green-300 text-green-700 hover:bg-green-100' 
                : connectionStatus.success === false 
                ? 'border-red-300 text-red-700 hover:bg-red-100'
                : 'border-blue-300 text-blue-700 hover:bg-blue-100'
            }`}
          >
            {connectionStatus.loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Test Connection
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={copySQL}
            className={`${
              connectionStatus.success === true 
                ? 'border-green-300 text-green-700 hover:bg-green-100' 
                : connectionStatus.success === false 
                ? 'border-red-300 text-red-700 hover:bg-red-100'
                : 'border-blue-300 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy SQL
          </Button>
          
          {connectionStatus.success === false && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Dashboard
            </Button>
          )}
        </div>
        
        {connectionStatus.success === false && (
          <div className="mt-4 text-sm text-red-800">
            <p className="font-medium mb-2">Common issues:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Check if the database tables exist (run SQL scripts)</li>
              <li>Verify your Supabase URL and API key</li>
              <li>Ensure RLS (Row Level Security) policies are set up</li>
              <li>Check if your Supabase project is active</li>
              <li>Make sure the tables have the correct column names (snake_case)</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
