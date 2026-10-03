import { randomInt } from 'crypto';
import nodemailer from 'nodemailer';

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

type StoredOtp = {
  code: string;
  expiresAt: number;
  attempts: number;
};

const otpStore = new Map<string, StoredOtp>();
const lastSentAt = new Map<string, number>();

const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error('Email service is not configured');
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: { user, pass },
  });
};

export const sendOtp = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const now = Date.now();
  const previousSentAt = lastSentAt.get(normalizedEmail);

  if (previousSentAt && now - previousSentAt < RESEND_COOLDOWN_MS) {
    const retryAfterSeconds = Math.ceil((RESEND_COOLDOWN_MS - (now - previousSentAt)) / 1000);
    const error = new Error('Please wait before requesting another OTP') as Error & { retryAfterSeconds: number };
    error.retryAfterSeconds = retryAfterSeconds;
    throw error;
  }

  const code = randomInt(100000, 1000000).toString();
  await createTransporter().sendMail({
    from: process.env.EMAIL_USER,
    to: normalizedEmail,
    subject: 'Your verification code',
    text: `Your verification code is ${code}. It expires in 5 minutes.`,
    html: `<p>Your verification code is <strong>${code}</strong>.</p><p>It expires in 5 minutes.</p>`,
  });

  otpStore.set(normalizedEmail, { code, expiresAt: now + OTP_TTL_MS, attempts: 0 });
  lastSentAt.set(normalizedEmail, now);
};

export const verifyOtp = (email: string, code: string, consume = true) => {
  const normalizedEmail = email.trim().toLowerCase();
  const storedOtp = otpStore.get(normalizedEmail);

  if (!storedOtp || Date.now() > storedOtp.expiresAt) {
    otpStore.delete(normalizedEmail);
    return false;
  }

  storedOtp.attempts += 1;
  if (storedOtp.attempts > MAX_VERIFY_ATTEMPTS) {
    otpStore.delete(normalizedEmail);
    return false;
  }

  if (storedOtp.code !== code.trim()) {
    return false;
  }

  if (consume) {
    otpStore.delete(normalizedEmail);
    lastSentAt.delete(normalizedEmail);
  }
  return true;
};