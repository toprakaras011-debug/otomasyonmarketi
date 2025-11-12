import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT } from '@/app/api/notification-preferences/route';
import { NextRequest } from 'next/server';

// Mock Supabase - createClient is async
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockMaybeSingle = vi.fn();
const mockUpsert = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}));

describe('API: Notification Preferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset chain mocks
    mockSelect.mockReturnThis();
    mockEq.mockReturnThis();
  });

  describe('GET /api/notification-preferences', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe('Yetkisiz erişim');
    });

    it('should return default preferences if user has no preferences', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockMaybeSingle.mockResolvedValue({ data: null, error: null });
      mockSelect.mockReturnValue({
        eq: mockEq,
      });
      mockEq.mockReturnValue({
        maybeSingle: mockMaybeSingle,
      });
      mockFrom.mockReturnValue({
        select: mockSelect,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual({
        email: true,
        purchases: true,
        updates: true,
        sms: false,
      });
    });
  });

  describe('PUT /api/notification-preferences', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = new NextRequest('http://localhost/api/notification-preferences', {
        method: 'PUT',
        body: JSON.stringify({ email: true }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe('Yetkisiz erişim');
    });

    it('should return 400 for invalid JSON', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const request = new NextRequest('http://localhost/api/notification-preferences', {
        method: 'PUT',
        body: 'invalid json',
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe('Geçersiz istek gövdesi');
    });

    it('should sanitize and save preferences', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockUpsert.mockResolvedValue({ error: null });
      mockFrom.mockReturnValue({
        upsert: mockUpsert,
      });

      const request = new NextRequest('http://localhost/api/notification-preferences', {
        method: 'PUT',
        body: JSON.stringify({ email: false, purchases: true }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          email: false,
          purchases: true,
          updates: true, // default
          sms: false, // default
        }),
        { onConflict: 'user_id' }
      );
    });
  });
});

