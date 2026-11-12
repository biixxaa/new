import axios from 'axios';

/**
 * Multilingual SMS Message Templates
 * Compliant with Ethiopian carrier encoding & character budgets
 */
const TEMPLATES = {
  en: (otp) => `Your verification code is ${otp}. It expires in 5 minutes. Do not share this code.`,
  am: (otp) => `የማረጋገጫ ኮድዎ ${otp} ነው። በ5 ደቂቃ ውስጥ ጊዜው ያበቃል። ኮዱን ለማንም አያጋሩ።`,
  om: (otp) => `Koodiin mirkaneessaa keessan ${otp} dha. Daqiiqaa 5 keessatti ni dhuma. Koodicha nama biraatiif hin qoodinaa.`,
};

/**
 * Format OTP message based on recipient's selected language
 */
export function formatOtpMessage(otp, language = 'en') {
  const langKey = TEMPLATES[language] ? language : 'en';
  return TEMPLATES[langKey](otp);
}

/**
 * SMSEthiopia Provider Implementation
 * Official Gateway Specification (smsethiopia.com)
 *
 * Base URL: https://smsethiopia.com/api/sms/send
 * Method: POST
 * Headers:
 *   KEY: <YOUR_SMSETHIOPIA_API_KEY>
 *   Content-Type: application/json
 *   Accept: application/json
 * Payload:
 *   {
 *     "msisdn": "251911234567",
 *     "text": "Your verification code is ...",
 *     "sender_id": "OPTIONAL_REGISTERED_SENDER_ID"
 *   }
 */
export class SMSEthiopiaProvider {
  constructor() {
    this.name = 'SMSEthiopia';
    this.apiKey = process.env.SMSETHIOPIA_API_KEY || '';
    this.senderId = process.env.SMSETHIOPIA_SENDER_ID || '';
    this.apiUrl = process.env.SMSETHIOPIA_ENDPOINT || 'https://smsethiopia.com/api/sms/send';
  }

  /**
   * Validates if legitimate credentials are present
   */
  isConfigured() {
    return Boolean(
      this.apiKey &&
      this.apiKey.trim().length > 0 &&
      !this.apiKey.includes('YOUR_ACTUAL') &&
      !this.apiKey.includes('placeholder')
    );
  }

  /**
   * Formats phone numbers to the official Ethiopian MSISDN national format (without '+')
   * Examples:
   *   +251908426432 -> 251908426432
   *   0908426432    -> 251908426432
   *   0771234567    -> 251771234567
   *   251908426432  -> 251908426432
   */
  formatMsisdn(phoneNumber) {
    if (!phoneNumber) return '';
    let cleaned = String(phoneNumber).replace(/[\s\-\(\)\.]/g, '');
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }
    if (cleaned.startsWith('0')) {
      cleaned = '251' + cleaned.substring(1);
    }
    return cleaned;
  }

  /**
   * Dispatches SMS via SMSEthiopia HTTP API
   */
  async sendSms({ to, message }) {
    if (!this.isConfigured()) {
      throw new Error('SMSEthiopia API key is not configured in environment variables.');
    }

    const msisdn = this.formatMsisdn(to);
    if (!msisdn || msisdn.length < 10) {
      throw new Error(`Invalid Ethiopian recipient number for SMSEthiopia: ${to}`);
    }

    const payload = {
      msisdn,
      text: message,
    };

    // Attach sender_id only if approved custom sender ID is provided
    if (this.senderId && this.senderId.trim().length > 0) {
      payload.sender_id = this.senderId.trim();
    }

    try {
      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          KEY: this.apiKey.trim(),
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 12000,
      });

      const resData = response.data;

      // Handle standard SMSEthiopia success responses
      if (
        response.status === 200 &&
        (resData?.status === 'success' ||
          resData?.message === 'Accepted Successfully' ||
          resData?.status === true ||
          resData?.code === 200 ||
          (!resData?.error && !resData?.status?.toString().includes('error')))
      ) {
        return {
          success: true,
          provider: this.name,
          messageId: resData?.msg_id || resData?.message_id || resData?.id || `smseth-${Date.now()}`,
          raw: resData,
        };
      }

      // Handle structured gateway error responses
      const errorMessage =
        resData?.message ||
        resData?.error ||
        resData?.detail ||
        'SMSEthiopia gateway rejected message dispatch.';
      throw new Error(`SMSEthiopia Gateway Rejection: ${errorMessage}`);
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        const serverError =
          err.response.data?.message ||
          err.response.data?.error ||
          err.response.data?.detail ||
          err.response.statusText;

        if (status === 401) {
          throw new Error('SMSEthiopia Authentication Failed: Invalid or revoked API KEY.');
        } else if (status === 402) {
          throw new Error('SMSEthiopia Insufficient Balance: Free 100 SMS credits or account balance exhausted.');
        } else if (status === 400) {
          throw new Error(
            `SMSEthiopia Dispatch Error (400): ${serverError}. If using free trial credits, verify the recipient number is whitelisted in your dashboard.`
          );
        } else if (status === 429) {
          throw new Error('SMSEthiopia Rate Limit: Too many requests dispatched in a short window.');
        }

        throw new Error(`SMSEthiopia HTTP Error ${status}: ${serverError}`);
      }

      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        throw new Error('SMSEthiopia Gateway connection timed out after 12 seconds.');
      }

      throw new Error(`SMSEthiopia network connection failure: ${err.message}`);
    }
  }
}

/**
 * Unified SMS Service with Production Guarantees & Safe Development Sandbox
 */
export class SmsService {
  constructor() {
    this.provider = new SMSEthiopiaProvider();
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  getProvider() {
    return this.provider;
  }

  /**
   * Main entry point for OTP SMS dispatch
   */
  async sendOtpSms({ phoneNumber, otp, language = 'en' }) {
    const message = formatOtpMessage(otp, language);
    const provider = this.getProvider();

    console.log(`📡 [SMS Service] Initiating dispatch to ${phoneNumber} (${language}) via ${provider.name}`);

    // If live credentials are provided, dispatch via real carrier gateway
    if (provider.isConfigured()) {
      const result = await provider.sendSms({ to: phoneNumber, message });
      console.log(`✅ [SMS Service] Dispatched successfully via ${provider.name}. ID: ${result.messageId}`);
      return {
        success: true,
        provider: provider.name,
        messageId: result.messageId,
        isSandbox: false,
      };
    }

    // In production, we MUST NEVER mock or silently fail
    if (this.isProduction) {
      throw new Error(
        'SMS Service Configuration Error: Real SMSETHIOPIA_API_KEY must be configured in production environment variables.'
      );
    }

    // Development / Test Sandbox Mode ONLY
    console.log(`⚠️  [SMS Service - Dev Sandbox] Live SMSEthiopia credentials not detected. Simulating carrier delivery.`);
    console.log(`💬  [Dev SMS Message]: "${message}"`);
    console.log(`🔑  [Dev OTP Key]: ${otp}`);

    return {
      success: true,
      provider: 'SMSEthiopia Dev Sandbox',
      messageId: `dev-sigil-${Date.now()}`,
      isSandbox: true,
      sandboxOtp: otp, // Only populated in non-production environments
    };
  }
}

export const smsService = new SmsService();
export default smsService;
