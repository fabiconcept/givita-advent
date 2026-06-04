interface Bucket {
  tokens: number;
  lastRefill: number;
}

class TokenBucketLimiter {
  private buckets = new Map<string, Bucket>();
  private capacity: number;
  private refillPerSecond: number;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(capacity: number, refillPerSecond: number) {
    this.capacity = capacity;
    this.refillPerSecond = refillPerSecond;
  }

  tryConsume(key: string, cost = 1): boolean {
    const now = Date.now();
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = { tokens: this.capacity, lastRefill: now };
      this.buckets.set(key, bucket);
    }

    const elapsed = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(this.capacity, bucket.tokens + elapsed * this.refillPerSecond);
    bucket.lastRefill = now;

    if (bucket.tokens >= cost) {
      bucket.tokens -= cost;
      return true;
    }
    return false;
  }

  getRemainingTokens(key: string): number {
    const bucket = this.buckets.get(key);
    if (!bucket) return this.capacity;
    const now = Date.now();
    const elapsed = (now - bucket.lastRefill) / 1000;
    return Math.min(this.capacity, bucket.tokens + elapsed * this.refillPerSecond);
  }

  startCleanup(intervalMs = 60_000) {
    if (this.cleanupTimer) return;
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      const expiry = now - intervalMs * 2;
      for (const [key, bucket] of this.buckets.entries()) {
        if (bucket.lastRefill < expiry) {
          this.buckets.delete(key);
        }
      }
    }, intervalMs);

    if (this.cleanupTimer && typeof this.cleanupTimer === 'object' && 'unref' in this.cleanupTimer) {
      this.cleanupTimer.unref();
    }
  }
}

function ipFromRequest(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'anonymous';
}

export const loginLimiter = new TokenBucketLimiter(10, 0.5);
loginLimiter.startCleanup();

export const apiLimiter = new TokenBucketLimiter(60, 2);
apiLimiter.startCleanup();

export const publicLimiter = new TokenBucketLimiter(30, 1);
publicLimiter.startCleanup();

export function checkRateLimit(
  limiter: TokenBucketLimiter,
  request: Request,
  cost = 1
): { allowed: boolean; remaining: number } {
  const ip = ipFromRequest(request);
  const allowed = limiter.tryConsume(ip, cost);
  return { allowed, remaining: Math.floor(limiter.getRemainingTokens(ip)) };
}
