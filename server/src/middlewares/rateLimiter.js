import rateLimit from 'express-rate-limit';

// OTP Request Limiter (5 requests per 15 minutes per IP)
export const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: 'Too many OTP requests from this origin. Please wait 15 minutes before attempting again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP Verification Limiter (15 attempts per 15 minutes per IP to block brute-forcing)
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    message: 'Too many verification attempts. Please wait before retrying.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login Limiter (10 attempts per 15 minutes)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    message: 'Too many failed login attempts. Please wait 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

