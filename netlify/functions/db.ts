import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:salon.db',
  authToken: process.env.TURSO_AUTH_TOKEN
});

export async function initializeDatabase() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      preferences TEXT,
      membership_balance INTEGER DEFAULT 0
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      duration INTEGER NOT NULL,
      price INTEGER NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('nail', 'lash'))
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      service_id TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      duration INTEGER NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')),
      notes TEXT,
      FOREIGN KEY (customer_id) REFERENCES customers (id),
      FOREIGN KEY (service_id) REFERENCES services (id)
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS membership_transactions (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      payment_method TEXT NOT NULL,
      transaction_date TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (customer_id) REFERENCES customers (id)
    )
  `);
}

export { client };