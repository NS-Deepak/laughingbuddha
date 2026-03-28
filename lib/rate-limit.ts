import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Max requests per interval
}

// Simple in-memory rate limiter with cleanup
// Note: For production multi-instance deployments, use Redis or similar
class RateLimiter {
  private static cleanupStarted = false;
  private store: Map<string, { count: number; resetTime: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  constructor(private config: RateLimitConfig) {
    // Start cleanup interval only once
    if (!RateLimiter.cleanupStarted) {
      this.startCleanup();
      RateLimiter.cleanupStarted = true;
    }
  }
  
  private startCleanup() {
    // Clean up expired entries every minute
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.store.entries()) {
        if (value.resetTime < now) {
          this.store.delete(key);
        }
      }
    }, 60000);
  }
  
  check(request: NextRequest, token: string): { success: boolean; limit: number; remaining: number; reset: number } {
    const now = Date.now();
    const window = Math.floor(now / this.config.interval);
    const key = `${token}:${window}`;
    
    let entry = this.store.get(key);
    
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + this.config.interval,
      };
      this.store.set(key, entry);
    }
    
    entry.count++;
    
    const remaining = Math.max(0, this.config.maxRequests - entry.count);
    
    return {
      success: entry.count <= this.config.maxRequests,
      limit: this.config.maxRequests,
      remaining,
      reset: entry.resetTime,
    };
  }
}

// Pre-configured rate limiters
export const apiLimiter = new RateLimiter({
  interval: 60000, // 1 minute
  maxRequests: 100,
});

export const strictLimiter = new RateLimiter({
  interval: 60000, // 1 minute
  maxRequests: 10,
});

export function getRateLimitResponse(
  result: { success: boolean; limit: number; remaining: number; reset: number }
): NextResponse | null {
  if (!result.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toString(),
          'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }
  return null;
}

export function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  return ip;
}