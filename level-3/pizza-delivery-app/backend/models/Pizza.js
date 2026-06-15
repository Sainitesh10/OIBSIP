import mongoose from 'mongoose';

const pizzaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
    },
    ingredients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ingredient',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Pizza = mongoose.model('Pizza', pizzaSchema);
export default Pizza;
