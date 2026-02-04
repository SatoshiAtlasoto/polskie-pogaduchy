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
