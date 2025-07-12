// backend/utils/generateTokens.js
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
    // Usar JWT_REFRESH_COOKIE_EXPIRE para la expiración del JWT
    const refreshExpiresDays = parseInt(process.env.JWT_REFRESH_COOKIE_EXPIRE || 7);
    return jwt.sign(
        {
            id: user._id,
            sessionId,
            type: 'refresh'
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: `${refreshExpiresDays}d` } // Ejemplo: '7d'
    );
};

export const createSessionId = () => {
    return crypto.randomBytes(16).toString('hex');
};
