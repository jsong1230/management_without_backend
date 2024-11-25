import { Handler } from '@netlify/functions';
import { v4 as uuidv4 } from 'uuid';
import { client } from './db';

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      const result = await client.execute('SELECT * FROM customers');
      return {
        statusCode: 200,
        body: JSON.stringify(result.rows)
      };
    }

    if (event.httpMethod === 'POST' && event.body) {
      const { name, phone, email, preferences } = JSON.parse(event.body);
      const id = uuidv4();

      await client.execute({
        sql: `INSERT INTO customers (id, name, phone, email, preferences)
              VALUES (?, ?, ?, ?, ?)`,
        args: [id, name, phone, email, preferences]
      });

      const newCustomer = await client.execute({
        sql: 'SELECT * FROM customers WHERE id = ?',
        args: [id]
      });

      return {
        statusCode: 201,
        body: JSON.stringify(newCustomer.rows[0])
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