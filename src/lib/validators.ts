import { z } from 'zod';

/**
 * Validates Polish postal code format (XX-XXX)
 */
export const postalCodeSchema = z
  .string()
  .regex(/^\d{2}-\d{3}$/, 'Format: XX-XXX');

/**
 * Formats postal code with automatic dash insertion
 */
export function formatPostalCode(value: string): string {
  const digits = value.replace(/[^\d]/g, '');
  if (digits.length > 2) {
    return digits.slice(0, 2) + '-' + digits.slice(2, 5);
  }
  return digits;
}

/**
 * Validates Polish NIP (tax identification number)
 * Format: XXX-XXX-XX-XX or XXXXXXXXXX (10 digits)
 * Includes checksum validation
 */
export const nipSchema = z
  .string()
  .transform((val) => val.replace(/[^\d]/g, ''))
  .refine((val) => val.length === 10, {
    message: 'NIP musi mieć 10 cyfr',
  })
  .refine(
    (val) => {
      // NIP checksum validation
      const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
      const digits = val.split('').map(Number);
      const sum = weights.reduce((acc, weight, i) => acc + weight * digits[i], 0);
      const checksum = sum % 11;
      return checksum === digits[9];
    },
    {
      message: 'Nieprawidłowy numer NIP',
    }
  );

/**
 * Formats NIP with automatic dash insertion (XXX-XXX-XX-XX)
 */
export function formatNip(value: string): string {
  const digits = value.replace(/[^\d]/g, '');
  let formatted = '';
  
  if (digits.length > 0) {
    formatted = digits.slice(0, 3);
  }
  if (digits.length > 3) {
    formatted += '-' + digits.slice(3, 6);
  }
  if (digits.length > 6) {
    formatted += '-' + digits.slice(6, 8);
  }
  if (digits.length > 8) {
    formatted += '-' + digits.slice(8, 10);
  }
  
  return formatted;
}

/**
 * Validates NIP without zod (returns boolean)
 */
export function isValidNip(nip: string): boolean {
  const digits = nip.replace(/[^\d]/g, '');
  if (digits.length !== 10) return false;
  
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  const nums = digits.split('').map(Number);
  const sum = weights.reduce((acc, weight, i) => acc + weight * nums[i], 0);
  
  return sum % 11 === nums[9];
}

/**
 * Validates Polish phone number format (+48 XXX XXX XXX)
 * Accepts 9 digits (Polish mobile/landline) with optional +48 prefix
 */
export const phoneSchema = z
  .string()
  .transform((val) => val.replace(/[^\d]/g, ''))
  .refine((val) => val.length === 9 || (val.startsWith('48') && val.length === 11), {
    message: 'Numer telefonu musi mieć 9 cyfr',
  })
  .transform((val) => (val.startsWith('48') ? val.slice(2) : val));

/**
 * Formats phone number with automatic spacing (+48 XXX XXX XXX)
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/[^\d]/g, '');
  
  // Remove leading 48 if present
  const cleanDigits = digits.startsWith('48') ? digits.slice(2) : digits;
  
  let formatted = '+48 ';
  
  if (cleanDigits.length > 0) {
    formatted += cleanDigits.slice(0, 3);
  }
  if (cleanDigits.length > 3) {
    formatted += ' ' + cleanDigits.slice(3, 6);
  }
  if (cleanDigits.length > 6) {
    formatted += ' ' + cleanDigits.slice(6, 9);
  }
  
  return formatted.trim();
}

/**
 * Validates Polish phone number without zod (returns boolean)
 */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/[^\d]/g, '');
  const cleanDigits = digits.startsWith('48') ? digits.slice(2) : digits;
  return cleanDigits.length === 9;
}

/**
 * Extracts raw 9-digit phone number from formatted string
 */
export function extractPhoneDigits(phone: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  return digits.startsWith('48') ? digits.slice(2) : digits;
}

/**
 * Validates Polish REGON (business identification number)
 * Format: 9 digits or 14 digits with checksum validation
 */
export const regonSchema = z
  .string()
  .transform((val) => val.replace(/[^\d]/g, ''))
  .refine((val) => val.length === 9 || val.length === 14, {
    message: 'REGON musi mieć 9 lub 14 cyfr',
  })
  .refine(
    (val) => isValidRegon(val),
    {
      message: 'Nieprawidłowy numer REGON (błędna suma kontrolna)',
    }
  );

/**
 * Validates REGON without zod (returns boolean)
 */
export function isValidRegon(regon: string): boolean {
  const digits = regon.replace(/[^\d]/g, '');
  
  if (digits.length !== 9 && digits.length !== 14) return false;
  
  const nums = digits.split('').map(Number);
  
  // Validate first 9 digits
  const weights9 = [8, 9, 2, 3, 4, 5, 6, 7];
  const sum9 = weights9.reduce((acc, weight, i) => acc + weight * nums[i], 0);
  const checksum9 = sum9 % 11;
  const expectedCheckDigit9 = checksum9 === 10 ? 0 : checksum9;
  
  if (nums[8] !== expectedCheckDigit9) return false;
  
  // If 14 digits, validate the additional 5 digits
  if (digits.length === 14) {
    const weights14 = [2, 4, 8, 5, 0, 9, 7, 3, 6, 1, 2, 4, 8];
    const sum14 = weights14.reduce((acc, weight, i) => acc + weight * nums[i], 0);
    const checksum14 = sum14 % 11;
    const expectedCheckDigit14 = checksum14 === 10 ? 0 : checksum14;
    
    if (nums[13] !== expectedCheckDigit14) return false;
  }
  
  return true;
}

/**
 * Formats REGON with automatic spacing (XXX XXX XXX or XX XXX XXXXX XXXXX)
 */
export function formatRegon(value: string): string {
  const digits = value.replace(/[^\d]/g, '').slice(0, 14);
  
  if (digits.length <= 9) {
    // 9-digit format: XXX XXX XXX
    let formatted = '';
    if (digits.length > 0) formatted = digits.slice(0, 3);
    if (digits.length > 3) formatted += ' ' + digits.slice(3, 6);
    if (digits.length > 6) formatted += ' ' + digits.slice(6, 9);
    return formatted;
  } else {
    // 14-digit format: XX XXX XXXXX XXXXX
    let formatted = digits.slice(0, 2);
    if (digits.length > 2) formatted += ' ' + digits.slice(2, 5);
    if (digits.length > 5) formatted += ' ' + digits.slice(5, 10);
    if (digits.length > 10) formatted += ' ' + digits.slice(10, 14);
    return formatted;
  }
}
