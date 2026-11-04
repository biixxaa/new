import express from 'express';
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware.js';
import db from '../db/index.js';

const router = express.Router();

router.use(requireAuth, requireAdmin);

/**
 * GET /api/admin/stats
 * Overview numbers for the Council Dashboard
 */
router.get('/stats', async (req, res, next) => {
  try {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM membership_applications WHERE status IN ('PENDING', 'UNDER_REVIEW')) as pending_apps,
        (SELECT COUNT(*) FROM membership_applications WHERE status = 'APPROVED') as approved_members,
        (SELECT COUNT(*) FROM otp_verifications) as sms_delivered
    `;
    const result = await db.query(statsQuery);
    const row = result.rows[0] || {};

    res.json({
      success: true,
      stats: {
        totalUsers: Number(row.total_users || 0),
        pendingApps: Number(row.pending_apps || 0),
        approvedMembers: Number(row.approved_members || 0),
        smsDelivered: Number(row.sms_delivered || 0),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/users
 * Search and filter registered aspirants and brethren
 */
router.get('/users', async (req, res, next) => {
  try {
    const { search = '', status = 'ALL' } = req.query;

    const sql = `
      SELECT u.id, u.full_name as "fullName", u.phone_number as "phoneNumber", u.carrier,
             u.role, u.status, u.is_phone_verified as "isPhoneVerified", u.created_at as "createdAt",
             mt.name as "membershipTier",
             ma.id as "applicationId", ma.status as "applicationStatus", ma.notes as "applicationNotes"
      FROM users u
      LEFT JOIN membership_types mt ON u.membership_type_id = mt.id
      LEFT JOIN membership_applications ma ON u.id = ma.user_id
      ORDER BY u.created_at DESC
    `;
    const result = await db.query(sql, [search]);

    let filtered = result.rows;

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          (u.fullName && u.fullName.toLowerCase().includes(q)) ||
          (u.phoneNumber && u.phoneNumber.includes(q))
      );
    }

    if (status !== 'ALL') {
      if (status === 'SUSPENDED') {
        filtered = filtered.filter((u) => u.status === 'SUSPENDED');
      } else {
        filtered = filtered.filter((u) => u.applicationStatus === status);
      }
    }

    res.json({
      success: true,
      users: filtered,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/users/:id/status
 * Suspend or activate a vessel account
 */
router.patch('/users/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'SUSPENDED', 'BANNED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status specified.' });
    }

    const updateSql = `
      UPDATE users 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING id, full_name, status
    `;
    const result = await db.query(updateSql, [status, id]);

    // Audit log
    await db.query(
      `INSERT INTO audit_logs (actor_id, action, target_type, target_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.id, `USER_STATUS_${status}`, 'user', id, JSON.stringify({ status })]
    );

    res.json({
      success: true,
      message: `Vessel account has been set to ${status}.`,
      user: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/applications/:id/status
 * Approve or reject membership application
 */
router.patch('/applications/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid application status.' });
    }

    const updateSql = `
      UPDATE membership_applications
      SET status = $1, notes = $2, reviewed_by = $3, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 OR user_id = $4
      RETURNING id, user_id, status, notes
    `;
    const result = await db.query(updateSql, [
      status,
      notes || `Decree ratified by Council Admin ID ${req.user.id}`,
      req.user.id,
      id,
    ]);

    // If approved, optionally elevate user's membership tier
    if (status === 'APPROVED' && result.rows.length > 0) {
      const targetUserId = result.rows[0].user_id;
      await db.query(
        `UPDATE users SET membership_type_id = 2, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [targetUserId]
      );
    }

    // Audit log
    await db.query(
      `INSERT INTO audit_logs (actor_id, action, target_type, target_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.id, `APPLICATION_${status}`, 'application', id, JSON.stringify({ status, notes })]
    );

    res.json({
      success: true,
      message: `Council decree applied: Application marked as ${status}.`,
      application: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/membership-types
 * Returns all configured membership tiers
 */
router.get('/membership-types', async (req, res, next) => {
  try {
    const sql = `SELECT id, name, tier_level as "tierLevel", description, requirements FROM membership_types ORDER BY tier_level ASC`;
    const result = await db.query(sql);

    res.json({
      success: true,
      types: result.rows,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

