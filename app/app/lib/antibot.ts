import crypto from "node:crypto";

const SECRET =
  process.env.ANTI_BOT_SECRET ||
  process.env.SESSION_SECRET ||
  "walkys-default-anti-bot-secret-change-me";

export const HONEYPOT_FIELD = "website";
export const TOKEN_FIELD = "__abt";

const MIN_DELAY_MS = 2500;
const TOKEN_TTL_MS = 60 * 60 * 1000;

export interface AntiBotConfig {
  honeypotField: string;
  tokenField: string;
  token: string;
  issuedAt: number;
  minDelayMs: number;
}

function sign(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

export function issueAntiBotToken(): AntiBotConfig {
  const issuedAt = Date.now();
  const token = `${issuedAt}.${sign(String(issuedAt))}`;
  return {
    honeypotField: HONEYPOT_FIELD,
    tokenField: TOKEN_FIELD,
    token,
    issuedAt,
    minDelayMs: MIN_DELAY_MS,
  };
}

function verifyToken(token: string): number | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [issuedAtStr, sig] = parts;
  const expected = sign(issuedAtStr);
  // constant-time comparison
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const issuedAt = Number(issuedAtStr);
  if (!Number.isFinite(issuedAt)) return null;
  if (Date.now() - issuedAt > TOKEN_TTL_MS) return null;
  return issuedAt;
}

const ipBuckets = new Map<string, number[]>();

function checkRate(ip: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (ipBuckets.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    ipBuckets.set(ip, arr);
    return false;
  }
  arr.push(now);
  ipBuckets.set(ip, arr);
  // opportunistic GC: keep map size bounded
  if (ipBuckets.size > 5000) {
    for (const [k, v] of ipBuckets) {
      const fresh = v.filter((t) => now - t < windowMs);
      if (fresh.length === 0) ipBuckets.delete(k);
      else ipBuckets.set(k, fresh);
    }
  }
  return true;
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown"
  );
}

export type AntiBotReason =
  | "honeypot"
  | "invalid_token"
  | "too_fast"
  | "rate_limited";

export interface AntiBotCheckOptions {
  maxPerWindow?: number;
  windowMs?: number;
  context?: string;
}

export interface AntiBotResult {
  ok: boolean;
  reason?: AntiBotReason;
}

export function verifyAntiBot(
  formData: FormData,
  request: Request,
  options: AntiBotCheckOptions = {}
): AntiBotResult {
  const honeypot = String(formData.get(HONEYPOT_FIELD) ?? "").trim();
  if (honeypot !== "") {
    return { ok: false, reason: "honeypot" };
  }

  const token = String(formData.get(TOKEN_FIELD) ?? "");
  const issuedAt = verifyToken(token);
  if (!issuedAt) {
    return { ok: false, reason: "invalid_token" };
  }

  if (Date.now() - issuedAt < MIN_DELAY_MS) {
    return { ok: false, reason: "too_fast" };
  }

  const ip = getClientIp(request);
  const max = options.maxPerWindow ?? 5;
  const windowMs = options.windowMs ?? 10 * 60 * 1000;
  const bucketKey = options.context ? `${options.context}:${ip}` : ip;
  if (!checkRate(bucketKey, max, windowMs)) {
    return { ok: false, reason: "rate_limited" };
  }

  return { ok: true };
}
