// backend/controllers/productController.js
import Product from '../models/Product.js';

// @desc    Crear un nuevo producto
// @route   POST /api/products
// @access  Admin
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, stock, isAvailable, recipe } = req.body; // <-- ¡Añade 'recipe' aquí!

    // Validar campos requeridos
    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Nombre, precio y categoría son requeridos.' });
    }

    // Si el producto debe tener una receta, puedes añadir una validación aquí
    // Por ejemplo, si category === 'Pizza' y recipe no existe, lanzar error
    if (category === 'Pizza' && !recipe) {
         return res.status(400).json({ message: 'Las pizzas requieren un ID de receta.' });
    }

    // Verificar si el nombre del producto ya existe
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(409).json({ message: 'Ya existe un producto con este nombre.' });
    }

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price).toFixed(2),
      category,
      imageUrl,
      stock,
      isAvailable,
      recipe // <-- ¡Añade 'recipe' aquí!
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('[PRODUCT ERROR] Create Product:', error);
    if (error.code === 11000) {
      res.status(409).json({ message: 'Producto ya existe (nombre duplicado).' });
    } else if (error.name === 'ValidationError') { // Manejo específico para errores de validación de Mongoose
        const messages = Object.values(error.errors).map(val => val.message);
        res.status(400).json({ success: false, message: messages.join(', ') });
    }
    else {
      res.status(500).json({
        message: 'Error al crear el producto',
        systemError: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }
};

// @desc    Obtener todos los productos
// @route   GET /api/products
// @access  Public (puede ser visto por todos)
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).select('-__v');
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    console.error('[PRODUCT ERROR] Get Products:', error);
    res.status(500).json({
      message: 'Error al obtener los productos',
      systemError: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Obtener un producto por ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('[PRODUCT ERROR] Get Product by ID:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de producto inválido.' });
    }
    res.status(500).json({
      message: 'Error al obtener el producto',
      systemError: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Actualizar un producto
// @route   PUT /api/products/:id
// @access  Admin
export const updateProduct = async (req, res) => {
    try {
        const { name, description, price, category, imageUrl, stock, isAvailable, recipe } = req.body; // <-- ¡Añade 'recipe' aquí!

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Si se intenta cambiar el nombre, verificar que no haya duplicados
        if (name && name !== product.name) {
            const existingProduct = await Product.findOne({ name });
            if (existingProduct && existingProduct._id.toString() !== req.params.id) {
                return res.status(409).json({ message: 'Ya existe un producto con este nombre.' });
            }
        }

        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price !== undefined ? parseFloat(price).toFixed(2) : product.price;
        product.category = category || product.category;
        product.imageUrl = imageUrl || product.imageUrl;
        product.stock = stock !== undefined ? stock : product.stock;
        product.isAvailable = isAvailable !== undefined ? isAvailable : product.isAvailable;
        // --- ¡NUEVA LÍNEA PARA ACTUALIZAR RECIPE! ---
        // Verifica si 'recipe' fue proporcionado en el body y actualízalo
        // Esto permite asignar, cambiar o incluso quitar (si se envía null/undefined) una receta.
        if (recipe !== undefined) {
             product.recipe = recipe;
        }

        const updatedProduct = await product.save();
        res.status(200).json({ success: true, product: updatedProduct });

    } catch (error) {
        console.error('[PRODUCT ERROR] Update Product:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de producto inválido.' });
        }
        if (error.code === 11000) {
            return res.status(409).json({ message: 'El nombre del producto ya está en uso.' });
        }
        res.status(500).json({
            message: 'Error al actualizar el producto',
            systemError: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// @desc    Eliminar un producto
// @route   DELETE /api/products/:id
// @access  Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.status(200).json({ success: true, message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('[PRODUCT ERROR] Delete Product:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de producto inválido.' });
    }
    res.status(500).json({
      message: 'Error al eliminar el producto',
      systemError: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};