import test from 'node:test';
import assert from 'node:assert/strict';

import { validateAndNormalizePhone } from '../src/utils/phoneValidator.js';
import { formatOtpMessage } from '../src/services/smsService.js';
import { generateSecureOtp, hashOtp, sendOtpForPhone, verifyOtpForPhone } from '../src/services/otpService.js';
import { hashPassword, comparePassword, registerUser, authenticateUser, generateToken, verifyToken } from '../src/services/authService.js';
import { initDb, query } from '../src/db/index.js';

test('1. Phone Number Validation & E.164 Normalization', async (t) => {
  await t.test('Normalizes Ethio Telecom 09 series to +2519...', () => {
    const res = validateAndNormalizePhone('0911234567');
    assert.equal(res.isValid, true);
    assert.equal(res.normalized, '+251911234567');
    assert.equal(res.carrier, 'Ethio Telecom');
  });

  await t.test('Normalizes Safaricom Ethiopia 077 series to +2517...', () => {
    const res = validateAndNormalizePhone('0771234567');
    assert.equal(res.isValid, true);
    assert.equal(res.normalized, '+251771234567');
    assert.equal(res.carrier, 'Safaricom Ethiopia');
  });

  await t.test('Accepts pre-formatted E.164 +251912345678', () => {
    const res = validateAndNormalizePhone('+251912345678');
    assert.equal(res.isValid, true);
    assert.equal(res.normalized, '+251912345678');
    assert.equal(res.carrier, 'Ethio Telecom');
  });

  await t.test('Rejects invalid phone numbers', () => {
    const res = validateAndNormalizePhone('012345');
    assert.equal(res.isValid, false);
  });
});

test('2. Three-Language SMS Message Templates', async (t) => {
  const otp = '849201';

  await t.test('English SMS template complies with specifications', () => {
    const msg = formatOtpMessage(otp, 'en');
    assert.equal(msg, `Your verification code is ${otp}. It expires in 5 minutes. Do not share this code.`);
  });

  await t.test('Amharic SMS template complies with specifications', () => {
    const msg = formatOtpMessage(otp, 'am');
    assert.equal(msg, `የማረጋገጫ ኮድዎ ${otp} ነው። በ5 ደቂቃ ውስጥ ጊዜው ያበቃል። ኮዱን ለማንም አያጋሩ።`);
  });

  await t.test('Afaan Oromoo SMS template complies with specifications', () => {
    const msg = formatOtpMessage(otp, 'om');
    assert.equal(msg, `Koodiin mirkaneessaa keessan ${otp} dha. Daqiiqaa 5 keessatti ni dhuma. Koodicha nama biraatiif hin qoodinaa.`);
  });
});

test('3. Cryptographic OTP Generation & Verification', async (t) => {
  await initDb();

  await t.test('Generates 6-digit numeric OTP', () => {
    const code = generateSecureOtp();
    assert.match(code, /^\d{6}$/);
  });

  await t.test('Hashes OTP with salt and verifies successfully', async () => {
    const phone = '+251911999888';
    const sendRes = await sendOtpForPhone(phone, 'en');
    assert.equal(sendRes.success, true);
    assert.ok(sendRes.debugOtp);

    // Verify correct OTP
    const verifyRes = await verifyOtpForPhone(phone, sendRes.debugOtp);
    assert.equal(verifyRes.verified, true);
  });

  await t.test('Fails on incorrect OTP and decrements attempts', async () => {
    const phone = '+251922334455';
    await sendOtpForPhone(phone, 'en');

    try {
      await verifyOtpForPhone(phone, '000000');
      assert.fail('Should have thrown an error for wrong OTP');
    } catch (err) {
      assert.equal(err.status, 400);
      assert.equal(err.attemptsRemaining, 4);
    }
  });
});

test('4. Full-Stack User Registration & Authentication Flow', async (t) => {
  const testPhone = '+251933445566';
  const testPass = 'SolemnVow2026!';

  await t.test('Registers a new initiate and assigns Novitiate degree', async () => {
    const regRes = await registerUser({
      fullName: 'Girmay Berhane',
      phoneNumber: testPhone,
      password: testPass,
      carrier: 'Ethio Telecom',
    });

    assert.ok(regRes.user);
    assert.equal(regRes.user.fullName, 'Girmay Berhane');
    assert.equal(regRes.user.phoneNumber, testPhone);
    assert.equal(regRes.user.membershipTier, 'Novitiate (Classis I)');
    assert.ok(regRes.token);

    // Verify token can be decoded
    const decoded = verifyToken(regRes.token);
    assert.equal(decoded.phone, testPhone);
  });

  await t.test('Prevents duplicate account registration', async () => {
    try {
      await registerUser({
        fullName: 'Imposter',
        phoneNumber: testPhone,
        password: 'AnotherPassword123',
      });
      assert.fail('Duplicate registration should have failed');
    } catch (err) {
      assert.equal(err.status, 409);
    }
  });

  await t.test('Authenticates valid initiate credentials', async () => {
    const loginRes = await authenticateUser({
      phoneNumber: testPhone,
      password: testPass,
    });
    assert.ok(loginRes.token);
    assert.equal(loginRes.user.phoneNumber, testPhone);
  });

  await t.test('Rejects invalid password attempt', async () => {
    try {
      await authenticateUser({
        phoneNumber: testPhone,
        password: 'WrongPassword!',
      });
      assert.fail('Should reject wrong password');
    } catch (err) {
      assert.equal(err.status, 401);
    }
  });
});

test('5. Admin Privileges & Council Decrees', async (t) => {
  await t.test('Admin can fetch dashboard stats', async () => {
    const statsQuery = `
      SELECT (SELECT COUNT(*) FROM users) as total_users,
             (SELECT COUNT(*) FROM membership_applications WHERE status IN ('PENDING', 'UNDER_REVIEW')) as pending_apps
    `;
    const res = await query(statsQuery);
    assert.ok(Number(res.rows[0].total_users) >= 1);
  });
});

test('6. Registration Payment Covenant (BOA & Telebirr 3,499 ETB)', async (t) => {
  await t.test('Records payment proof submission via BOA or Telebirr', async () => {
    const updateSql = `
      UPDATE membership_applications 
      SET payment_method = $1, payment_reference = $2, payment_status = $3, notes = $4 
      WHERE user_id = $5 
      RETURNING id, payment_method, payment_reference, payment_status
    `;
    const res = await query(updateSql, ['BOA', 'FT26019842', 'PENDING', 'BOA Account 242982037 Biniam Miheret', 2]);
    assert.equal(res.rows[0].payment_method, 'BOA');
    assert.equal(res.rows[0].payment_reference, 'FT26019842');
    assert.equal(res.rows[0].payment_status, 'PENDING');
  });

  await t.test('Council Admin verifies registration payment', async () => {
    const approveSql = `
      UPDATE membership_applications 
      SET status = $1, notes = $2, reviewed_by = $3, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $4
      RETURNING id, status, payment_status
    `;
    const res = await query(approveSql, ['APPROVED', 'Payment and initiation covenant ratified', 1, 1]);
    assert.equal(res.rows[0].status, 'APPROVED');
    assert.equal(res.rows[0].payment_status, 'VERIFIED');
  });
});

