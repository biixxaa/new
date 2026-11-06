import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { smsService } from '../src/services/smsService.js';

async function runTest() {
  const targetNumber = process.argv[2] || process.env.SMSETHIOPIA_TEST_NUMBER || '251908426432';
  const lang = process.argv[3] || 'en';
  const testOtp = Math.floor(100000 + Math.random() * 900000).toString();

  console.log('==================================================');
  console.log('   ORDO ILLUMINATORUM - SMS GATEWAY TEST UTILITY  ');
  console.log('==================================================');
  console.log(`Active Provider : ${process.env.SMS_PROVIDER || 'smsethiopia'}`);
  console.log(`Target Phone    : ${targetNumber}`);
  console.log(`Language        : ${lang}`);
  console.log(`Generated OTP   : ${testOtp}`);
  console.log(`API Key Configured : ${process.env.SMSETHIOPIA_API_KEY && process.env.SMSETHIOPIA_API_KEY !== 'YOUR_ACTUAL_API_KEY' ? 'YES (Live Mode)' : 'NO (Sandbox Mode)'}`);
  console.log('--------------------------------------------------');

  try {
    const result = await smsService.sendOtpSms({
      phoneNumber: targetNumber,
      otp: testOtp,
      language: lang,
    });

    console.log('--------------------------------------------------');
    console.log('Result Status   : SUCCESS');
    console.log('Provider Used   : ' + result.provider);
    console.log('Message ID      : ' + result.messageId);
    console.log('Is Sandbox      : ' + result.isSandbox);
    if (result.isSandbox) {
      console.log('⚠️  Note: Running in sandbox mode because SMSETHIOPIA_API_KEY is placeholder.');
      console.log('👉 To send real SMS to your phone, set SMSETHIOPIA_API_KEY in server/.env with your real key.');
    } else {
      console.log('🎉 Live SMS dispatched successfully to carrier gateway!');
    }
    console.log('==================================================');
  } catch (error) {
    console.error('--------------------------------------------------');
    console.error('Result Status   : FAILED');
    console.error('Error Details   : ' + error.message);
    console.log('==================================================');
    process.exit(1);
  }
}

runTest();

