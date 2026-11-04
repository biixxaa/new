import express from 'express';
import { requireAuth } from '../middlewares/authMiddleware.js';
import db from '../db/index.js';

const router = express.Router();

/**
 * GET /api/member/application
 * Returns the current membership application and stage
 */
router.get('/application', requireAuth, async (req, res, next) => {
  try {
    const sql = `
      SELECT ma.id, ma.status, ma.notes, ma.created_at, ma.updated_at,
             mt.name as tier_name, mt.tier_level, mt.description as tier_description
      FROM membership_applications ma
      LEFT JOIN membership_types mt ON ma.membership_type_id = mt.id
      WHERE ma.user_id = $1
      ORDER BY ma.created_at DESC LIMIT 1
    `;
    const result = await db.query(sql, [req.user.id]);

    const application = result.rows[0] || {
      status: req.user.applicationStatus || 'PENDING',
      notes: req.user.applicationNotes || 'Your petition is inscribed and under council review.',
      tier_name: req.user.membershipTier,
    };

    res.json({
      success: true,
      application,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/member/apply
 * Allows an active Novitiate to petition for degree advancement
 */
router.post('/apply', requireAuth, async (req, res, next) => {
  try {
    const { targetTierId, statement } = req.body;

    const notes = statement
      ? `Advancement Petition: ${statement.slice(0, 500)}`
      : 'Aspirant petitioned for higher degree advancement.';

    const sql = `
      UPDATE membership_applications
      SET status = $1, notes = $2, membership_type_id = $3, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $4
      RETURNING id, status, notes
    `;
    const result = await db.query(sql, ['UNDER_REVIEW', notes, targetTierId || 2, req.user.id]);

    res.json({
      success: true,
      message: 'Petition for higher degree submitted to the Grand Council.',
      application: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

export default router;

