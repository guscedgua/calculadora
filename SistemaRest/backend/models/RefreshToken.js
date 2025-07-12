// backend/models/RefreshToken.js
import mongoose from 'mongoose';

const refreshTokenSchema = mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true, // Asegura que cada token sea único
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Referencia al modelo User
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    // --- CORRECCIÓN CLAVE: Añadir el campo 'revoked' ---
    revoked: {
      type: Boolean,
      default: false, // Valor por defecto a false
      required: true // Hace que el campo sea obligatorio y siempre tenga un valor
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export default RefreshToken;