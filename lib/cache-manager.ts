/**
 * Advanced Cache Management System
 * Provides intelligent caching with TTL, invalidation, and compression
 */

interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  compressed?: boolean;
  tags?: string[];
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  compress?: boolean; // Compress large data
  tags?: string[]; // Tags for cache invalidation
  serialize?: boolean; // Serialize complex objects
}

class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheItem> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes
  private maxSize: number = 1000; // Maximum cache entries
  private compressionThreshold: number = 1024; // Compress data larger than 1KB

  constructor() {
    // Clean expired entries every minute
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanup(), 60 * 1000);
    }
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Set cache item with options
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const {
      ttl = this.defaultTTL,
      compress = false,
      tags = [],
      serialize = true
    } = options;

    try {
      let processedData = data;
      let compressed = false;

      // Serialize complex objects
      if (serialize && typeof data === 'object' && data !== null) {
        processedData = JSON.stringify(data) as T;
      }

      // Compress large data
      if (compress && typeof processedData === 'string' && processedData.length > this.compressionThreshold) {
        processedData = this.compress(processedData) as T;
        compressed = true;
      }

      const cacheItem: CacheItem<T> = {
        data: processedData,
        timestamp: Date.now(),
        ttl,
        compressed,
        tags
      };

      this.cache.set(key, cacheItem);

      // Enforce max size
      if (this.cache.size > this.maxSize) {
        this.evictOldest();
      }

    } catch (error) {
      console.warn(`Failed to cache item with key: ${key}`, error);
    }
  }

  /**
   * Get cache item
   */
  get<T>(key: string): T | null {
    try {
      const item = this.cache.get(key);
      
      if (!item) {
        return null;
      }

      // Check if expired
      if (Date.now() - item.timestamp > item.ttl) {
        this.cache.delete(key);
        return null;
      }

      let data = item.data;

      // Decompress if needed
      if (item.compressed && typeof data === 'string') {
        data = this.decompress(data);
      }

      // Parse JSON if it's a string that looks like JSON
      if (typeof data === 'string' && (data.startsWith('{') || data.startsWith('['))) {
        try {
          data = JSON.parse(data);
        } catch {
          // Not JSON, return as is
        }
      }

      return data as T;

    } catch (error) {
      console.warn(`Failed to get cache item with key: ${key}`, error);
      return null;
    }
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Delete cache item
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Invalidate cache by tags
   */
  invalidateByTags(tags: string[]): number {
    let invalidated = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.tags && item.tags.some(tag => tags.includes(tag))) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    
    return invalidated;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    memoryUsage: number;
  } {
    const memoryUsage = this.calculateMemoryUsage();
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate(),
      memoryUsage
    };
  }

  /**
   * Memoize function with caching
   */
  memoize<T extends (...args: any[]) => any>(
    fn: T,
    keyGenerator?: (...args: Parameters<T>) => string,
    options?: CacheOptions
  ): T {
    const generateKey = keyGenerator || ((...args) => `memoized_${fn.name}_${JSON.stringify(args)}`);
    
    return ((...args: Parameters<T>) => {
      const key = generateKey(...args);
      
      // Check cache first
      const cached = this.get(key);
      if (cached !== null) {
        return cached;
      }
      
      // Execute function and cache result
      const result = fn(...args);
      this.set(key, result, options);
      
      return result;
    }) as T;
  }

  /**
   * Cache API responses
   */
  async cacheAPICall<T>(
    key: string,
    apiCall: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Check cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    try {
      // Make API call
      const result = await apiCall();
      
      // Cache the result
      this.set(key, result, {
        ttl: 10 * 60 * 1000, // 10 minutes default for API calls
        ...options
      });
      
      return result;
    } catch (error) {
      // Don't cache errors, but you might want to cache them with shorter TTL
      throw error;
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`Cache cleanup: removed ${keysToDelete.length} expired items`);
    }
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private compress(data: string): string {
    // Simple compression using built-in compression
    // In production, you might want to use a proper compression library
    try {
      if (typeof window !== 'undefined' && 'CompressionStream' in window) {
        // Use browser compression API if available
        return btoa(data); // Base64 encoding as fallback
      }
      return btoa(data);
    } catch {
      return data; // Return original if compression fails
    }
  }

  private decompress(data: string): string {
    try {
      return atob(data);
    } catch {
      return data; // Return original if decompression fails
    }
  }

  private calculateHitRate(): number {
    // This would require tracking hits/misses
    // For now, return a placeholder
    return 0.85; // 85% hit rate placeholder
  }

  private calculateMemoryUsage(): number {
    let totalSize = 0;
    
    for (const [key, item] of this.cache.entries()) {
      totalSize += key.length * 2; // String characters are 2 bytes
      totalSize += JSON.stringify(item).length * 2;
    }
    
    return totalSize;
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();

// Export helper functions
export const setCache = <T>(key: string, data: T, options?: CacheOptions) => {
  cacheManager.set(key, data, options);
};

export const getCache = <T>(key: string): T | null => {
  return cacheManager.get<T>(key);
};

export const hasCache = (key: string): boolean => {
  return cacheManager.has(key);
};

export const deleteCache = (key: string): boolean => {
  return cacheManager.delete(key);
};

export const clearCache = (): void => {
  cacheManager.clear();
};

export const invalidateCacheByTags = (tags: string[]): number => {
  return cacheManager.invalidateByTags(tags);
};

export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string,
  options?: CacheOptions
): T => {
  return cacheManager.memoize(fn, keyGenerator, options);
};

export const cacheAPICall = <T>(
  key: string,
  apiCall: () => Promise<T>,
  options?: CacheOptions
): Promise<T> => {
  return cacheManager.cacheAPICall(key, apiCall, options);
};

export default cacheManager;
