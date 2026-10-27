import User from '../models/User.js';
import { sendTokenResponse, clearTokenResponse } from '../utils/jwt.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('An account with this email already exists.', 409));
    }

    // Role check safeguard: public registration can only create buyer or seller
    if (role === 'admin' || !['buyer', 'seller'].includes(role)) {
      return next(new AppError('Public registration can only create a buyer or seller account.', 400));
    }

    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      phone: phone || ''
    });

    return sendTokenResponse(user, 201, res, 'Registration successful');
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return next(new AppError('Invalid email or password.', 401));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password.', 401));
    }

    return sendTokenResponse(user, 200, res, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  clearTokenResponse(res);
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });
};
