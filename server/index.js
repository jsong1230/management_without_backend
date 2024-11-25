import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import db from './db.js';

const app = express();

app.use(cors());
app.use(express.json());

// Customers API
app.get('/api/customers', (req, res) => {
  try {
    const customers = db.prepare('SELECT * FROM customers').all();
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

app.post('/api/customers', (req, res) => {
  try {
    const { name, phone, email, preferences } = req.body;
    const id = uuidv4();
    
    const insert = db.prepare(`
      INSERT INTO customers (id, name, phone, email, preferences)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    insert.run(id, name, phone, email || null, preferences || null);
    
    const newCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Services API
app.get('/api/services', (req, res) => {
  try {
    const services = db.prepare('SELECT * FROM services').all();
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Appointments API
app.get('/api/appointments', (req, res) => {
  try {
    const { date } = req.query;
    let query = `
      SELECT 
        a.*,
        c.name as customer_name,
        s.name as service_name,
        s.category as service_category
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      JOIN services s ON a.service_id = s.id
    `;
    
    if (date) {
      query += ' WHERE a.date = ?';
      const appointments = db.prepare(query).all(date);
      res.json(appointments);
    } else {
      const appointments = db.prepare(query).all();
      res.json(appointments);
    }
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

app.post('/api/appointments', (req, res) => {
  try {
    const { customer_id, service_id, date, time, duration, status, notes } = req.body;
    const id = uuidv4();
    
    const insert = db.prepare(`
      INSERT INTO appointments (id, customer_id, service_id, date, time, duration, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insert.run(id, customer_id, service_id, date, time, duration, status, notes || null);
    
    const newAppointment = db.prepare(`
      SELECT 
        a.*,
        c.name as customer_name,
        s.name as service_name,
        s.category as service_category
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      JOIN services s ON a.service_id = s.id
      WHERE a.id = ?
    `).get(id);
    
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

app.patch('/api/appointments/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const update = db.prepare('UPDATE appointments SET status = ? WHERE id = ?');
    update.run(status, id);
    
    const updatedAppointment = db.prepare(`
      SELECT 
        a.*,
        c.name as customer_name,
        s.name as service_name,
        s.category as service_category
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      JOIN services s ON a.service_id = s.id
      WHERE a.id = ?
    `).get(id);
    
    if (!updatedAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});