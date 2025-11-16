import { describe, it, expect, vi, beforeEach } from 'vitest';
import { monitoring } from '@/lib/monitoring';

describe('Monitoring Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();
    console.warn = vi.fn();
  });

  describe('captureError', () => {
    it('should log error in development', () => {
      const error = new Error('Test error');
      const context = { userId: '123', action: 'test' };

      monitoring.captureError(error, context);

      expect(console.error).toHaveBeenCalledWith(
        '[MONITORING] Error captured:',
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Test error',
          }),
          context: expect.objectContaining({
            userId: '123',
            action: 'test',
          }),
        })
      );
    });
  });

  describe('captureWarning', () => {
    it('should log warning in development', () => {
      monitoring.captureWarning('Test warning', { userId: '123' });

      expect(console.warn).toHaveBeenCalledWith(
        '[MONITORING] Warning:',
        expect.objectContaining({
          message: 'Test warning',
          context: expect.objectContaining({
            userId: '123',
          }),
        })
      );
    });
  });

  describe('trackPerformance', () => {
    it('should log performance metric in development', () => {
      monitoring.trackPerformance('page_load', 1234, { page: '/test' });

      expect(console.log).toHaveBeenCalledWith(
        '[MONITORING] Performance:',
        expect.objectContaining({
          metric: 'page_load',
          value: 1234,
          context: expect.objectContaining({
            page: '/test',
          }),
        })
      );
    });
  });

  describe('trackEvent', () => {
    it('should log event in development', () => {
      monitoring.trackEvent('button_click', { button: 'submit' });

      expect(console.log).toHaveBeenCalledWith(
        '[MONITORING] Event:',
        expect.objectContaining({
          eventName: 'button_click',
          properties: expect.objectContaining({
            button: 'submit',
          }),
        })
      );
    });
  });
});

