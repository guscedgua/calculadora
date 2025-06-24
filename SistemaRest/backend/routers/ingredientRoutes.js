import express from 'express';
import {
    createIngredient,
    getAllIngredients,
    getIngredientById,
    updateIngredient,
    deleteIngredient
} from '../controllers/ingredientController.js';
import { auth, roleCheck } from '../middleware/auth.js';

const router = express.Router();

// Las operaciones CRUD de ingredientes generalmente son para administradores
router.route('/')
    .post(auth, roleCheck(['admin', 'administrador']), createIngredient)
    .get(auth, roleCheck(['admin', 'administrador', 'cocinero', 'gerente']), getAllIngredients); // Cocineros pueden ver

router.route('/:id')
    .get(auth, roleCheck(['admin', 'administrador', 'cocinero', 'gerente']), getIngredientById)
    .put(auth, roleCheck(['admin', 'administrador']), updateIngredient)
    .delete(auth, roleCheck(['admin', 'administrador']), deleteIngredient);

export default router;