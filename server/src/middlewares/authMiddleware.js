import { verifyToken } from '../services/authService.js';
import db from '../db/index.js';

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required to enter this sanctum portal.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    
    // Fetch fresh user record
    const userSql = `
      SELECT u.id, u.full_name, u.phone_number, u.carrier, u.role, u.status, u.is_phone_verified, u.created_at,
             mt.name as membership_tier,
             ma.id as application_id, ma.status as application_status, ma.notes as application_notes
      FROM users u
      LEFT JOIN membership_types mt ON u.membership_type_id = mt.id
      LEFT JOIN membership_applications ma ON u.id = ma.user_id
      WHERE u.id = $1
    `;
    const result = await db.query(userSql, [decoded.id]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'User record not found.' });
    }

    const u = result.rows[0];

    if (u.status === 'SUSPENDED') {
      return res.status(403).json({ message: 'Your vessel has been suspended by High Council decree.' });
    }

    req.user = {
      id: u.id,
      fullName: u.full_name,
      phoneNumber: u.phone_number,
      carrier: u.carrier,
      role: u.role,
      status: u.status,
      isPhoneVerified: u.is_phone_verified,
      membershipTier: u.membership_tier || 'Novitiate (Classis I)',
      applicationId: u.application_id,
      applicationStatus: u.application_status || 'PENDING',
      applicationNotes: u.application_notes,
      createdAt: u.created_at,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session token has expired or is invalid.' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')) {
    return res.status(403).json({ message: 'Access denied: Requires Grand Council Admin credentials.' });
  }
  next();
}

