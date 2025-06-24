import jwt from 'jsonwebtoken';
import RefreshToken from '../models/RefreshToken.js';
import User from '../models/User.js';
import {
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies
} from '../utils/generateTokens.js';

// ROLES DEFINIDOS (deberían estar en un archivo de configuración aparte)
const ROLES = {
  ADMIN: 'administrador',
  SUPERVISOR: 'supervisor',
  MESERO: 'mesero',
  COCINERO: 'cocinero',
  CLIENTE: 'cliente',
};

/**
 * Middleware para refrescar tokens
 */
export const refreshTokenMiddleware = async (req, res, next) => {
  const storedRefreshToken = req.cookies?.refreshToken;

  if (!storedRefreshToken) {
    return res.status(401).json({
      success: false,
      code: 'NO_REFRESH_TOKEN',
      message: 'No se encontró el token de refresco'
    });
  }

  try {
    // Buscar token en DB
    const storedTokenDoc = await RefreshToken.findOne({
      token: storedRefreshToken,
      revoked: false
    }).populate('user');

    if (!storedTokenDoc || !storedTokenDoc.user) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax'
      });
      return res.status(403).json({
        success: false,
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Token de refresco inválido o revocado'
      });
    }

    // Verificar JWT
    let decoded;
    try {
      decoded = jwt.verify(storedRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      await storedTokenDoc.deleteOne();
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax'
      });

      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({
          success: false,
          code: 'REFRESH_TOKEN_EXPIRED',
          message: 'El token de refresco ha expirado'
        });
      }
      return res.status(403).json({
        success: false,
        code: 'INVALID_REFRESH_TOKEN_JWT',
        message: 'Token de refresco inválido'
      });
    }

    // Verificar coincidencia de datos
    if (storedTokenDoc.user._id.toString() !== decoded.id ||
        storedTokenDoc.sessionId !== decoded.sessionId) {
      await storedTokenDoc.deleteOne();
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax'
      });
      return res.status(403).json({
        success: false,
        code: 'REFRESH_TOKEN_ID_MISMATCH',
        message: 'Token no corresponde al usuario o sesión'
      });
    }

    // Generar nuevos tokens
    const newAccessToken = generateAccessToken(storedTokenDoc.user, storedTokenDoc.sessionId);
    const newRefreshToken = generateRefreshToken(storedTokenDoc.user, storedTokenDoc.sessionId);

    // Revocar token antiguo
    storedTokenDoc.revoked = true;
    await storedTokenDoc.save();

    // Crear nuevo registro de refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || 7));

    await RefreshToken.create({
      token: newRefreshToken,
      user: storedTokenDoc.user._id,
      sessionId: storedTokenDoc.sessionId,
      expiresAt
    });

    // Establecer cookies
    setAuthCookies(res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    }, {
      id: storedTokenDoc.user._id,
      role: storedTokenDoc.user.role,
      name: storedTokenDoc.user.name,
      email: storedTokenDoc.user.email
    });

    res.locals.newAccessToken = newAccessToken;
    res.locals.user = {
      id: storedTokenDoc.user._id,
      role: storedTokenDoc.user.role,
      name: storedTokenDoc.user.name,
      email: storedTokenDoc.user.email
    };

    next();
  } catch (error) {
    console.error('Refresh Token Middleware error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        code: 'REFRESH_TOKEN_ERROR_UNEXPECTED',
        message: 'Error inesperado al refrescar token'
      });
    }
  }
};

/**
 * Middleware de autenticación principal
 * Exportado como 'auth'
 */
export const auth = async (req, res, next) => { // <<-- ¡AQUÍ ESTÁ LA EXPORTACIÓN DE 'auth'!
  try {
    // Verificar cabecera de autorización
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        code: 'MISSING_TOKEN',
        message: 'Token de autenticación no proporcionado'
      });
    }

    // Extraer token
    const tokenParts = authHeader.split(' ');
    let token;
    if (tokenParts.length === 2 && tokenParts[0].toLowerCase() === 'bearer') {
      token = tokenParts[1];
    } else if (tokenParts.length === 1) {
      token = tokenParts[0];
    } else {
      return res.status(401).json({
        success: false,
        code: 'INVALID_TOKEN_FORMAT',
        message: 'Formato de token inválido'
      });
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        code: 'EMPTY_TOKEN',
        message: 'Token de autenticación vacío'
      });
    }

    // Verificar token de acceso
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (verifyError) {
      // Manejar token expirado
      if (verifyError.name === 'TokenExpiredError') {
        await new Promise((resolve) => {
          refreshTokenMiddleware(req, res, resolve);
        });

        if (res.headersSent) return;

        if (res.locals.newAccessToken) {
          req.user = res.locals.user;
          return next();
        } else {
          return res.status(401).json({
            success: false,
            code: 'TOKEN_REFRESH_FAILED',
            message: 'No se pudo refrescar el token'
          });
        }
      }

      if (verifyError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          code: 'INVALID_TOKEN',
          message: 'Token de autenticación inválido'
        });
      }

      return res.status(500).json({
        success: false,
        code: 'TOKEN_VERIFY_ERROR',
        message: 'Error en la verificación del token'
      });
    }

    // Buscar usuario en base de datos
    const user = await User.findById(decoded.id).select('role sessionId email name');

    if (!user) {
      return res.status(401).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'Usuario asociado al token no existe'
      });
    }

    // Validar ID de sesión
    if (user.sessionId !== decoded.sessionId) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_SESSION',
        message: 'Sesión inválida o terminada'
      });
    }

    // Adjuntar usuario a la solicitud
    req.user = {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email
    };

    next();
  } catch (error) {
    console.error('Auth Middleware error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        code: 'SERVER_ERROR',
        message: 'Error interno del servidor'
      });
    }
  }
};

/**
 * Middleware para verificar roles
 */
export const roleCheck = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHENTICATED',
        message: 'Usuario no autenticado'
      });
    }

    const userRole = req.user.role.toLowerCase();

    const normalizedAllowedRoles = new Set(allowedRoles.map(r => r.toLowerCase()));

    if (normalizedAllowedRoles.has(ROLES.ADMIN.toLowerCase())) {
        normalizedAllowedRoles.add('admin');
    }

    if (normalizedAllowedRoles.has(userRole)) {
      return next();
    }

    res.status(403).json({
      success: false,
      code: 'UNAUTHORIZED_ROLE',
      message: `Acceso denegado para el rol '${req.user.role}'.`,
      requiredRoles: allowedRoles
    });
  };
};

// Middlewares específicos por rol
export const adminCheck = roleCheck([ROLES.ADMIN]);
export const supervisorCheck = roleCheck([ROLES.ADMIN, ROLES.SUPERVISOR]);
export const meseroCheck = roleCheck([ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.MESERO]);
export const cocineroCheck = roleCheck([ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.COCINERO]);
export const staffCheck = roleCheck([ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.MESERO, ROLES.COCINERO]);
export const clientCheck = roleCheck([ROLES.CLIENTE]);
