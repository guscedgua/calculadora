// Archivo: backend/models/User.js
// Modelo de usuario para la base de datos, incluyendo hash de contraseña.
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({ // Correctly defined as userSchema
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
    enum: ['admin', 'chef', 'mesero', 'cajero', 'supervisor', 'cliente'],
    default: 'cliente',
  },
  sessionId: {
    type: String,
    unique: true,
    sparse: true
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
  if (!candidatePassword) {
    console.error("Error: Contraseña proporcionada para comparar es indefinida o vacía.");
    throw new Error("La contraseña proporcionada para comparación no puede estar vacía.");
  }

  console.log('Contraseña plana (candidatePassword):', candidatePassword);
  console.log('Contraseña hasheada almacenada (this.password):', this.password);

  if (this.password === undefined || this.password === null) {
    console.error("Error: El campo 'password' no existe o es nulo en el documento del usuario en la DB.");
    throw new Error("La contraseña almacenada no está disponible o es inválida.");
  }

  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema); // Changed to userSchema (lowercase 'u')