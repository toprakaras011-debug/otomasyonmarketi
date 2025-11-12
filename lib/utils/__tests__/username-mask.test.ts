import { describe, it, expect } from 'vitest';
import { maskUsername, lightMaskUsername, partialMaskUsername } from '../username-mask';

describe('Username Masking', () => {
  describe('maskUsername', () => {
    it('should return default for null/undefined', () => {
      expect(maskUsername(null)).toBe('Kullanıcı');
      expect(maskUsername(undefined)).toBe('Kullanıcı');
    });

    it('should mask short usernames (<=2 chars)', () => {
      expect(maskUsername('a')).toBe('a***');
      expect(maskUsername('ab')).toBe('ab***');
    });

    it('should mask medium usernames (3-4 chars)', () => {
      expect(maskUsername('abc')).toBe('a***c');
      expect(maskUsername('abcd')).toBe('a***d');
    });

    it('should mask long usernames (>4 chars)', () => {
      expect(maskUsername('johndoe')).toBe('joh***doe');
      expect(maskUsername('developer123')).toBe('dev***123');
    });

    it('should trim whitespace', () => {
      expect(maskUsername('  johndoe  ')).toBe('joh***doe');
    });
  });

  describe('lightMaskUsername', () => {
    it('should return default for null/undefined', () => {
      expect(lightMaskUsername(null)).toBe('Kullanıcı');
      expect(lightMaskUsername(undefined)).toBe('Kullanıcı');
    });

    it('should show only 1-2 characters for short usernames', () => {
      expect(lightMaskUsername('a')).toBe('a***');
      expect(lightMaskUsername('ab')).toBe('a***');
      expect(lightMaskUsername('abc')).toBe('a***');
    });

    it('should show 2-3 characters for longer usernames', () => {
      expect(lightMaskUsername('johndoe')).toBe('joh***');
      expect(lightMaskUsername('developer123')).toBe('dev***');
    });
  });

  describe('partialMaskUsername', () => {
    it('should return default for null/undefined', () => {
      expect(partialMaskUsername(null)).toBe('Kullanıcı');
      expect(partialMaskUsername(undefined)).toBe('Kullanıcı');
    });

    it('should mask very short usernames', () => {
      expect(partialMaskUsername('a')).toBe('a***');
      expect(partialMaskUsername('ab')).toBe('a***');
      expect(partialMaskUsername('abc')).toBe('a***');
    });

    it('should mask medium usernames', () => {
      expect(partialMaskUsername('abcd')).toBe('ab***d');
      expect(partialMaskUsername('abcde')).toBe('ab***e');
    });

    it('should mask long usernames', () => {
      expect(partialMaskUsername('johndoe')).toBe('joh***oe');
      expect(partialMaskUsername('developer123')).toBe('dev***23');
    });
  });
});

