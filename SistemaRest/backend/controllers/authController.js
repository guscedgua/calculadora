// backend/controllers/authController.js
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import {
    generateAccessToken,
    generateRefreshToken,
    createSessionId,
} from '../utils/generateTokens.js';
import jwt from 'jsonwebtoken';
import { ROLES } from '../config/roles.js'; // Asegúrate que este archivo existe y exporta ROLES

/**
 * @desc Registrar un nuevo usuario
 * @route POST /api/auth/register
 * @access Public
 */
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validación básica
        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
        }

        // Validar si el rol es uno de los permitidos (opcional pero recomendado)
        if (!Object.values(ROLES).includes(role)) {
            return res.status(400).json({ success: false, message: 'Rol de usuario inválido.' });
        }

        // Verificar si el usuario ya existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'El usuario ya existe con este correo electrónico.' });
        }

        // Crear el nuevo usuario
        const user = await User.create({
            name,
            email,
            password, // El pre-save hook en tu modelo User debería hashear esto automáticamente
            role
        });

        // Generar sessionId y tokens como en el login (si quieres que inicie sesión automáticamente)
        const sessionId = createSessionId();
        user.sessionId = sessionId; // Asigna el sessionId al usuario
        await user.save(); // Guarda el usuario con el nuevo sessionId

        const accessToken = generateAccessToken(user, sessionId);
        const refreshToken = generateRefreshToken(user, sessionId);

        const refreshExpiresDays = parseInt(process.env.JWT_REFRESH_COOKIE_EXPIRE || 7);
        const expiresAtDb = new Date();
        expiresAtDb.setDate(expiresAtDb.getDate() + refreshExpiresDays);

        await RefreshToken.create({
            token: refreshToken,
            user: user._id,
            sessionId,
            expiresAt: expiresAtDb,
            revoked: false // Establecer explícitamente revoked a false
        });

        const cookieOptions = {
            expires: new Date(Date.now() + refreshExpiresDays * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            path: '/'
        };
        res.cookie('refreshToken', refreshToken, cookieOptions);


        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor al registrar usuario',
            systemError: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor',
        });
    }
};


export const login = async (req, res) => {
    console.log('--- LOGIN CONTROLLER ---');
    try {
        const { email, password } = req.body;
        console.log('DEBUG Login: Intentando login para email:', email); // Log: email recibido

        if (!email || !password) {
            console.log('DEBUG Login: Email o contraseña faltantes. Status 400.');
            return res.status(400).json({ success: false, message: "Email y contraseña son requeridos" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            console.log('DEBUG Login: Usuario no encontrado para email:', email, '. Status 401.'); // Log: usuario no encontrado
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }
        console.log('DEBUG Login: Usuario encontrado:', user.email); // Log: usuario encontrado

        const isMatch = await user.comparePassword(password);
        console.log('DEBUG Login: Resultado comparación contraseña (isMatch):', isMatch); // Log: resultado de bcrypt.compare
        if (!isMatch) {
            console.log('DEBUG Login: Contraseña incorrecta para usuario:', user.email, '. Status 401.'); // Log: contraseña incorrecta
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }
        console.log('DEBUG Login: Contraseña correcta para usuario:', user.email);

        const sessionId = createSessionId();
        user.sessionId = sessionId;
        await user.save();

        const accessToken = generateAccessToken(user, sessionId);
        const refreshToken = generateRefreshToken(user, sessionId);

        const refreshExpiresDays = parseInt(process.env.JWT_REFRESH_COOKIE_EXPIRE || 7);
        const expiresAtDb = new Date();
        expiresAtDb.setDate(expiresAtDb.getDate() + refreshExpiresDays);

        await RefreshToken.create({
            token: refreshToken,
            user: user._id,
            sessionId,
            expiresAt: expiresAtDb,
            revoked: false // Establecer explícitamente revoked a false
        });

        const cookieOptions = {
            expires: new Date(Date.now() + refreshExpiresDays * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            path: '/'
        };

        res.cookie('refreshToken', refreshToken, cookieOptions);
        console.log('DEBUG Login: Login exitoso. Tokens generados y cookie establecida.');

        res.status(200).json({
            success: true,
            message: 'Inicio de sesión exitoso',
            accessToken,
            user: {
                id: user._id,
                role: user.role,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error (Backend - INESPERADO):', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor al iniciar sesión',
            systemError: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor',
        });
    }
};

/**
 * Middleware para refrescar tokens
 */
export const refreshTokenMiddleware = async (req, res) => {
    console.log('--- REFRESH TOKEN MIDDLEWARE ---');
    try {
        // 1. Obtener token de las cookies
        const storedRefreshToken = req.cookies?.refreshToken;
        console.log('Refresh Token recibido en cookies:', storedRefreshToken ? 'Sí' : 'No');
        if (storedRefreshToken) {
            console.log('Primeros 10 caracteres del Refresh Token:', storedRefreshToken.substring(0, 10) + '...');
        }

        const commonCookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            path: '/'
        };

        if (!storedRefreshToken) {
            console.log('ERROR: NO_REFRESH_TOKEN - No se encontró el token en las cookies.');
            return res.status(401).json({
                success: false,
                code: 'MISSING_REFRESH_TOKEN',
                message: 'Refresh token no proporcionado en las cookies.'
            });
        }

        // 2. Buscar token en DB con verificación de vigencia y que no esté revocado
        const storedTokenDoc = await RefreshToken.findOne({
            token: storedRefreshToken,
            $or: [ // Manejar documentos antiguos con 'revoked' undefined o false
                { revoked: false },
                { revoked: { $exists: false } }
            ],
            expiresAt: { $gt: new Date() } // Asegurarse de que no esté expirado
        }).populate('user');

        // --- NUEVO LOG DE DEPURACIÓN ---
        console.log('DEBUG: Resultado de RefreshToken.findOne:', storedTokenDoc ? JSON.stringify(storedTokenDoc.toObject(), null, 2) : 'No encontrado');
        // --- FIN NUEVO LOG ---

        // 3. Manejar token inválido (no encontrado, revocado o expirado en DB)
        if (!storedTokenDoc) {
            res.clearCookie('refreshToken', commonCookieOptions);
            // Registrar detalles para diagnóstico
            const foundTokenWithoutFilters = await RefreshToken.findOne({ token: storedRefreshToken });
            console.warn(
                'ERROR: INVALID_REFRESH_TOKEN_DB - Token no encontrado en DB o no cumple las condiciones.',
                foundTokenWithoutFilters
                    ? `Expirado: ${foundTokenWithoutFilters.expiresAt < new Date()} | Revocado: ${foundTokenWithoutFilters.revoked} | Usuario asociado: ${!!foundTokenWithoutFilters.user}`
                    : 'Token no existe en DB (quizás ya fue eliminado).'
            );
            return res.status(401).json({
                success: false,
                code: 'INVALID_REFRESH_TOKEN_DB',
                message: 'Token de refresco inválido o expirado.'
            });
        }

        // 4. Verificar usuario asociado (si el populate falló o el usuario fue eliminado)
        if (!storedTokenDoc.user) {
            await RefreshToken.deleteOne({ token: storedRefreshToken }); // Eliminar el token si no tiene un usuario válido
            console.log('ERROR: USER_NOT_FOUND - Usuario asociado al token no existe o fue eliminado. Token de refresco eliminado.');
            return res.status(401).json({
                success: false,
                code: 'USER_NOT_FOUND',
                message: 'Usuario asociado al token no existe.'
            });
        }
        console.log('Token encontrado en DB. Usuario asociado:', storedTokenDoc.user.email);
        console.log('Token DB expira en:', storedTokenDoc.expiresAt);


        // 5. Validar JWT del refresh token (firma y estructura)
        let decoded;
        try {
            decoded = jwt.verify(storedRefreshToken, process.env.REFRESH_TOKEN_SECRET);
            console.log('Token JWT verificado. Decodificado ID:', decoded.id, 'SessionId:', decoded.sessionId);
        } catch (verifyError) {
            console.error('Error verificando refresh token (JWT):', verifyError.name, verifyError.message);
            // Si el JWT es inválido, revocamos el token en la DB
            await RefreshToken.updateOne(
                { token: storedRefreshToken },
                { revoked: true }
            );
            res.clearCookie('refreshToken', commonCookieOptions); // Limpiar la cookie también
            return res.status(401).json({
                success: false,
                code: 'INVALID_REFRESH_TOKEN_JWT_VERIFICATION',
                message: 'Token de refresco inválido (firma o formato incorrecto).'
            });
        }

        // 6. Verificar coincidencia de sessionId (protección contra secuestro de sesión)
        if (storedTokenDoc.sessionId !== decoded.sessionId) {
            // Si hay un mismatch de sesión, revocar el token
            await RefreshToken.updateOne(
                { token: storedRefreshToken },
                { revoked: true }
            );
            res.clearCookie('refreshToken', commonCookieOptions); // Limpiar la cookie también
            console.log('ERROR: SESSION_MISMATCH - Mismatch de ID de sesión. Token de refresco revocado.');
            return res.status(401).json({
                success: false,
                code: 'SESSION_MISMATCH',
                message: 'Sesión inválida o terminada. Posible intento de secuestro.'
            });
        }
        console.log('Validación de ID de usuario/sesión exitosa.');

        // 7. Generar nuevos tokens
        const newAccessToken = generateAccessToken(storedTokenDoc.user, storedTokenDoc.sessionId);
        const newRefreshToken = generateRefreshToken(storedTokenDoc.user, storedTokenDoc.sessionId);

        // Rotación segura de tokens: Eliminar el token antiguo de la DB
        await storedTokenDoc.deleteOne();
        console.log('Token de refresco antiguo eliminado de la DB.');

        // Crear el nuevo refresh token en la DB
        const refreshExpiresDays = parseInt(process.env.JWT_REFRESH_COOKIE_EXPIRE || 7);
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + refreshExpiresDays);

        await RefreshToken.create({
            token: newRefreshToken,
            user: storedTokenDoc.user._id,
            sessionId: storedTokenDoc.sessionId, // Mantener el mismo sessionId
            expiresAt: newExpiresAt
        });

        // Establecer la nueva cookie de refresh token en la respuesta
        const newCookieOptions = {
            expires: new Date(Date.now() + refreshExpiresDays * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            path: '/'
        };
        res.cookie('refreshToken', newRefreshToken, newCookieOptions);
        console.log('Nuevos tokens generados y cookie de refresh establecida.');


        // Enviar la respuesta con el nuevo access token y la información del usuario
        res.status(200).json({
            success: true,
            message: 'Tokens refrescados exitosamente.',
            accessToken: newAccessToken,
            user: {
                id: storedTokenDoc.user._id,
                role: storedTokenDoc.user.role,
                name: storedTokenDoc.user.name,
                email: storedTokenDoc.user.email,
            }
        });

    } catch (error) {
        console.error('Refresh Token Middleware error INESPERADO:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                code: 'REFRESH_TOKEN_SERVER_ERROR',
                message: 'Error interno del servidor al refrescar token.'
            });
        }
    }
};

/**
 * Middleware de autenticación principal
 * Exportado como 'auth'
 */
export const auth = async (req, res, next) => {
    console.log('--- AUTH MIDDLEWARE ---');
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log('DEBUG Auth: No Authorization header provided.');
            return res.status(401).json({
                success: false,
                code: 'MISSING_TOKEN',
                message: 'Token de autenticación no proporcionado'
            });
        }

        const tokenParts = authHeader.split(' ');
        let token;
        if (tokenParts.length === 2 && tokenParts[0].toLowerCase() === 'bearer') {
            token = tokenParts[1];
        } else if (tokenParts.length === 1) {
            token = tokenParts[0];
        } else {
            console.log('DEBUG Auth: Invalid token format.');
            return res.status(401).json({
                success: false,
                code: 'INVALID_TOKEN_FORMAT',
                message: 'Formato de token inválido'
            });
        }

        if (!token) {
            console.log('DEBUG Auth: Empty token.');
            return res.status(401).json({
                success: false,
                code: 'EMPTY_TOKEN',
                message: 'Token de autenticación vacío'
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            console.log('DEBUG Auth: Access Token verificado. Decodificado ID:', decoded.id, 'SessionId:', decoded.sessionId);
        } catch (verifyError) {
            if (verifyError.name === 'TokenExpiredError') {
                console.log('DEBUG Auth: Access Token expirado, intentando refrescar...');
                return refreshTokenMiddleware(req, res);
            }

            if (verifyError.name === 'JsonWebTokenError') {
                console.log('DEBUG Auth: Invalid JWT (JsonWebTokenError):', verifyError.message);
                return res.status(401).json({
                    success: false,
                    code: 'INVALID_TOKEN',
                    message: 'Token de autenticación inválido'
                });
            }

            console.error('DEBUG Auth: Token verification error (unexpected):', verifyError);
            return res.status(500).json({
                success: false,
                code: 'TOKEN_VERIFY_ERROR',
                message: 'Error en la verificación del token'
            });
        }

        const user = await User.findById(decoded.id).select('role sessionId email name');

        if (!user) {
            console.log('DEBUG Auth: User not found for decoded ID:', decoded.id);
            return res.status(401).json({
                success: false,
                code: 'USER_NOT_FOUND',
                message: 'Usuario asociado al token no existe'
            });
        }

        req.sessionId = decoded.sessionId;

        if (user.sessionId !== decoded.sessionId) {
            console.log('DEBUG Auth: Session ID mismatch. User sessionId:', user.sessionId, 'Decoded sessionId:', decoded.sessionId);
            return res.status(401).json({
                success: false,
                code: 'INVALID_SESSION',
                message: 'Sesión inválida o terminada'
            });
        }

        req.user = {
            id: user._id,
            role: user.role,
            name: user.name,
            email: user.email
        };
        console.log('DEBUG Auth: Usuario autenticado y autorizado:', req.user.email, 'Rol:', req.user.role);

        next();
    } catch (error) {
        console.error('Auth Middleware error (unexpected):', error);
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
                message: 'Usuario no autenticado (no hay datos de usuario en req.user)'
            });
        }

        const userRole = req.user.role.toLowerCase();
        const normalizedAllowedRoles = new Set(allowedRoles.map(r => r.toLowerCase()));

        console.log(`DEBUG RoleCheck: Usuario con rol '${userRole}' intentando acceder. Roles permitidos: [${Array.from(normalizedAllowedRoles).join(', ')}]`);

        if (normalizedAllowedRoles.has(userRole)) {
            return next();
        }

        res.status(403).json({
            success: false,
            code: 'UNAUTHORIZED_ROLE',
            message: `Acceso denegado. Rol '${req.user.role}' no tiene permiso.`,
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


/**
 * @desc Obtener el perfil del usuario autenticado
 * @route GET /api/auth/profile
 * @access Private
 */
export const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado en la solicitud.' });
        }
        res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al obtener perfil.' });
    }
};

/**
 * @desc Cerrar sesión de la sesión actual
 * @route POST /api/auth/logout
 * @access Private
 */
export const logout = async (req, res) => {
    const commonCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        path: '/'
    };

    if (!req.user || !req.user.id || !req.sessionId) {
        res.clearCookie('refreshToken', commonCookieOptions);
        return res.status(200).json({ success: true, message: 'Sesión cerrada (sin información de usuario/sesión válida para revocar).' });
    }

    try {
        await RefreshToken.findOneAndUpdate(
            { user: req.user.id, sessionId: req.sessionId, revoked: false },
            { revoked: true }
        );

        res.clearCookie('refreshToken', commonCookieOptions);

        res.status(200).json({ success: true, message: 'Sesión cerrada exitosamente.' });
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al cerrar sesión.' });
    }
};

/**
 * @desc Cerrar sesión de todas las sesiones de un usuario
 * @route POST /api/auth/logoutAll
 * @access Private (solo ADMIN o el propio usuario si tiene permiso)
 */
export const logoutAllSessions = async (req, res) => {
    const commonCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        path: '/'
    };

    if (!req.user || !req.user.id) {
        res.clearCookie('refreshToken', commonCookieOptions);
        return res.status(401).json({ success: false, message: 'No autenticado para realizar esta acción.' });
    }

    try {
        await RefreshToken.updateMany(
            { user: req.user.id, revoked: false },
            { revoked: true }
        );

        res.clearCookie('refreshToken', commonCookieOptions);

        res.status(200).json({ success: true, message: 'Todas las sesiones han sido cerradas.' });
    } catch (error) {
        console.error('Error al cerrar todas las sesiones:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al cerrar todas las sesiones.' });
    }
};