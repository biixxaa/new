import axios from 'axios';

/**
 * Multilingual SMS Message Templates
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
 * Standard Ethiopian SMS Gateway (smsethiopia.com)
 * API Spec:
 *   POST https://smsethiopia.com/api/sms/send
 *   Header: KEY: <API_KEY>
 *   Body: { msisdn: "251908426432", text: "..." }
 */
export class SMSEthiopiaProvider {
  constructor() {
    this.name = 'SMSEthiopia';
    this.apiKey = process.env.SMSETHIOPIA_API_KEY || '';
    this.apiUrl = process.env.SMSETHIOPIA_ENDPOINT || 'https://smsethiopia.com/api/sms/send';
  }

  isConfigured() {
    return Boolean(
      this.apiKey &&
      this.apiKey.trim().length > 0 &&
      !this.apiKey.includes('YOUR_ACTUAL') &&
      !this.apiKey.includes('placeholder')
    );
  }

  formatMsisdn(phoneNumber) {
    if (!phoneNumber) return '';
    let cleaned = String(phoneNumber).replace(/[\s\-\(\)]/g, '');
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }
    if (cleaned.startsWith('0')) {
      cleaned = '251' + cleaned.substring(1);
    }
    return cleaned;
  }

  async sendSms({ to, message }) {
    if (!this.isConfigured()) {
      throw new Error('SMSEthiopia API key not configured');
    }

    const msisdn = this.formatMsisdn(to);

    try {
      const payload = {
        msisdn,
        text: message,
      };

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          KEY: this.apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 10000,
      });

      if (
        response.data &&
        (response.data.status === 'success' ||
          response.data.status === true ||
          response.data.code === 200 ||
          response.data.status === 200 ||
          (!response.data.error && response.status === 200))
      ) {
        return {
          success: true,
          provider: this.name,
          messageId: response.data.msg_id || response.data.message_id || response.data.id || `smseth-${Date.now()}`,
          raw: response.data,
        };
      } else {
        const errorDetail = response.data?.message || response.data?.error || 'SMSEthiopia returned an unfulfilled dispatch code';
        throw new Error(`SMSEthiopia Error: ${errorDetail}`);
      }
    } catch (err) {
      if (err.response) {
        const errorMsg = err.response.data?.message || err.response.data?.error || `HTTP ${err.response.status}`;
        throw new Error(`SMSEthiopia transmission failed: ${errorMsg}`);
      }
      throw new Error(`SMSEthiopia network failure: ${err.message}`);
    }
  }
}

/**
 * eSMS Africa SMS Provider Implementation
 */
export class ESMSAfricaProvider {
  constructor() {
    this.name = 'eSMS Africa';
    this.apiKey = process.env.ESMS_AFRICA_API_KEY || '';
    this.senderId = process.env.ESMS_AFRICA_SENDER_ID || '';
    this.apiUrl = process.env.ESMS_AFRICA_ENDPOINT || 'https://api.esmsafrica.com/v1/sms/send';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async sendSms({ to, message }) {
    if (!this.isConfigured()) {
      throw new Error('eSMS Africa credentials not configured');
    }

    try {
      const payload = {
        recipient: to,
        message: message,
      };

      if (this.senderId) {
        payload.sender_id = this.senderId;
      }

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 10000,
      });

      if (response.data && (response.data.status === 'success' || response.status === 200 || response.data.code === 200)) {
        return {
          success: true,
          provider: this.name,
          messageId: response.data.message_id || response.data.id || 'esms-' + Date.now(),
        };
      } else {
        const errorDetail = response.data?.message || response.data?.error || 'SMS Gateway returned non-success response';
        throw new Error(`eSMS Africa Error: ${errorDetail}`);
      }
    } catch (err) {
      if (err.response) {
        const errorMsg = err.response.data?.message || err.response.data?.error || `HTTP ${err.response.status}`;
        throw new Error(`eSMS Africa transmission failed: ${errorMsg}`);
      }
      throw new Error(`eSMS Africa network failure: ${err.message}`);
    }
  }
}

/**
 * Unified SMS Service with Provider Routing & Development Sandbox
 */
export class SmsService {
  constructor() {
    this.providers = {
      smsethiopia: new SMSEthiopiaProvider(),
      esms_africa: new ESMSAfricaProvider(),
    };
    this.activeProviderKey = (process.env.SMS_PROVIDER || 'smsethiopia').toLowerCase();
  }

  getProvider() {
    return this.providers[this.activeProviderKey] || this.providers.smsethiopia;
  }

  async sendOtpSms({ phoneNumber, otp, language = 'en' }) {
    const message = formatOtpMessage(otp, language);
    const provider = this.getProvider();

    console.log(`📡 [SMS Service] Initiating dispatch to ${phoneNumber} in language '${language}' via ${provider.name}`);

    // If live credentials are provided, use real provider
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

    // Development / Sandbox Mode (if no live API key in environment)
    console.log(`⚠️  [SMS Service - Dev Sandbox] Live API credentials not configured for ${provider.name}. Simulating carrier delivery.`);
    console.log(`💬  [SMS Message Body]: "${message}"`);
    console.log(`🔑  [Dev OTP Key]: ${otp}`);

    return {
      success: true,
      provider: `${provider.name} Dev Sandbox`,
      messageId: `dev-sigil-${Date.now()}`,
      isSandbox: true,
      sandboxOtp: otp, // only in non-production
    };
  }
}

export const smsService = new SmsService();
export default smsService;
