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
        // NO PONER 'select: false' aquí si quieres acceder a 'this.password' directamente
        // en los métodos de instancia como comparePassword al recuperar el usuario.
        // Si usas select: false, debes usar .select('+password') en la consulta.
      },
      role: {
        type: String,
        // ROLES PERMITIDOS ACTUALIZADOS para coincidir con tus logs de error y consistencia
        // Con base en "Roles permitidos: admin, chef, mesero, cajero" de tu log, y añadiendo 'supervisor' y 'cliente'
        enum: ['admin', 'chef', 'mesero', 'cajero', 'supervisor', 'cliente'],
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
      // Solo hashear la contraseña si ha sido modificada (o es nueva)
      if (!this.isModified('password')) {
        next();
      }
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    });

    // Método para comparar contraseñas
    userSchema.methods.comparePassword = async function (candidatePassword) {
      // AGREGADO: Validación para asegurar que candidatePassword no sea undefined/null/vacío
      if (!candidatePassword) {
        console.error("Error: Contraseña proporcionada para comparar es indefinida o vacía.");
        throw new Error("La contraseña proporcionada para comparación no puede estar vacía.");
      }

      // AGREGADO: Verificar que 'this.password' (la contraseña hasheada de la DB) no sea undefined/null
      console.log('Contraseña plana (candidatePassword):', candidatePassword);
      console.log('Contraseña hasheada almacenada (this.password):', this.password); // Depuración

      if (this.password === undefined || this.password === null) {
          console.error("Error: El campo 'password' no existe o es nulo en el documento del usuario en la DB.");
          throw new Error("La contraseña almacenada no está disponible o es inválida.");
      }

      return await bcrypt.compare(candidatePassword, this.password);
    };

    const User = mongoose.model('User', userSchema);

    export default User;