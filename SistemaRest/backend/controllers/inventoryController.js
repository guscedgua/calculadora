// backend/controllers/inventoryController.js
import Inventory from '../models/Inventory.js'; // Usar import si tu proyecto es 'type: module'
// const Inventory = require('../models/Inventory'); // Usar require si tu proyecto es CJS

// @desc    Obtener todos los ítems del inventario (Público)
// @route   GET /api/inventory
// @access  Public
export const getAllInventoryItems = async (req, res) => {
    try {
        const items = await Inventory.find({});
        res.status(200).json({ success: true, count: items.length, items });
    } catch (error) {
        console.error('[INVENTORY ERROR] Get All Items:', error);
        res.status(500).json({ message: 'Error al obtener ítems del inventario.' });
    }
};

// @desc    Obtener un ítem por ID (Público)
// @route   GET /api/inventory/:id
// @access  Public
export const getInventoryItemById = async (req, res) => {
    try {
        const item = await Inventory.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Ítem de inventario no encontrado.' });
        }
        res.status(200).json({ success: true, item });
    } catch (error) {
        console.error('[INVENTORY ERROR] Get Item by ID:', error);
        // Si el ID no tiene el formato correcto de MongoDB ObjectId
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'ID de ítem inválido.' });
        }
        res.status(500).json({ message: 'Error al obtener el ítem.' });
    }
};

// @desc    Crear un nuevo ítem (Admin)
// @route   POST /api/inventory
// @access  Private/Admin
export const createInventoryItem = async (req, res) => {
    try {
        const newItem = await Inventory.create(req.body);
        res.status(201).json({ success: true, item: newItem });
    } catch (error) {
        console.error('[INVENTORY ERROR] Create Item:', error);
        // Manejar errores de validación de Mongoose o unique
        if (error.code === 11000) { // Código de error para duplicados en campos unique
            return res.status(400).json({ message: 'El nombre del ítem ya existe.' });
        }
        if (error.name === 'ValidationError') {
             let errors = Object.values(error.errors).map(err => err.message);
             return res.status(400).json({ message: errors.join(', ') });
        }
        res.status(500).json({ message: 'Error al crear el ítem.' });
    }
};

// @desc    Actualizar un ítem (Admin)
// @route   PUT /api/inventory/:id
// @access  Private/Admin
export const updateInventoryItem = async (req, res) => {
    try {
        const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Devuelve el documento modificado
            runValidators: true // Ejecuta las validaciones del schema al actualizar
        });

        if (!item) {
            return res.status(404).json({ message: 'Ítem de inventario no encontrado.' });
        }
        res.status(200).json({ success: true, item });
    } catch (error) {
        console.error('[INVENTORY ERROR] Update Item:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'El nombre del ítem ya existe.' });
        }
         if (error.name === 'ValidationError') {
             let errors = Object.values(error.errors).map(err => err.message);
             return res.status(400).json({ message: errors.join(', ') });
        }
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'ID de ítem inválido.' });
        }
        res.status(500).json({ message: 'Error al actualizar el ítem.' });
    }
};

// @desc    Eliminar un ítem (Admin)
// @route   DELETE /api/inventory/:id
// @access  Private/Admin
export const deleteInventoryItem = async (req, res) => {
    try {
        const item = await Inventory.findByIdAndDelete(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Ítem de inventario no encontrado.' });
        }
        res.status(200).json({ success: true, message: 'Ítem eliminado correctamente.' });
    } catch (error) {
        console.error('[INVENTORY ERROR] Delete Item:', error);
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'ID de ítem inválido.' });
        }
        res.status(500).json({ message: 'Error al eliminar el ítem.' });
    }
};

// @desc    Añadir cantidad a un ítem (Admin)
// @route   PATCH /api/inventory/:id/add
// @access  Private/Admin
export const addInventoryQuantity = async (req, res) => {
    const { quantityToAdd } = req.body;
    if (typeof quantityToAdd !== 'number' || quantityToAdd <= 0) {
        return res.status(400).json({ message: 'La cantidad a añadir debe ser un número positivo.' });
    }
    try {
        const item = await Inventory.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Ítem de inventario no encontrado.' });
        }
        item.quantity += quantityToAdd;
        await item.save();
        res.status(200).json({ success: true, message: `Se añadieron ${quantityToAdd} unidades.`, item });
    } catch (error) {
        console.error('[INVENTORY ERROR] Add Quantity:', error);
         if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'ID de ítem inválido.' });
        }
        res.status(500).json({ message: 'Error al añadir cantidad.' });
    }
};

// @desc    Restar cantidad a un ítem (Admin)
// @route   PATCH /api/inventory/:id/remove
// @access  Private/Admin
export const removeInventoryQuantity = async (req, res) => {
    const { quantityToRemove } = req.body;
    if (typeof quantityToRemove !== 'number' || quantityToRemove <= 0) {
        return res.status(400).json({ message: 'La cantidad a restar debe ser un número positivo.' });
    }
    try {
        const item = await Inventory.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Ítem de inventario no encontrado.' });
        }
        if (item.quantity - quantityToRemove < 0) {
            return res.status(400).json({ message: 'No hay suficiente stock para esta operación.' });
        }
        item.quantity -= quantityToRemove;
        await item.save();
        res.status(200).json({ success: true, message: `Se restaron ${quantityToRemove} unidades.`, item });
    } catch (error) {
        console.error('[INVENTORY ERROR] Remove Quantity:', error);
         if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'ID de ítem inválido.' });
        }
        res.status(500).json({ message: 'Error al restar cantidad.' });
    }
};