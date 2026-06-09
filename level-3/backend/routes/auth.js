import express from 'express';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

// Generate a random 6-digit numeric OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = generateOtp();

    // Create user. Note: password will be pre-hashed in User.js schema middleware
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user', // user can sign up as admin for local testing if explicitly requested
      verificationOtp: otp,
      isVerified: false,
    });

    // Send verification email
    await sendEmail({
      to: user.email,
      subject: 'Verify Your PizzaFlow Account',
      text: `Your 6-digit verification code is: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Welcome to PizzaFlow!</h2>
          <p>Thank you for signing up. Please verify your email address using the code below:</p>
          <div style="font-size: 24px; font-weight: bold; background-color: #f4f4f4; padding: 10px; text-align: center; width: 150px; border-radius: 5px; margin: 20px 0; border: 1px solid #ddd;">
            ${otp}
          </div>
          <p>This code will expire shortly. If you did not register for this account, you can safely ignore this email.</p>
        </div>
      `,
    });

    res.status(201).json({
      message: 'Registration successful. Verification email sent.',
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @desc    Verify email address using OTP
// @route   POST /api/auth/verify
// @access  Public
router.post('/verify', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account is already verified' });
    }

    if (user.verificationOtp !== otp) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    user.isVerified = true;
    user.verificationOtp = null;
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      message: 'Account successfully verified!',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        // Resend Verification code if not verified yet
        const otp = generateOtp();
        user.verificationOtp = otp;
        await user.save();

        await sendEmail({
          to: user.email,
          subject: 'Verify Your PizzaFlow Account',
          text: `Your 6-digit verification code is: ${otp}`,
          html: `<h3>Welcome back!</h3><p>Your account is not verified yet. Verification OTP: <strong>${otp}</strong></p>`,
        });

        return res.status(401).json({
          message: 'Email not verified. Verification code has been sent.',
          notVerified: true,
          email: user.email,
        });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @desc    Forgot password request code
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    const otp = generateOtp();
    user.resetPasswordOtp = otp;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Reset Password Code - PizzaFlow',
      text: `Your 6-digit reset code is: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Use the verification code below:</p>
          <div style="font-size: 24px; font-weight: bold; background-color: #f4f4f4; padding: 10px; text-align: center; width: 150px; border-radius: 5px; margin: 20px 0; border: 1px solid #ddd;">
            ${otp}
          </div>
          <p>If you did not request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    });

    res.status(200).json({ message: 'Reset password code sent to email.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during forgot password' });
  }
});

// @desc    Reset password using reset code
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res) => {
  const { email, otp, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    user.password = password; // pre-save encryption will hash this
    user.resetPasswordOtp = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

export default router;
