import express from 'express';
import { requireAuth } from '../middlewares/authMiddleware.js';
import db from '../db/index.js';

const router = express.Router();

// Registration payment details
const PAYMENT_CONFIG = {
  accounts: {
    boa: {
      bankName: 'Bank of Abyssinia (BOA)',
      accountNumber: '242982037',
      accountHolder: 'Biniam Miheret',
    },
    telebirr: {
      provider: 'Telebirr',
      phoneNumber: '0955912092',
      accountHolder: 'Biniam Miheret',
    },
  },
};

/**
 * GET /api/member/payment
 * Returns registration payment instructions and current member payment status
 */
router.get('/payment', requireAuth, async (req, res, next) => {
  try {
    const sql = `
      SELECT id, status, payment_method, payment_reference, payment_status, amount, notes, updated_at
      FROM membership_applications
      WHERE user_id = $1
      ORDER BY created_at DESC LIMIT 1
    `;
    const result = await db.query(sql, [req.user.id]);
    const app = result.rows[0] || {};

    res.json({
      success: true,
      config: PAYMENT_CONFIG,
      payment: {
        applicationId: app.id,
        status: app.status || 'PENDING',
        paymentMethod: app.payment_method || null,
        paymentReference: app.payment_reference || null,
        paymentStatus: app.payment_status || 'UNPAID',
        amount: app.amount || PAYMENT_CONFIG.amount,
        notes: app.notes,
        updatedAt: app.updated_at,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/member/payment
 * Submits transaction proof / reference number for registration fee verification
 */
router.post('/payment', requireAuth, async (req, res, next) => {
  try {
    const { paymentMethod, paymentReference, notes } = req.body;

    if (!paymentMethod || !['BOA', 'TELEBIRR'].includes(paymentMethod.toUpperCase())) {
      return res.status(400).json({ message: 'Valid payment method (BOA or Telebirr) is required.' });
    }

    if (!paymentReference || paymentReference.trim().length < 4) {
      return res.status(400).json({ message: 'Please provide a valid transaction reference or confirmation code.' });
    }

    const cleanRef = paymentReference.trim();
    const memo = notes
      ? `Payment Submitted via ${paymentMethod.toUpperCase()}: Ref ${cleanRef}. Note: ${notes.slice(0, 300)}`
      : `Payment Submitted via ${paymentMethod.toUpperCase()}: Ref ${cleanRef}. Awaiting Council verification.`;

    const updateSql = `
      UPDATE membership_applications
      SET payment_method = $1, payment_reference = $2, payment_status = $3, notes = $4, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $5
      RETURNING id, status, payment_method, payment_reference, payment_status, notes
    `;
    const result = await db.query(updateSql, [
      paymentMethod.toUpperCase(),
      cleanRef,
      'PENDING',
      memo,
      req.user.id,
    ]);

    // Also insert audit log
    await db.query(
      `INSERT INTO audit_logs (actor_id, action, target_type, target_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        req.user.id,
        'REGISTRATION_PAYMENT_SUBMITTED',
        'application',
        result.rows[0]?.id || req.user.id,
        JSON.stringify({ method: paymentMethod, ref: cleanRef, amount: 3499 }),
      ]
    );

    res.json({
      success: true,
      message: 'Consecration payment submitted for Grand Council verification.',
      application: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/member/application
 * Returns the current membership application and stage
 */
router.get('/application', requireAuth, async (req, res, next) => {
  try {
    const sql = `
      SELECT ma.id, ma.status, ma.payment_method, ma.payment_reference, ma.payment_status, ma.amount, ma.notes, ma.created_at, ma.updated_at,
             mt.name as tier_name, mt.tier_level, mt.description as tier_description
      FROM membership_applications ma
      LEFT JOIN membership_types mt ON ma.membership_type_id = mt.id
      WHERE ma.user_id = $1
      ORDER BY ma.created_at DESC LIMIT 1
    `;
    const result = await db.query(sql, [req.user.id]);

    const application = result.rows[0] || {
      status: req.user.applicationStatus || 'PENDING',
      payment_method: null,
      payment_reference: null,
      payment_status: 'UNPAID',
      amount: 3499.00,
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
