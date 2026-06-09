import express from 'express';
import Pizza from '../models/Pizza.js';
import Ingredient from '../models/Ingredient.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all preset pizzas
// @route   GET /api/pizzas/menu
// @access  Public (or Private)
router.get('/menu', async (req, res) => {
  try {
    const pizzas = await Pizza.find({}).populate('ingredients');
    res.json(pizzas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching pizza menu' });
  }
});

// @desc    Get all active ingredients for custom builder
// @route   GET /api/pizzas/ingredients
// @access  Private
router.get('/ingredients', protect, async (req, res) => {
  try {
    // Fetch all ingredients that have stock > 0
    const ingredients = await Ingredient.find({ stock: { $gt: 0 } });
    res.json(ingredients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching custom builder ingredients' });
  }
});

// @desc    Create a new preset pizza
// @route   POST /api/pizzas/create-preset
// @access  Private/Admin
router.post('/create-preset', protect, admin, async (req, res) => {
  const { name, description, price, image, ingredientIds } = req.body;

  try {
    const exists = await Pizza.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: 'Pizza with this name already exists' });
    }

    const pizza = await Pizza.create({
      name,
      description,
      price: parseFloat(price) || 0,
      image: image || undefined,
      ingredients: ingredientIds || [],
    });

    res.status(201).json({
      message: 'Preset pizza created successfully',
      pizza,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating preset pizza' });
  }
});

export default router;
