import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Routers
import authRoutes from './routes/auth.js';
import inventoryRoutes from './routes/inventory.js';
import pizzaRoutes from './routes/pizza.js';
import orderRoutes from './routes/order.js';

// Models for seeding
import Ingredient from './models/Ingredient.js';
import Pizza from './models/Pizza.js';

// Load env variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Seeding DB logic
const seedDatabase = async () => {
  try {
    const count = await Ingredient.countDocuments();
    if (count === 0) {
      console.log('🌱 Database empty. Seeding initial ingredients and pizzas...');

      const bases = await Ingredient.insertMany([
        { name: 'Thin Crust', category: 'base', stock: 100, threshold: 20, price: 30 },
        { name: 'Stuffed Crust', category: 'base', stock: 100, threshold: 20, price: 50 },
        { name: 'Thick Crust', category: 'base', stock: 100, threshold: 20, price: 40 },
        { name: 'Gluten-free Crust', category: 'base', stock: 100, threshold: 20, price: 60 },
        { name: 'Whole Wheat Crust', category: 'base', stock: 100, threshold: 20, price: 45 },
      ]);

      const sauces = await Ingredient.insertMany([
        { name: 'Marinara Sauce', category: 'sauce', stock: 100, threshold: 20, price: 15 },
        { name: 'Basil Pesto Sauce', category: 'sauce', stock: 100, threshold: 20, price: 25 },
        { name: 'White Garlic Sauce', category: 'sauce', stock: 100, threshold: 20, price: 20 },
        { name: 'Barbecue Sauce', category: 'sauce', stock: 100, threshold: 20, price: 20 },
        { name: 'Buffalo Sauce', category: 'sauce', stock: 100, threshold: 20, price: 20 },
      ]);

      const cheeses = await Ingredient.insertMany([
        { name: 'Mozzarella Cheese', category: 'cheese', stock: 100, threshold: 20, price: 30 },
        { name: 'Cheddar Cheese', category: 'cheese', stock: 100, threshold: 20, price: 35 },
        { name: 'Parmesan Cheese', category: 'cheese', stock: 100, threshold: 20, price: 40 },
        { name: 'Vegan Cheese', category: 'cheese', stock: 100, threshold: 20, price: 50 },
      ]);

      const veggies = await Ingredient.insertMany([
        { name: 'Fresh Mushrooms', category: 'veg', stock: 100, threshold: 20, price: 15 },
        { name: 'Red Onions', category: 'veg', stock: 100, threshold: 20, price: 10 },
        { name: 'Green Bell Peppers', category: 'veg', stock: 100, threshold: 20, price: 15 },
        { name: 'Black Olives', category: 'veg', stock: 100, threshold: 20, price: 15 },
        { name: 'Baby Spinach', category: 'veg', stock: 100, threshold: 20, price: 15 },
        { name: 'Jalapenos', category: 'veg', stock: 100, threshold: 20, price: 15 },
      ]);

      const meats = await Ingredient.insertMany([
        { name: 'Pepperoni Slices', category: 'meat', stock: 100, threshold: 20, price: 45 },
        { name: 'Grilled Chicken', category: 'meat', stock: 100, threshold: 20, price: 40 },
      ]);

      await Pizza.create([
        {
          name: 'Classic Margherita',
          description: 'Simple and delicious. Fresh marinara sauce, mozzarella cheese, and extra virgin olive oil.',
          price: 250,
          image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500',
          ingredients: [bases[0]._id, sauces[0]._id, cheeses[0]._id],
        },
        {
          name: 'Ultimate Pepperoni',
          description: 'Double pepperoni slice stack with Mozzarella cheese on our signature thin crust.',
          price: 350,
          image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
          ingredients: [bases[0]._id, sauces[0]._id, cheeses[0]._id, meats[0]._id],
        },
        {
          name: 'Garden Veggie Feast',
          description: 'Thin crust loaded with Marinara, mozzarella, fresh mushrooms, olives, bell peppers, and onions.',
          price: 320,
          image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500',
          ingredients: [bases[0]._id, sauces[0]._id, cheeses[0]._id, veggies[0]._id, veggies[1]._id, veggies[2]._id, veggies[3]._id],
        },
      ]);

      console.log('✅ Seeding completed successfully.');
    }
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  }
};
seedDatabase();

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/pizzas', pizzaRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.send('PizzaFlow Fullstack Backend is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in developer mode on port ${PORT}`);
});
