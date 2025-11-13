import { describe, it, expect } from 'vitest';
import { validateIban, getBankNameFromIban } from '../iban-bank';

describe('IBAN Validation', () => {
  describe('validateIban', () => {
    it('should validate correct Turkish IBAN', () => {
      expect(validateIban('TR330006100519786457841326')).toBe(true);
      expect(validateIban('TR64 0004 6000 0888 8000 0000 01')).toBe(true);
    });

    it('should accept IBAN with spaces, hyphens, and other separators', () => {
      expect(validateIban('TR33 0006 1005 1978 6457 8413 26')).toBe(true);
      expect(validateIban('TR33-0006-1005-1978-6457-8413-26')).toBe(true);
      expect(validateIban('TR33.0006.1005.1978.6457.8413.26')).toBe(true);
    });

    it('should reject invalid IBAN formats', () => {
      expect(validateIban('')).toBe(false);
      expect(validateIban('TR33')).toBe(false);
      expect(validateIban('TR33000610051978645784132')).toBe(false); // Too short
      expect(validateIban('TR3300061005197864578413267')).toBe(false); // Too long
      expect(validateIban('US330006100519786457841326')).toBe(false); // Wrong country
      expect(validateIban('TR33000610051978645784132A')).toBe(false); // Contains letter
    });

    it('should handle case insensitivity', () => {
      expect(validateIban('tr330006100519786457841326')).toBe(true);
      expect(validateIban('Tr330006100519786457841326')).toBe(true);
    });
  });

  describe('getBankNameFromIban', () => {
    it('should return correct bank name for known prefixes', () => {
      expect(getBankNameFromIban('TR330006100519786457841326')).toBe('Türkiye İş Bankası');
      expect(getBankNameFromIban('TR6400046000088880000000001')).toBe('Ziraat Bankası');
      expect(getBankNameFromIban('TR460000000000000000000001')).toBe('Akbank');
      expect(getBankNameFromIban('TR670000000000000000000001')).toBe('Garanti BBVA');
    });

    it('should handle IBAN with spaces', () => {
      expect(getBankNameFromIban('TR33 0006 1005 1978 6457 8413 26')).toBe('Türkiye İş Bankası');
      expect(getBankNameFromIban('TR64-0004-6000-0888-8000-0000-01')).toBe('Ziraat Bankası');
    });

    it('should return null for unknown prefixes', () => {
      // TR99 is actually Yapı Kredi, use a prefix that doesn't exist
      expect(getBankNameFromIban('TRAA0000000000000000000001')).toBe(null);
    });

    it('should return null for invalid inputs', () => {
      expect(getBankNameFromIban('')).toBe(null);
      expect(getBankNameFromIban('TR')).toBe(null);
      expect(getBankNameFromIban('INVALID')).toBe(null);
    });

    it('should handle case insensitivity', () => {
      expect(getBankNameFromIban('tr330006100519786457841326')).toBe('Türkiye İş Bankası');
      expect(getBankNameFromIban('Tr330006100519786457841326')).toBe('Türkiye İş Bankası');
    });
  });
});

