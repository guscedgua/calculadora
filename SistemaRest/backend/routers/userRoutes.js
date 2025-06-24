// Archivo: backend/models/User.js
// Modelo de usuario para la base de datos, incluyendo hash de contraseña.
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['administrador', 'supervisor', 'mesero', 'cocinero', 'cliente'],
    default: 'cliente',
  },
  sessionId: {
    type: String,
    unique: true,
    sparse: true // Permite múltiples documentos sin sessionId o con sessionId duplicado si no se aplica indexación única en producción
  }
}, {
  timestamps: true,
});

// Middleware para hashear la contraseña antes de guardar
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (candidatePassword) {
  // AGREGADO: Validación para asegurar que candidatePassword no sea undefined
  if (!candidatePassword) {
    // Es importante lanzar un error descriptivo aquí, o al menos un log.
    // Esto es para que el error de bcrypt no sea tan críptico.
    console.error("Error: Contraseña proporcionada para comparar es undefined o vacía.");
    throw new Error("La contraseña proporcionada para comparación no puede estar vacía.");
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;