import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '../salon.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

function initializeDatabase() {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      preferences TEXT
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      duration INTEGER NOT NULL,
      price INTEGER NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('nail', 'lash'))
    );

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
    );
  `);

  // Insert default services if they don't exist
  const defaultServices = [
    { id: uuidv4(), name: '젤네일 기본', duration: 90, price: 70000, category: 'nail' },
    { id: uuidv4(), name: '젤네일 아트', duration: 120, price: 90000, category: 'nail' },
    { id: uuidv4(), name: '젤 제거', duration: 30, price: 20000, category: 'nail' },
    { id: uuidv4(), name: '패디큐어 기본', duration: 60, price: 60000, category: 'nail' },
    { id: uuidv4(), name: '패디큐어 아트', duration: 90, price: 80000, category: 'nail' },
    { id: uuidv4(), name: '손톱 연장', duration: 120, price: 100000, category: 'nail' },
    { id: uuidv4(), name: '큐티클 케어', duration: 30, price: 30000, category: 'nail' },
    { id: uuidv4(), name: '속눈썹 풀세트', duration: 120, price: 80000, category: 'lash' },
    { id: uuidv4(), name: '속눈썹 리터치', duration: 60, price: 40000, category: 'lash' },
    { id: uuidv4(), name: '속눈썹 연장', duration: 90, price: 60000, category: 'lash' },
    { id: uuidv4(), name: '속눈썹 제거', duration: 30, price: 20000, category: 'lash' }
  ];

  const insertService = db.prepare(`
    INSERT OR IGNORE INTO services (id, name, duration, price, category)
    VALUES (@id, @name, @duration, @price, @category)
  `);

  const insertMany = db.transaction((services) => {
    for (const service of services) {
      insertService.run(service);
    }
  });

  insertMany(defaultServices);
}

try {
  initializeDatabase();
  console.log('Database initialized successfully');
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

export default db;