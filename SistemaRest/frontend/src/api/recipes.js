import api from './index';

export const getRecipes = () => api.get('/recipes');
export const getRecipe = (id) => api.get(`/recipes/${id}`);
export const createRecipe = (recipeData) => api.post('/recipes', recipeData);
export const updateRecipe = (id, recipeData) => api.put(`/recipes/${id}`, recipeData);
export const deleteRecipe = (id) => api.delete(`/recipes/${id}`);