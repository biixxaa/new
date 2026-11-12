import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { SMSEthiopiaProvider, smsService } from '../src/services/smsService.js';

async function runTest() {
  const targetNumber = process.argv[2] || process.env.SMSETHIOPIA_TEST_NUMBER || '251908426432';
  const lang = process.argv[3] || 'en';
  const customKey = process.argv[4] || process.env.SMSETHIOPIA_API_KEY;

  if (process.argv[4]) {
    process.env.SMSETHIOPIA_API_KEY = customKey;
    smsService.provider.apiKey = customKey;
  }

  const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const provider = smsService.getProvider();
  const formattedMsisdn = provider.formatMsisdn(targetNumber);

  console.log('===============================================================');
  console.log('      ORDO ILLUMINATORUM — SMSEthiopia Gateway Verification    ');
  console.log('===============================================================');
  console.log(`Gateway Provider    : ${provider.name} (Official API)`);
  console.log(`Endpoint            : ${provider.apiUrl}`);
  console.log(`Raw Phone Input     : ${targetNumber}`);
  console.log(`Normalized MSISDN   : ${formattedMsisdn}`);
  console.log(`Language Template   : ${lang}`);
  console.log(`Generated OTP       : ${testOtp}`);
  console.log(`API Key Configured  : ${provider.isConfigured() ? 'YES (Live Gateway Dispatch)' : 'NO (Development Sandbox)'}`);
  if (provider.senderId) {
    console.log(`Sender ID (Custom)  : ${provider.senderId}`);
  }
  console.log('---------------------------------------------------------------');

  try {
    const result = await smsService.sendOtpSms({
      phoneNumber: targetNumber,
      otp: testOtp,
      language: lang,
    });

    console.log('---------------------------------------------------------------');
    console.log('Status              : SUCCESS');
    console.log(`Provider            : ${result.provider}`);
    console.log(`Message ID          : ${result.messageId}`);
    console.log(`Is Sandbox Mode     : ${result.isSandbox}`);
    
    if (result.isSandbox) {
      console.log('\n⚠️  [Development Sandbox Active]');
      console.log('Reason: SMSETHIOPIA_API_KEY in server/.env is set to a placeholder.');
      console.log('To dispatch live SMS to your physical device using your 100 free test credits:');
      console.log('  1. Log into your account at https://smsethiopia.com');
      console.log('  2. Copy your API Key from Console -> API Keys');
      console.log('  3. In your dashboard, ensure your test number is added / whitelisted');
      console.log('  4. Set SMSETHIOPIA_API_KEY=<your_key> in server/.env');
      console.log(`  5. Run: node server/test/test_sms.js ${targetNumber}`);
    } else {
      console.log('\n🎉 [LIVE TELECOM DISPATCH CONFIRMED]');
      console.log(`A real SMS containing OTP [${testOtp}] was accepted by SMSEthiopia for delivery to ${formattedMsisdn}.`);
    }
    console.log('===============================================================');
  } catch (error) {
    console.error('---------------------------------------------------------------');
    console.error('Status              : DISPATCH FAILED');
    console.error(`Error Message       : ${error.message}`);
    console.error('\n🛠️  Troubleshooting Checklist:');
    console.error('  • Check if your API Key in server/.env is correct and active.');
    console.error('  • Free trial accounts (100 free SMS) can only send to verified test numbers.');
    console.error('  • Ensure your recipient number is active and capable of receiving SMS.');
    console.error('  • Check if your SMSEthiopia account balance has remaining credits.');
    console.error('===============================================================');
    process.exit(1);
  }
}

runTest();
