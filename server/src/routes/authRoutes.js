import express from 'express';
import { validateAndNormalizePhone } from '../utils/phoneValidator.js';
import { sendOtpForPhone, verifyOtpForPhone } from '../services/otpService.js';
import { registerUser, authenticateUser } from '../services/authService.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { otpRequestLimiter, otpVerifyLimiter, loginLimiter } from '../middlewares/rateLimiter.js';
import db from '../db/index.js';

const router = express.Router();

/**
 * POST /api/auth/send-otp
 * Generates and transmits a secure 6-digit OTP
 */
router.post('/send-otp', otpRequestLimiter, async (req, res, next) => {
  try {
    const { phoneNumber, language = 'en' } = req.body;

    const validation = validateAndNormalizePhone(phoneNumber);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.error });
    }

    const result = await sendOtpForPhone(validation.normalized, language);

    res.json({
      success: true,
      message: 'Verification key dispatched via sacred telecommunications.',
      phoneNumber: validation.normalized,
      carrier: validation.carrier,
      expiresInSeconds: result.expiresInSeconds,
      debugOtp: result.debugOtp, // Present only in dev/sandbox mode
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/verify-otp
 * Validates the submitted 6-digit OTP
 */
router.post('/verify-otp', otpVerifyLimiter, async (req, res, next) => {
  try {
    const { phoneNumber, otp } = req.body;

    const validation = validateAndNormalizePhone(phoneNumber);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.error });
    }

    const result = await verifyOtpForPhone(validation.normalized, otp);

    // Check if user already exists
    const userRes = await db.query(
      `SELECT u.id, u.full_name, u.phone_number, u.role, u.status, u.is_phone_verified, mt.name as membership_tier 
       FROM users u 
       LEFT JOIN membership_types mt ON u.membership_type_id = mt.id 
       WHERE u.phone_number = $1`,
      [validation.normalized]
    );

    let user = null;
    let token = null;

    if (userRes.rows.length > 0) {
      const u = userRes.rows[0];
      user = {
        id: u.id,
        fullName: u.full_name,
        phoneNumber: u.phone_number,
        role: u.role,
        status: u.status,
        isPhoneVerified: true,
        membershipTier: u.membership_tier,
      };
    }

    res.json({
      success: true,
      message: 'Sacred Sigil verified successfully.',
      verified: true,
      phoneNumber: validation.normalized,
      user,
      token,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/register
 * Completes new user registration after phone verification
 */
router.post('/register', async (req, res, next) => {
  try {
    const { fullName, phoneNumber, password } = req.body;

    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({ message: 'Full recognized name is required.' });
    }

    const validation = validateAndNormalizePhone(phoneNumber);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.error });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Secret passcode must be at least 8 characters long.' });
    }

    const result = await registerUser({
      fullName: fullName.trim(),
      phoneNumber: validation.normalized,
      password,
      carrier: validation.carrier,
    });

    res.status(201).json({
      success: true,
      message: 'Aspirant successfully inscribed into the Sacred Scrolls.',
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 * Authenticates with phone and password
 */
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { phoneNumber, password } = req.body;

    const validation = validateAndNormalizePhone(phoneNumber);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.error });
    }

    if (!password) {
      return res.status(400).json({ message: 'Secret passcode is required.' });
    }

    const result = await authenticateUser({
      phoneNumber: validation.normalized,
      password,
    });

    res.json({
      success: true,
      message: 'Access granted to the Inner Sanctum.',
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Departed safely from the Sanctum.' });
});

/**
 * GET /api/auth/me
 * Returns current authenticated member profile
 */
router.get('/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

export default router;

