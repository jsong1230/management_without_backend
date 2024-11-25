import { Handler } from '@netlify/functions';
import { v4 as uuidv4 } from 'uuid';
import { client } from './db';

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      const result = await client.execute(`
        SELECT 
          a.*,
          c.name as customer_name,
          s.name as service_name,
          s.category as service_category
        FROM appointments a
        JOIN customers c ON a.customer_id = c.id
        JOIN services s ON a.service_id = s.id
      `);
      
      return {
        statusCode: 200,
        body: JSON.stringify(result.rows)
      };
    }

    if (event.httpMethod === 'POST' && event.body) {
      const { customer_id, service_id, date, time, duration, status, notes } = JSON.parse(event.body);
      const id = uuidv4();

      await client.execute({
        sql: `INSERT INTO appointments (id, customer_id, service_id, date, time, duration, status, notes)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [id, customer_id, service_id, date, time, duration, status, notes]
      });

      const newAppointment = await client.execute({
        sql: `
          SELECT 
            a.*,
            c.name as customer_name,
            s.name as service_name,
            s.category as service_category
          FROM appointments a
          JOIN customers c ON a.customer_id = c.id
          JOIN services s ON a.service_id = s.id
          WHERE a.id = ?
        `,
        args: [id]
      });

      return {
        statusCode: 201,
        body: JSON.stringify(newAppointment.rows[0])
      };
    }

    if (event.httpMethod === 'PATCH' && event.path) {
      const id = event.path.split('/').pop();
      const { status } = JSON.parse(event.body || '{}');

      await client.execute({
        sql: 'UPDATE appointments SET status = ? WHERE id = ?',
        args: [status, id]
      });

      const updatedAppointment = await client.execute({
        sql: `
          SELECT 
            a.*,
            c.name as customer_name,
            s.name as service_name,
            s.category as service_category
          FROM appointments a
          JOIN customers c ON a.customer_id = c.id
          JOIN services s ON a.service_id = s.id
          WHERE a.id = ?
        `,
        args: [id]
      });

      return {
        statusCode: 200,
        body: JSON.stringify(updatedAppointment.rows[0])
      };
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};