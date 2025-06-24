import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const generateAccessToken = (user, sessionId) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      sessionId,
      type: 'access'
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' }
  );
};

export const generateRefreshToken = (user, sessionId) => {
  return jwt.sign(
    {
      id: user._id,
      sessionId,
      type: 'refresh'
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
  );
};

export const createSessionId = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Establece la cookie de refreshToken y devuelve un objeto con tokens y datos de usuario
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Object} tokens - Objeto con accessToken y refreshToken
 * @param {Object} [userData=null] - Datos del usuario para adjuntar
 * @returns {Object} - Objeto con accessToken y userData (si se proporcionó)
 */
export const setAuthCookies = (res, tokens, userData = null) => {
  // Configura la cookie para el refreshToken
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
  };

  res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

  // Devuelve un objeto con el accessToken y datos de usuario
  return {
    accessToken: tokens.accessToken,
    ...(userData && { user: userData })
  };
};