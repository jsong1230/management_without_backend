import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import db from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const EMAIL_USER = process.env.EMAIL_USER || 'your-email@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'your-app-specific-password';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

export const generateToken = (adminId) => {
  return jwt.sign({ id: adminId }, JWT_SECRET, { expiresIn: '1d' });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: '인증이 필요합니다' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다' });
  }

  try {
    const result = await db.execute({
      sql: 'SELECT * FROM admins WHERE id = ? AND is_verified = TRUE',
      args: [decoded.id]
    });

    if (result.rows.length === 0) {
      return res.status(401).json({ error: '관리자를 찾을 수 없습니다' });
    }

    req.admin = result.rows[0];
    next();
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

export const sendVerificationEmail = async (email, token) => {
  const verificationLink = `http://localhost:3000/api/auth/verify/${token}`;
  
  await transporter.sendMail({
    from: EMAIL_USER,
    to: email,
    subject: '이메일 인증',
    html: `
      <h1>이메일 인증</h1>
      <p>아래 링크를 클릭하여 이메일을 인증해주세요:</p>
      <a href="${verificationLink}">${verificationLink}</a>
    `
  });
};