import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ordo-illuminatorum-sanctum-secret-2026-lux';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, 10);
}

export async function comparePassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      phone: user.phoneNumber || user.phone_number,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export async function registerUser({ fullName, phoneNumber, password, carrier = null }) {
  // Check duplicate
  const checkSql = `SELECT id FROM users WHERE phone_number = $1`;
  const existing = await db.query(checkSql, [phoneNumber]);
  if (existing.rows.length > 0) {
    const error = new Error('A member or aspirant already exists with this phone number.');
    error.status = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);

  const insertSql = `
    INSERT INTO users (full_name, phone_number, carrier, password_hash, role, status, is_phone_verified, membership_type_id)
    VALUES ($1, $2, $3, $4, 'MEMBER', 'ACTIVE', true, 1)
    RETURNING id, full_name, phone_number, carrier, role, status, is_phone_verified, created_at
  `;
  const result = await db.query(insertSql, [
    fullName,
    phoneNumber,
    carrier,
    passwordHash,
    'MEMBER',
    'ACTIVE',
    true,
    1,
  ]);

  const newUser = result.rows[0];

  const formattedUser = {
    id: newUser.id,
    fullName: newUser.full_name || fullName,
    phoneNumber: newUser.phone_number || phoneNumber,
    carrier: newUser.carrier || carrier,
    role: newUser.role || 'MEMBER',
    status: newUser.status || 'ACTIVE',
    isPhoneVerified: true,
    membershipTier: 'Novitiate (Classis I)',
    createdAt: newUser.created_at,
  };

  const token = generateToken(formattedUser);

  return {
    user: formattedUser,
    token,
  };
}

export async function authenticateUser({ phoneNumber, password }) {
  const fetchSql = `
    SELECT u.id, u.full_name, u.phone_number, u.carrier, u.password_hash, u.role, u.status, u.is_phone_verified, u.created_at,
           mt.name as membership_tier,
           ma.id as application_id, ma.status as application_status
    FROM users u
    LEFT JOIN membership_types mt ON u.membership_type_id = mt.id
    LEFT JOIN membership_applications ma ON u.id = ma.user_id
    WHERE u.phone_number = $1
    LIMIT 1
  `;
  const result = await db.query(fetchSql, [phoneNumber]);

  if (result.rows.length === 0) {
    const error = new Error('Invalid credentials.');
    error.status = 401;
    throw error;
  }

  const user = result.rows[0];

  // Check suspension
  if (user.status === 'SUSPENDED') {
    const error = new Error('Your account has been suspended by decree of the High Council.');
    error.status = 403;
    throw error;
  }

  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) {
    const error = new Error('Invalid credentials.');
    error.status = 401;
    throw error;
  }

  const formattedUser = {
    id: user.id,
    fullName: user.full_name,
    phoneNumber: user.phone_number,
    carrier: user.carrier,
    role: user.role,
    status: user.status,
    isPhoneVerified: user.is_phone_verified,
    membershipTier: user.membership_tier || 'Novitiate (Classis I)',
    applicationId: user.application_id,
    applicationStatus: user.application_status || 'PENDING',
    createdAt: user.created_at,
  };

  const token = generateToken(formattedUser);

  return {
    user: formattedUser,
    token,
  };
}

export default {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  registerUser,
  authenticateUser,
};

