// backend/routers/recipeRoutes.js
import express from 'express';
const router = express.Router();
import {
    getAllRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe
} from '../controllers/recipeController.js';

// Aquí iría tu middleware de autenticación y autorización si ya lo tienes:
// import { protect, authorize } from '../middleware/authMiddleware.js';

// Rutas para /api/recipes
router.route('/')
    // .get(protect, authorize(['admin', 'employee']), getAllRecipes) // Acceso controlado
    // .post(protect, authorize(['admin']), createRecipe); // Acceso controlado
    .get(getAllRecipes) // Para pruebas, acceso abierto
    .post(createRecipe); // Para pruebas, acceso abierto

// Rutas para /api/recipes/:id
router.route('/:id')
    // .get(protect, authorize(['admin', 'employee']), getRecipeById)
    // .put(protect, authorize(['admin']), updateRecipe)
    // .delete(protect, authorize(['admin']), deleteRecipe);
    .get(getRecipeById) // Para pruebas, acceso abierto
    .put(updateRecipe) // Para pruebas, acceso abierto
    .delete(deleteRecipe); // Para pruebas, acceso abierto

export default router;