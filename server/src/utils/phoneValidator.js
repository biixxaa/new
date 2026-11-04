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
    const prefix2 = nineDigit.slice(0, 2);
    const prefix3 = nineDigit.slice(0, 3);

    if (prefix2.startsWith('9')) {
      carrier = 'Ethio Telecom';
    } else if (
      prefix3 === '770' ||
      prefix3 === '771' ||
      prefix3 === '772' ||
      prefix3 === '773' ||
      prefix3 === '774' ||
      prefix3 === '775' ||
      prefix3 === '776' ||
      prefix3 === '777' ||
      prefix3 === '778' ||
      prefix3 === '779'
    ) {
      carrier = 'Safaricom Ethiopia';
    } else if (prefix2.startsWith('7')) {
      carrier = prefix3.startsWith('70') || prefix3.startsWith('71') || prefix3.startsWith('72')
        ? 'Ethio Telecom'
        : 'Safaricom Ethiopia';
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

