import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const COOKIE_NAME = 'propertyhub_token';

export const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? 'none' : 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
});

export const signToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

export const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = signToken({
    id: user._id,
    role: user.role
  });

  const cookieOptions = getCookieOptions();

  res.cookie(COOKIE_NAME, token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || ''
      }
    }
  });
};

export const clearTokenResponse = (res) => {
  const { maxAge, ...clearOptions } = getCookieOptions();
  res.clearCookie(COOKIE_NAME, clearOptions);
};
