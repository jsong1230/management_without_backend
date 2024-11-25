import { Handler, HandlerEvent } from '@netlify/functions';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const withAuth = (handler: Handler): Handler => {
  return async (event: HandlerEvent) => {
    // OPTIONS 요청은 인증 없이 허용
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS'
        }
      };
    }

    const authHeader = event.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: '인증이 필요합니다' })
      };
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      // @ts-ignore
      event.user = decoded;
      return handler(event);
    } catch (error) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: '유효하지 않은 토큰입니다' })
      };
    }
  };
};