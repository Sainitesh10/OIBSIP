import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Ingredient from '../models/Ingredient.js';
import Pizza from '../models/Pizza.js';
import sendEmail from '../utils/sendEmail.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholderKeyId',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholderKeySecret',
});

// Helper: Calculate total amount of order based on items in database
const calculateOrderAmount = async (items) => {
  let total = 0;
  for (const item of items) {
    if (item.pizzaType === 'preset') {
      const pizza = await Pizza.findById(item.pizzaId);
      if (pizza) {
        total += pizza.price * (item.quantity || 1);
      }
    } else if (item.pizzaType === 'custom') {
      // Calculate custom pizza price: Base price + ingredients cost
      let customPrice = 120; // default base price for any custom pizza
      if (item.details) {
        const base = await Ingredient.findOne({ name: item.details.base, category: 'base' });
        const sauce = await Ingredient.findOne({ name: item.details.sauce, category: 'sauce' });
        const cheese = await Ingredient.findOne({ name: item.details.cheese, category: 'cheese' });
        
        if (base) customPrice += base.price;
        if (sauce) customPrice += sauce.price;
        if (cheese) customPrice += cheese.price;

        if (item.details.veggies && item.details.veggies.length > 0) {
          const veggies = await Ingredient.find({ name: { $in: item.details.veggies }, category: 'veg' });
          veggies.forEach(v => { customPrice += v.price; });
        }
      }
      total += customPrice * (item.quantity || 1);
    }
  }
  return total;
};

// Helper: Deduct stock from inventory and alert if low
const deductInventoryAndAlert = async (items) => {
  const lowStockAlerts = [];

  for (const item of items) {
    const qty = item.quantity || 1;

    if (item.pizzaType === 'custom') {
      const details = item.details;
      const ingredientsToDeduct = [];

      if (details.base) ingredientsToDeduct.push({ name: details.base, category: 'base' });
      if (details.sauce) ingredientsToDeduct.push({ name: details.sauce, category: 'sauce' });
      if (details.cheese) ingredientsToDeduct.push({ name: details.cheese, category: 'cheese' });
      if (details.veggies && details.veggies.length > 0) {
        details.veggies.forEach(v => { ingredientsToDeduct.push({ name: v, category: 'veg' }); });
      }

      for (const ing of ingredientsToDeduct) {
        const found = await Ingredient.findOne({ name: ing.name, category: ing.category });
        if (found) {
          found.stock -= qty;
          await found.save();

          if (found.stock < found.threshold) {
            lowStockAlerts.push(`${found.name} (Stock: ${found.stock}, Category: ${found.category})`);
          }
        }
      }
    } else if (item.pizzaType === 'preset') {
      const pizza = await Pizza.findById(item.pizzaId).populate('ingredients');
      if (pizza && pizza.ingredients) {
        for (const ing of pizza.ingredients) {
          ing.stock -= qty;
          await ing.save();

          if (ing.stock < ing.threshold) {
            lowStockAlerts.push(`${ing.name} (Stock: ${ing.stock}, Category: ${ing.category})`);
          }
        }
      }
    }
  }

  // Trigger low stock notifications if thresholds breached
  if (lowStockAlerts.length > 0) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pizzaflow.com';
    const alertBody = `
      <h3>⚠️ LOW STOCK ALERT - PIZZAFLOW INVENTORY</h3>
      <p>The following ingredients have fallen below the configured threshold level (20 items):</p>
      <ul>
        ${lowStockAlerts.map(alert => `<li><strong>${alert}</strong></li>`).join('')}
      </ul>
      <p>Please log in to the admin panel and refill the stock as soon as possible.</p>
    `;

    try {
      await sendEmail({
        to: adminEmail,
        subject: '⚠️ INVENTORY WARNING: Low Stock Alert',
        text: `Low Stock warning for items: ${lowStockAlerts.join(', ')}`,
        html: alertBody,
      });
    } catch (emailError) {
      console.error('Failed to send low stock notification email', emailError);
    }
  }
};

// @desc    Initiate Razorpay checkout order
// @route   POST /api/orders/checkout
// @access  Private
router.post('/checkout', protect, async (req, res) => {
  const { items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Cart items cannot be empty' });
  }

  try {
    const amount = await calculateOrderAmount(items);
    
    // Create Razorpay Order
    const options = {
      amount: Math.round(amount * 100), // in paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    let rpOrder;
    // Bypassing Razorpay checkout API in local development if no key configured
    if (process.env.RAZORPAY_KEY_ID === 'rzp_test_placeholderKeyId') {
      rpOrder = {
        id: `order_mock_${Math.random().toString(36).substring(7)}`,
        amount: options.amount,
        currency: 'INR',
      };
    } else {
      rpOrder = await razorpay.orders.create(options);
    }

    res.status(200).json({
      razorpayOrderId: rpOrder.id,
      amount: amount,
      currency: 'INR',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error initiating checkout transaction' });
  }
});

// @desc    Verify payment and place order
// @route   POST /api/orders/place-order
// @access  Private
router.post('/place-order', protect, async (req, res) => {
  const {
    items,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    address,
  } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No items in cart' });
  }

  try {
    // 1. Verify Payment signature (skip if mock payment)
    const isMock = razorpayPaymentId === 'mock_success' || razorpayOrderId.startsWith('order_mock_');

    if (!isMock) {
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholderKeySecret')
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        return res.status(400).json({ message: 'Payment verification signature failed' });
      }
    }

    // 2. Fetch total price
    const priceAmount = await calculateOrderAmount(items);

    // 3. Deduct stock levels and trigger alerts if stock falls below thresholds
    await deductInventoryAndAlert(items);

    // 4. Save order to database
    const orderItems = await Promise.all(
      items.map(async (item) => {
        if (item.pizzaType === 'preset') {
          const p = await Pizza.findById(item.pizzaId);
          return {
            pizzaType: 'preset',
            name: p.name,
            price: p.price,
            quantity: item.quantity || 1,
          };
        } else {
          // Calculate custom pizza price dynamically
          let customPrice = 120;
          if (item.details) {
            const base = await Ingredient.findOne({ name: item.details.base });
            const sauce = await Ingredient.findOne({ name: item.details.sauce });
            const cheese = await Ingredient.findOne({ name: item.details.cheese });
            if (base) customPrice += base.price;
            if (sauce) customPrice += sauce.price;
            if (cheese) customPrice += cheese.price;

            if (item.details.veggies && item.details.veggies.length > 0) {
              const veggies = await Ingredient.find({ name: { $in: item.details.veggies } });
              veggies.forEach(v => { customPrice += v.price; });
            }
          }
          return {
            pizzaType: 'custom',
            name: 'Custom Pizza',
            price: customPrice,
            quantity: item.quantity || 1,
            details: item.details,
          };
        }
      })
    );

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount: priceAmount,
      razorpayOrderId,
      razorpayPaymentId,
      paymentStatus: 'success',
      status: 'Order Received',
      address,
    });

    res.status(201).json({
      message: 'Order placed successfully!',
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error processing order placement' });
  }
});

// @desc    Get user order logs
// @route   GET /api/orders/user-orders
// @access  Private
router.get('/user-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching user orders' });
  }
});

// @desc    Get all orders
// @route   GET /api/orders/all-orders
// @access  Private/Admin
router.get('/all-orders', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching all orders' });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/status
// @access  Private/Admin
router.put('/status', protect, admin, async (req, res) => {
  const { orderId, status } = req.body;

  const validStatuses = ['Order Received', 'In the kitchen', 'Sent to delivery', 'Delivered'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid order status transition' });
  }

  try {
    const order = await Order.findById(orderId).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json({
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating order status' });
  }
});

export default router;
