// backend/models/Setting.js
// Modelo para la configuración global del sistema.

import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
    // Un campo para indicar si el módulo de inventario está activo
    useInventoryModule: {
        type: Boolean,
        default: false // Por defecto, desactivado
    },
    // Un campo para indicar si el módulo de receta está activo
    useRecipeModule: {
        type: Boolean,
        default: false // Por defecto, desactivado
    },
    // Podrías añadir otras configuraciones aquí en el futuro
}, { timestamps: true });

// Para asegurar que solo haya un documento de configuración en la colección
settingSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        // Si no existe, crea un documento por defecto con los valores iniciales
        settings = await this.create({ useInventoryModule: false, useRecipeModule: false });
    }
    return settings;
};

export default mongoose.model('Setting', settingSchema);
