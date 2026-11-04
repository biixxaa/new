import crypto from 'crypto';
import db from '../db/index.js';
import smsService from './smsService.js';

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_ATTEMPTS = 5;

/**
 * Generate a cryptographically secure 6-digit OTP string
 */
export function generateSecureOtp() {
  const num = crypto.randomInt(100000, 1000000);
  return num.toString();
}

/**
 * Hash an OTP using SHA-256 with a unique cryptographic salt
 */
export function hashOtp(otp, salt) {
  return crypto.createHash('sha256').update(`${salt}:${otp}`).digest('hex');
}

/**
 * Initiate and dispatch an OTP for a given phone number
 */
export async function sendOtpForPhone(phoneNumber, language = 'en') {
  // 1. Check cooldown from latest active record
  const latestQuery = `
    SELECT id, created_at FROM otp_verifications 
    WHERE phone_number = $1 AND is_used = false 
    ORDER BY created_at DESC LIMIT 1
  `;
  const latestRes = await db.query(latestQuery, [phoneNumber]);

  if (latestRes.rows.length > 0) {
    const lastCreated = new Date(latestRes.rows[0].created_at).getTime();
    const elapsed = Date.now() - lastCreated;
    if (elapsed < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      const error = new Error(`Please wait ${waitSeconds} seconds before requesting a new verification code.`);
      error.status = 429;
      error.waitSeconds = waitSeconds;
      throw error;
    }
  }

  // 2. Generate new OTP & salt
  const otp = generateSecureOtp();
  const salt = crypto.randomBytes(16).toString('hex');
  const otpHash = hashOtp(otp, salt);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS).toISOString();

  // 3. Store securely in database (ONLY hash and salt)
  const insertSql = `
    INSERT INTO otp_verifications (phone_number, otp_hash, salt, expires_at)
    VALUES ($1, $2, $3, $4)
    RETURNING id, created_at
  `;
  await db.query(insertSql, [phoneNumber, otpHash, salt, expiresAt]);

  // 4. Send SMS via configured SMS provider
  const dispatchResult = await smsService.sendOtpSms({
    phoneNumber,
    otp,
    language,
  });

  return {
    success: true,
    phoneNumber,
    expiresInSeconds: 300,
    debugOtp: dispatchResult.isSandbox ? otp : undefined,
  };
}

/**
 * Verify a submitted 6-digit OTP
 */
export async function verifyOtpForPhone(phoneNumber, submittedOtp) {
  if (!submittedOtp || submittedOtp.length !== 6) {
    const error = new Error('Invalid verification code length.');
    error.status = 400;
    throw error;
  }

  // 1. Fetch latest active OTP record
  const fetchSql = `
    SELECT id, otp_hash, salt, attempts, max_attempts, expires_at, is_used
    FROM otp_verifications
    WHERE phone_number = $1 AND is_used = false
    ORDER BY created_at DESC LIMIT 1
  `;
  const result = await db.query(fetchSql, [phoneNumber]);

  if (result.rows.length === 0) {
    const error = new Error('No active verification code found. Please request a new code.');
    error.status = 404;
    throw error;
  }

  const record = result.rows[0];

  // 2. Check maximum attempts
  if (record.attempts >= record.max_attempts) {
    const error = new Error('Maximum incorrect verification attempts exceeded. Please request a new code.');
    error.status = 403;
    error.attemptsRemaining = 0;
    throw error;
  }

  // 3. Check expiration (5 minutes)
  const now = Date.now();
  const expiresAt = new Date(record.expires_at).getTime();
  if (now > expiresAt) {
    const error = new Error('Verification code has expired. Please request a new code.');
    error.status = 410;
    throw error;
  }

  // 4. Validate OTP Hash
  const computedHash = hashOtp(submittedOtp, record.salt);
  const hashesMatch = crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(record.otp_hash));

  if (!hashesMatch) {
    // Increment attempts
    const newAttempts = record.attempts + 1;
    await db.query('UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = $1', [record.id]);
    const remaining = record.max_attempts - newAttempts;

    const error = new Error(
      remaining > 0
        ? `Incorrect verification code. ${remaining} attempts remaining.`
        : 'Maximum incorrect verification attempts exceeded. Please request a new code.'
    );
    error.status = 400;
    error.attemptsRemaining = Math.max(0, remaining);
    throw error;
  }

  // 5. Mark as used
  await db.query('UPDATE otp_verifications SET is_used = true WHERE id = $1', [record.id]);

  // 6. Update user's is_phone_verified in database if user exists
  await db.query('UPDATE users SET is_phone_verified = true WHERE phone_number = $1', [true, phoneNumber]);

  return {
    verified: true,
    phoneNumber,
  };
}

export default {
  generateSecureOtp,
  hashOtp,
  sendOtpForPhone,
  verifyOtpForPhone,
};
