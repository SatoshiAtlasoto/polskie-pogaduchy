import { describe, it, expect } from 'vitest';
import { formatNip, isValidNip, formatPostalCode, formatPhone, isValidPhone, extractPhoneDigits } from './validators';

describe('formatNip', () => {
  it('formats NIP with dashes correctly', () => {
    expect(formatNip('1234567890')).toBe('123-456-78-90');
  });

  it('removes non-digit characters and formats', () => {
    expect(formatNip('123-456-78-90')).toBe('123-456-78-90');
    expect(formatNip('123 456 78 90')).toBe('123-456-78-90');
  });

  it('handles partial input', () => {
    expect(formatNip('12')).toBe('12');
    expect(formatNip('123')).toBe('123');
    expect(formatNip('1234')).toBe('123-4');
    expect(formatNip('123456')).toBe('123-456');
    expect(formatNip('1234567')).toBe('123-456-7');
    expect(formatNip('12345678')).toBe('123-456-78');
    expect(formatNip('123456789')).toBe('123-456-78-9');
  });

  it('truncates input longer than 10 digits', () => {
    expect(formatNip('12345678901234')).toBe('123-456-78-90');
  });
});

describe('isValidNip', () => {
  it('validates correct NIP checksums', () => {
    // Known valid NIPs (checksum verified)
    expect(isValidNip('5261040828')).toBe(true); // Example valid NIP
    expect(isValidNip('526-104-08-28')).toBe(true); // Same with dashes
  });

  it('rejects invalid NIP checksums', () => {
    expect(isValidNip('1234567890')).toBe(false); // Invalid checksum (sum=210, 210%11=1, not 0)
    expect(isValidNip('5261040829')).toBe(false); // Valid NIP with last digit changed from 8 to 9
    expect(isValidNip('1234567891')).toBe(false); // Invalid checksum
  });

  it('rejects NIPs with wrong length', () => {
    expect(isValidNip('123456789')).toBe(false); // 9 digits
    expect(isValidNip('12345678901')).toBe(false); // 11 digits
    expect(isValidNip('')).toBe(false);
  });
});

describe('formatPostalCode', () => {
  it('formats postal code with dash correctly', () => {
    expect(formatPostalCode('00001')).toBe('00-001');
  });

  it('handles partial input', () => {
    expect(formatPostalCode('0')).toBe('0');
    expect(formatPostalCode('00')).toBe('00');
    expect(formatPostalCode('000')).toBe('00-0');
  });

  it('removes non-digit characters', () => {
    expect(formatPostalCode('00-001')).toBe('00-001');
    expect(formatPostalCode('00 001')).toBe('00-001');
  });
});

describe('formatPhone', () => {
  it('formats phone number with +48 prefix and spaces', () => {
    expect(formatPhone('123456789')).toBe('+48 123 456 789');
  });

  it('handles input with existing +48 prefix', () => {
    expect(formatPhone('+48 123 456 789')).toBe('+48 123 456 789');
    expect(formatPhone('48123456789')).toBe('+48 123 456 789');
  });

  it('handles partial input', () => {
    expect(formatPhone('1')).toBe('+48 1');
    expect(formatPhone('12')).toBe('+48 12');
    expect(formatPhone('123')).toBe('+48 123');
    expect(formatPhone('1234')).toBe('+48 123 4');
    expect(formatPhone('123456')).toBe('+48 123 456');
    expect(formatPhone('1234567')).toBe('+48 123 456 7');
  });

  it('removes non-digit characters', () => {
    expect(formatPhone('123-456-789')).toBe('+48 123 456 789');
    expect(formatPhone('123 456 789')).toBe('+48 123 456 789');
  });
});

describe('isValidPhone', () => {
  it('validates correct 9-digit phone numbers', () => {
    expect(isValidPhone('123456789')).toBe(true);
    expect(isValidPhone('+48 123 456 789')).toBe(true);
    expect(isValidPhone('48123456789')).toBe(true);
  });

  it('rejects phone numbers with wrong length', () => {
    expect(isValidPhone('12345678')).toBe(false); // 8 digits
    expect(isValidPhone('1234567890')).toBe(false); // 10 digits
    expect(isValidPhone('')).toBe(false);
  });
});

describe('extractPhoneDigits', () => {
  it('extracts 9 digits from formatted phone', () => {
    expect(extractPhoneDigits('+48 123 456 789')).toBe('123456789');
    expect(extractPhoneDigits('48123456789')).toBe('123456789');
    expect(extractPhoneDigits('123456789')).toBe('123456789');
  });
});
