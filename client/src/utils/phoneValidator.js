/**
 * Ethiopian Mobile Phone Number Validator & E.164 Normalizer
 * Ethio Telecom: 09... and select 07... (070, 071, 072, 079)
 * Safaricom Ethiopia: 07... (077, 078)
 */

export function validateAndNormalizePhone(rawPhone, defaultCountryCode = '+251') {
  if (!rawPhone) {
    return {
      isValid: false,
      normalized: '',
      carrier: null,
      errorKey: 'nameRequired',
    };
  }

  // Remove spaces, hyphens, parentheses, and trailing/leading whitespace
  let clean = rawPhone.replace(/[\s\-\(\)\.]/g, '');

  let e164 = '';
  let carrier = null;

  // If starts with 00, replace with +
  if (clean.startsWith('00')) {
    clean = '+' + clean.slice(2);
  }

  // If starts with +251
  if (clean.startsWith('+251')) {
    const nationalPart = clean.slice(4);
    if (nationalPart.length === 9 && (nationalPart.startsWith('9') || nationalPart.startsWith('7'))) {
      e164 = '+251' + nationalPart;
    }
  } else if (clean.startsWith('251')) {
    const nationalPart = clean.slice(3);
    if (nationalPart.length === 9 && (nationalPart.startsWith('9') || nationalPart.startsWith('7'))) {
      e164 = '+251' + nationalPart;
    }
  } else if (clean.startsWith('0')) {
    // Local Ethiopian 10-digit number e.g. 0911234567 or 0712345678
    const nationalPart = clean.slice(1);
    if (nationalPart.length === 9 && (nationalPart.startsWith('9') || nationalPart.startsWith('7'))) {
      e164 = '+251' + nationalPart;
    }
  } else if (clean.length === 9 && (clean.startsWith('9') || clean.startsWith('7'))) {
    // 9 digits without leading 0 e.g. 911234567
    e164 = '+251' + clean;
  } else if (clean.startsWith('+') && clean.length >= 10 && clean.length <= 16) {
    // Generic valid international number
    e164 = clean;
    carrier = 'carrierOther';
  }

  if (!e164) {
    return {
      isValid: false,
      normalized: clean,
      carrier: null,
      errorKey: 'invalidPhone',
    };
  }

  // Detect Ethiopian carrier if it is an Ethiopian number
  if (e164.startsWith('+251')) {
    const nineDigit = e164.slice(4);
    const prefix2 = nineDigit.slice(0, 2); // 9x or 7x
    const prefix3 = nineDigit.slice(0, 3); // 70x, 77x etc.

    if (prefix2.startsWith('9')) {
      carrier = 'Ethio Telecom';
    } else if (prefix3 === '770' || prefix3 === '771' || prefix3 === '772' || prefix3 === '773' || prefix3 === '774' || prefix3 === '775' || prefix3 === '776' || prefix3 === '777' || prefix3 === '778' || prefix3 === '779') {
      carrier = 'Safaricom Ethiopia';
    } else if (prefix2.startsWith('7')) {
      // General 07 range in Ethiopia shared by Safaricom & Ethio Telecom
      carrier = prefix3.startsWith('70') || prefix3.startsWith('71') || prefix3.startsWith('72') ? 'Ethio Telecom' : 'Safaricom Ethiopia';
    } else {
      carrier = 'Ethiopia Mobile';
    }
  } else {
    carrier = 'International';
  }

  return {
    isValid: true,
    normalized: e164,
    carrier,
    errorKey: null,
  };
}

