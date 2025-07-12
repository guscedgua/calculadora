// backend/controllers/settingsController.js
import Setting from '../models/Setting.js'; 

export const getSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne(); // Busca el único documento de configuración

        // Si no hay configuraciones, crea una por defecto
        if (!settings) {
            settings = await Setting.create({
                restaurantName: 'Nombre por defecto',
                currency: '$',
                taxRate: 0,
                useInventoryModule: false,
                useRecipeModule: false,
                // ... otros valores por defecto
            });
        }
        res.status(200).json({ success: true, settings });
    } catch (error) {
        console.error('Error al obtener la configuración:', error);
        res.status(500).json({ message: 'Error al obtener la configuración', error: error.message });
    }
};

// ... y tu updateSettings debe manejar los mismos campos
export const updateSettings = async (req, res) => {
    try {
        const { restaurantName, currency, taxRate, useInventoryModule, useRecipeModule } = req.body;

        let settings = await Setting.findOne();

        if (!settings) {
            return res.status(404).json({ message: 'Configuración no encontrada para actualizar.' });
        }

        settings.restaurantName = restaurantName !== undefined ? restaurantName : settings.restaurantName;
        settings.currency = currency !== undefined ? currency : settings.currency;
        settings.taxRate = taxRate !== undefined ? taxRate : settings.taxRate;
        settings.useInventoryModule = useInventoryModule !== undefined ? useInventoryModule : settings.useInventoryModule;
        settings.useRecipeModule = useRecipeModule !== undefined ? useRecipeModule : settings.useRecipeModule;

        const updatedSettings = await settings.save();
        res.status(200).json({ success: true, message: 'Configuración actualizada', settings: updatedSettings });

    } catch (error) {
        console.error('Error al actualizar la configuración:', error);
        res.status(500).json({ message: 'Error al actualizar la configuración', error: error.message });
    }
};