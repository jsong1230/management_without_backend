import { Handler } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { client } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 데모 계정 정보
const DEMO_USERNAME = 'admin';
const DEMO_PASSWORD = 'admin123';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { username, password } = JSON.parse(event.body || '{}');

    // 데모 계정 검증
    if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
      
      return {
        statusCode: 200,
        body: JSON.stringify({ token })
      };
    }

    return {
      statusCode: 401,
      body: JSON.stringify({ error: '아이디 또는 비밀번호가 올바르지 않습니다' })
    };
  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '인증 처리 중 오류가 발생했습니다' })
    };
  }
};