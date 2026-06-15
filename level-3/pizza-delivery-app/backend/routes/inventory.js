import express from 'express';
import Ingredient from '../models/Ingredient.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const ingredients = await Ingredient.find({});
    res.json(ingredients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching inventory' });
  }
});

// @desc    Refill stock levels for an ingredient
// @route   POST /api/inventory/refill
// @access  Private/Admin
router.post('/refill', protect, admin, async (req, res) => {
  const { ingredientId, quantity } = req.body;

  try {
    const ingredient = await Ingredient.findById(ingredientId);

    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    ingredient.stock += parseInt(quantity) || 0;
    await ingredient.save();

    res.json({
      message: `Successfully refilled ${ingredient.name} stock level`,
      ingredient,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating stock' });
  }
});

// @desc    Add a new ingredient to inventory
// @route   POST /api/inventory/add-ingredient
// @access  Private/Admin
router.post('/add-ingredient', protect, admin, async (req, res) => {
  const { name, category, stock, threshold, price } = req.body;

  try {
    const exists = await Ingredient.findOne({ name });

    if (exists) {
      return res.status(400).json({ message: 'Ingredient already exists in inventory' });
    }

    const ingredient = await Ingredient.create({
      name,
      category,
      stock: parseInt(stock) || 100,
      threshold: parseInt(threshold) || 20,
      price: parseFloat(price) || 0,
    });

    res.status(201).json({
      message: 'New ingredient added successfully',
      ingredient,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error adding new ingredient' });
  }
});

export default router;
