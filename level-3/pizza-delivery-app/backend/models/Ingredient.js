import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['base', 'sauce', 'cheese', 'veg', 'meat'],
    },
    stock: {
      type: Number,
      required: true,
      default: 100, // starting stock level
    },
    threshold: {
      type: Number,
      required: true,
      default: 20, // threshold value for alerts
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Ingredient = mongoose.model('Ingredient', ingredientSchema);
export default Ingredient;
