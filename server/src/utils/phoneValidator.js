/**
 * Ethiopian Mobile Phone Number Validator & E.164 Normalizer (Backend)
 */

export function validateAndNormalizePhone(rawPhone) {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return {
      isValid: false,
      normalized: '',
      carrier: null,
      error: 'Phone number is required.',
    };
  }

  let clean = rawPhone.replace(/[\s\-\(\)\.]/g, '');

  if (clean.startsWith('00')) {
    clean = '+' + clean.slice(2);
  }

  let e164 = '';
  let carrier = null;

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
    const nationalPart = clean.slice(1);
    if (nationalPart.length === 9 && (nationalPart.startsWith('9') || nationalPart.startsWith('7'))) {
      e164 = '+251' + nationalPart;
    }
  } else if (clean.length === 9 && (clean.startsWith('9') || clean.startsWith('7'))) {
    e164 = '+251' + clean;
  } else if (clean.startsWith('+') && clean.length >= 10 && clean.length <= 16) {
    e164 = clean;
    carrier = 'International';
  }

  if (!e164) {
    return {
      isValid: false,
      normalized: clean,
      carrier: null,
      error: 'Invalid Ethiopian or international phone number format.',
    };
  }

  if (e164.startsWith('+251')) {
    const nineDigit = e164.slice(4);
    if (nineDigit.startsWith('9')) {
      carrier = 'Ethio Telecom';
    } else if (nineDigit.startsWith('7')) {
      carrier = 'Safaricom Ethiopia';
    } else {
      carrier = 'Ethiopia Mobile';
    }
  }

  return {
    isValid: true,
    normalized: e164,
    carrier,
    error: null,
  };
}

