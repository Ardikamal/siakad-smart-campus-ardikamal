/**
 * Rate limiter sliding-window sederhana, disimpan in-memory.
 *
 * ⚠️ Catatan produksi: ini hanya akurat selama app jalan sebagai SATU
 * proses Node yang persisten (mis. Railway, Render, VPS). Di serverless
 * function (Vercel/Netlify), tiap invocation bisa mendarat di instance
 * berbeda dengan memori masing-masing, jadi limiter ini akan under-count
 * dan TIDAK cukup dipakai sendirian. Untuk deployment serverless, ganti
 * dengan store bersama seperti Upstash Redis + @upstash/ratelimit — lihat
 * docs/DEPLOYMENT.md.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}

// Bersih-bersih berkala supaya map tidak tumbuh tanpa batas di proses long-lived.
if (typeof setInterval !== "undefined") {
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (now > bucket.resetAt) buckets.delete(key);
    }
  }, 60_000);
  interval.unref?.();
}
