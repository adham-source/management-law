
import jwt from 'jsonwebtoken';

export const generateTokens = (userId: string) => {
  // Access Token
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  if (!accessTokenSecret) throw new Error('ACCESS_TOKEN_SECRET is not defined');
  const accessToken = jwt.sign({ id: userId }, accessTokenSecret, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  });

  // Refresh Token
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
  if (!refreshTokenSecret) throw new Error('REFRESH_TOKEN_SECRET is not defined');
  const refreshToken = jwt.sign({ id: userId }, refreshTokenSecret, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  });

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string, secret: string) => {
  try {
    const decoded = jwt.verify(token, secret);
    return { valid: true, expired: false, decoded };
  } catch (error: any) {
    return {
      valid: false,
      expired: error.message === 'jwt expired',
      decoded: null,
    };
  }
};
