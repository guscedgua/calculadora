// Archivo: backend/controllers/authController.js
// Lógica para el registro, login, logout y refresco de tokens.
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import {
  generateAccessToken,
  generateRefreshToken,
  createSessionId,
  setAuthCookies
} from '../utils/generateTokens.js';
import jwt from 'jsonwebtoken';
import { ROLES } from '../config/roles.js';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya existe'
      });
    }

    // Crear nuevo usuario
    const newUser = new User({
      name,
      email,
      password,
      role: role || ROLES.CLIENTE // Rol por defecto
    });

    // Guardar usuario
    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({
      success: false,
      message: 'Error en el servidor al registrar usuario',
      systemError: process.env.NODE_ENV === 'development' ? error.message : null,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- INICIO DE LÍNEAS DE DEPURACIÓN (Mantenidas para la próxima verificación) ---
    console.log('--- INICIO DEPURACIÓN LOGIN ---');
    console.log('req.body recibido:', req.body);
    console.log('Email recibido:', email);
    console.log('Password recibido (de req.body):', password);
    console.log('--- FIN DEPURACIÓN LOGIN ---');
    // --- FIN DE LÍNEAS DE DEPURACIÓN ---

    // AGREGADO: Validación básica de campos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son requeridos",
      });
    }

    // Verificar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password); // Línea 76
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Crear nueva sesión para el usuario
    const sessionId = createSessionId();
    user.sessionId = sessionId;
    await user.save();

    // Generar tokens
    const accessToken = generateAccessToken(user, sessionId);
    const refreshToken = generateRefreshToken(user, sessionId);

    // Guardar refresh token en la base de datos
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expira en 7 días

    await RefreshToken.create({
      token: refreshToken,
      user: user._id,
      sessionId,
      expiresAt
    });

    // Establecer cookies de autenticación
    setAuthCookies(res, { accessToken, refreshToken }, {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email
    });

    // Preparar la respuesta JSON
    const responsePayload = {
      success: true,
      message: 'Inicio de sesión exitoso',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };

    // SI EL USUARIO ES UN ADMINISTRADOR, INCLUIR EL ACCESSTOKEN EN EL CUERPO DE LA RESPUESTA
    if (user.role === 'admin' || user.role === ROLES.ADMIN) {
      responsePayload.accessToken = accessToken;
    }

    res.json(responsePayload);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor al iniciar sesión',
      systemError: process.env.NODE_ENV === 'development' ? error.message : null,
    });
  }
};

export const logout = async (req, res) => {
  try {
    const sessionId = req.user?.sessionId; // Obtener sessionId del usuario autenticado

    if (sessionId) {
      // Revocar todos los tokens de refresco asociados a la sesión actual del usuario
      await RefreshToken.updateMany(
        { sessionId, user: req.user.id, revoked: false },
        { $set: { revoked: true } }
      );
      // Opcional: También podrías limpiar el sessionId del usuario en el modelo User
      // await User.findByIdAndUpdate(req.user.id, { $unset: { sessionId: 1 } });
    }

    // Limpiar cookies de autenticación
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/api/auth/refresh-token' });
    res.clearCookie('user', { path: '/' }); // Limpiar la cookie de información de usuario

    res.json({ success: true, message: 'Sesión cerrada exitosamente' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor al cerrar sesión',
      systemError: process.env.NODE_ENV === 'development' ? error.message : null,
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    let incomingRefreshToken = req.body.refreshToken; // Obtener el token del cuerpo de la solicitud

    if (!incomingRefreshToken) {
      // Si el token no viene en el cuerpo, intentar de las cookies
      if (req.cookies.refreshToken) {
        incomingRefreshToken = req.cookies.refreshToken;
      } else {
        return res.status(400).json({ success: false, message: 'Refresh token no proporcionado.' });
      }
    }

    // Verificar si el token de refresco existe y no está revocado
    const storedRefreshToken = await RefreshToken.findOne({ token: incomingRefreshToken, revoked: false });

    if (!storedRefreshToken) {
      return res.status(403).json({ success: false, message: 'Refresh token inválido o revocado.' });
    }

    // Verificar el token de refresco
    const decoded = jwt.verify(storedRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Si el token está expirado pero no ha sido revocado en DB, marcarlo como revocado
    if (decoded.exp * 1000 < Date.now()) {
      storedRefreshToken.revoked = true;
      await storedRefreshToken.save();
      return res.status(403).json({ success: false, message: 'Refresh token expirado. Por favor, inicie sesión de nuevo.' });
    }

    // Buscar el usuario asociado al token de refresco
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado asociado al refresh token.' });
    }

    // Asegurarse de que la sesión en el token de refresco coincide con la sesión actual del usuario
    if (decoded.sessionId && user.sessionId !== decoded.sessionId) {
      // Revocar este refresh token si la sesión no coincide
      storedRefreshToken.revoked = true;
      await storedRefreshToken.save();
      console.warn(`[AUTH] Sesión no coincide para user ${user._id} durante refresh. Revocando refresh token.`);
      return res.status(403).json({ success: false, message: 'Sesión de refresh token inválida. Por favor, inicie sesión de nuevo.' });
    }

    // Generar un nuevo token de acceso
    const newAccessToken = generateAccessToken(user, decoded.sessionId); // Usa la sessionId del refresh token

    // No generamos un nuevo refresh token aquí a menos que el antiguo esté a punto de expirar
    // o para rotación de tokens (más avanzado). Por simplicidad, solo un nuevo access token.

    res.json({ success: true, accessToken: newAccessToken });

  } catch (error) {
    console.error('Error refreshing token:', error);

    // Si el error es de verificación de JWT (ej. signature mismatch)
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ success: false, message: 'Refresh token inválido (error de firma o formato).' });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al refrescar token.',
      systemError: process.env.NODE_ENV === 'development' ? error.message : null,
    });
  }
};

// Función para obtener el perfil del usuario autenticado
export const getProfile = async (req, res) => { // <<-- ¡AQUÍ ESTÁ LA EXPORTACIÓN DE 'getProfile'!
  try {
    // El usuario ya está autenticado por el middleware `protect` y está disponible en `req.user`
    const user = await User.findById(req.user.id).select('-password'); // Excluir la contraseña

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado (perfil no disponible).'
      });
    }

    res.json({
      success: true,
      message: 'Perfil de usuario obtenido exitosamente.',
      user
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al obtener el perfil de usuario.',
      systemError: process.env.NODE_ENV === 'development' ? error.message : null,
    });
  }
};
