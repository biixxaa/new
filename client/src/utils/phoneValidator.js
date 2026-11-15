/**
 * Ethiopian Mobile Phone Number Validator & E.164 Normalizer
 * Ethio Telecom: 09... (+2519...)
 * Safaricom Ethiopia: 07... (+2517...)
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
    // Local Ethiopian 10-digit number e.g. 0911234567 or 0707816833
    const nationalPart = clean.slice(1);
    if (nationalPart.length === 9 && (nationalPart.startsWith('9') || nationalPart.startsWith('7'))) {
      e164 = '+251' + nationalPart;
    }
  } else if (clean.length === 9 && (clean.startsWith('9') || clean.startsWith('7'))) {
    // 9 digits without leading 0 e.g. 911234567 or 707816833
    e164 = '+251' + clean;
  } else if (clean.startsWith('+') && clean.length >= 10 && clean.length <= 16) {
    // Generic valid international number
    e164 = clean;
    carrier = 'International';
  }

  if (!e164) {
    return {
      isValid: false,
      normalized: clean,
      carrier: null,
      errorKey: 'invalidPhone',
    };
  }

  // Detect Ethiopian carrier accurately:
  // 09... (+2519...) = Ethio Telecom
  // 07... (+2517...) = Safaricom Ethiopia
  if (e164.startsWith('+251')) {
    const nineDigit = e164.slice(4);
    if (nineDigit.startsWith('9')) {
      carrier = 'Ethio Telecom';
    } else if (nineDigit.startsWith('7')) {
      carrier = 'Safaricom Ethiopia';
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

