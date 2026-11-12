import type { CookieOptions } from 'express';

const baseCookie = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
});

export const getJwtCookieOptions = (): CookieOptions => ({
  ...baseCookie(),
  maxAge: 24 * 60 * 60 * 1000,
});

export const getJwtClearCookieOptions = (): CookieOptions => baseCookie();
