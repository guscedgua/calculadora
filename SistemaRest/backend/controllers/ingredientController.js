// backend/controllers/ingredientController.js
import Ingredient from '../models/Ingredient.js';
import Setting from '../models/Setting.js'; // Importa el modelo Setting

// Función auxiliar para verificar si el módulo de ingredientes está activo
const isIngredientModuleActive = async () => {
    try {
        const settings = await Setting.getSettings(); // Obtener la configuración global
        return settings.useIngredientModule;
    } catch (error) {
        console.error("Error al verificar si el módulo de ingredientes está activo:", error);
        return false; // Por seguridad, si hay un error, desactiva la funcionalidad
    }
};

// @desc    Crear un nuevo ingrediente
// @route   POST /api/ingredients
// @access  Private (administrador)
export const createIngredient = async (req, res) => {
    // Verificar si el módulo de ingredientes está activo
    if (!(await isIngredientModuleActive())) {
        return res.status(403).json({
            success: false,
            message: 'El módulo de gestión de ingredientes está deshabilitado por la configuración del sistema.'
        });
    }

    const { name, unit, isAllergen, allergenInfo } = req.body;

    try {
        // Verificar si ya existe un ingrediente con el mismo nombre (insensible a mayúsculas/minúsculas)
        const existingIngredient = await Ingredient.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existingIngredient) {
            return res.status(409).json({ success: false, message: 'Ya existe un ingrediente con este nombre.' });
        }

        const newIngredient = new Ingredient({
            name,
            unit,
            isAllergen: isAllergen || false,
            allergenInfo: isAllergen ? allergenInfo : undefined
        });

        const savedIngredient = await newIngredient.save();
        res.status(201).json({
            success: true,
            message: 'Ingrediente creado exitosamente.',
            ingredient: savedIngredient
        });
    } catch (error) {
        console.error('Error al crear ingrediente:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al crear el ingrediente.',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// @desc    Obtener todos los ingredientes
// @route   GET /api/ingredients
// @access  Private (administrador, cocinero, mesero, cajero - o cualquiera que necesite ver ingredientes)
export const getAllIngredients = async (req, res) => {
    // Nota: Para las lecturas, podrías decidir si quieres que el módulo esté activo o no.
    // Aquí, lo haremos opcional también por coherencia, pero podrías querer que los ingredientes
    // se puedan listar incluso si el módulo de edición está deshabilitado.
    if (!(await isIngredientModuleActive())) {
        return res.status(200).json({
            success: true,
            message: 'El módulo de gestión de ingredientes está deshabilitado. No se listan ingredientes.',
            ingredients: []
        });
    }

    try {
        const ingredients = await Ingredient.find().sort({ name: 1 });
        res.status(200).json({
            success: true,
            count: ingredients.length,
            ingredients
        });
    } catch (error) {
        console.error('Error al obtener ingredientes:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al obtener los ingredientes.' });
    }
};

// @desc    Obtener un ingrediente por ID
// @route   GET /api/ingredients/:id
// @access  Private (administrador, cocinero, mesero)
export const getIngredientById = async (req, res) => {
    if (!(await isIngredientModuleActive())) {
        return res.status(403).json({
            success: false,
            message: 'El módulo de gestión de ingredientes está deshabilitado por la configuración del sistema.'
        });
    }

    try {
        const ingredient = await Ingredient.findById(req.params.id);
        if (!ingredient) {
            return res.status(404).json({ success: false, message: 'Ingrediente no encontrado.' });
        }
        res.status(200).json({ success: true, ingredient });
    } catch (error) {
        console.error('Error al obtener ingrediente por ID:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'ID de ingrediente inválido.' });
        }
        res.status(500).json({ success: false, message: 'Error interno del servidor al obtener el ingrediente.' });
    }
};

// @desc    Actualizar un ingrediente
// @route   PUT /api/ingredients/:id
// @access  Private (administrador)
export const updateIngredient = async (req, res) => {
    if (!(await isIngredientModuleActive())) {
        return res.status(403).json({
            success: false,
            message: 'El módulo de gestión de ingredientes está deshabilitado por la configuración del sistema.'
        });
    }

    const { name, unit, isAllergen, allergenInfo } = req.body;

    try {
        let ingredient = await Ingredient.findById(req.params.id);
        if (!ingredient) {
            return res.status(404).json({ success: false, message: 'Ingrediente no encontrado.' });
        }

        // Verificar si el nuevo nombre ya existe en otro ingrediente (excepto el actual)
        if (name && name !== ingredient.name) {
            const existingIngredient = await Ingredient.findOne({
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                _id: { $ne: req.params.id }
            });
            if (existingIngredient) {
                return res.status(409).json({ success: false, message: 'Ya existe otro ingrediente con este nombre.' });
            }
        }

        ingredient.name = name || ingredient.name;
        ingredient.unit = unit || ingredient.unit;
        ingredient.isAllergen = typeof isAllergen === 'boolean' ? isAllergen : ingredient.isAllergen;

        // Lógica condicional para allergenInfo
        if (ingredient.isAllergen) {
            ingredient.allergenInfo = allergenInfo || ingredient.allergenInfo;
        } else {
            ingredient.allergenInfo = undefined; // Limpia la información si ya no es un alérgeno
        }

        const updatedIngredient = await ingredient.save();
        res.status(200).json({
            success: true,
            message: 'Ingrediente actualizado exitosamente.',
            ingredient: updatedIngredient
        });
    } catch (error) {
        console.error('Error al actualizar ingrediente:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'ID de ingrediente inválido.' });
        }
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al actualizar el ingrediente.',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// @desc    Eliminar un ingrediente
// @route   DELETE /api/ingredients/:id
// @access  Private (administrador)
export const deleteIngredient = async (req, res) => {
    if (!(await isIngredientModuleActive())) {
        return res.status(403).json({
            success: false,
            message: 'El módulo de gestión de ingredientes está deshabilitado por la configuración del sistema.'
        });
    }

    try {
        const ingredient = await Ingredient.findById(req.params.id);
        if (!ingredient) {
            return res.status(404).json({ success: false, message: 'Ingrediente no encontrado.' });
        }

        // Consideración importante: Antes de eliminar un ingrediente,
        // deberías verificar si está referenciado en alguna receta o inventario.
        // Si lo está, podrías:
        // 1. Impedir la eliminación y devolver un error.
        // 2. Desvincularlo automáticamente (más complejo y puede causar inconsistencias).
        // Por ahora, solo eliminará el ingrediente. La verificación de referencias
        // es una mejora futura recomendada para la integridad de los datos.

        await ingredient.deleteOne(); // Mongoose 6+

        res.status(200).json({ success: true, message: 'Ingrediente eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar ingrediente:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'ID de ingrediente inválido.' });
        }
        res.status(500).json({ success: false, message: 'Error interno del servidor al eliminar el ingrediente.' });
    }
};