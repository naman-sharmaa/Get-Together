import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { validationResult } from 'express-validator';
import admin from 'firebase-admin';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// User Sign Up
export const signUp = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, role = 'user', organizationName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      // Check if trying to register with different role
      if (existingUser.role !== role) {
        const roleName = existingUser.role === 'organizer' ? 'organizer' : 'user';
        return res.status(400).json({ 
          message: `This email is already registered as a ${roleName}. Please use the ${roleName} login page.` 
        });
      }
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user (password will be hashed by pre-save hook)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || undefined,
      role,
      organizationName: organizationName || undefined,
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationName: user.organizationName,
      },
    });
  } catch (error) {
    console.error('Sign up error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// User Sign In
export const signIn = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;

    // Find user with password (select: false by default, so we need to explicitly select it)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if role matches (if role is specified in request)
    if (role && user.role !== role) {
      const roleName = user.role === 'organizer' ? 'organizer' : 'user';
      return res.status(403).json({ 
        message: `This account is registered as a ${roleName}. Please use the ${roleName} login page.` 
      });
    }

    // Check password using the model method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id.toString());

    res.json({
      message: 'Sign in successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationName: user.organizationName,
      },
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Firebase Google Authentication
export const firebaseGoogleAuth = async (req, res) => {
  try {
    const { firebaseToken, role = 'user' } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({ message: 'Firebase token is required' });
    }

    // Verify Firebase token
    let decodedToken;
    try {
      if (!admin.apps.length) {
        return res.status(500).json({ 
          message: 'Firebase Admin SDK not initialized. Please add Firebase credentials to .env file.',
          details: 'Missing: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY'
        });
      }
      decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    } catch (error) {
      console.error('Firebase token verification error:', error.message);
      return res.status(401).json({ message: 'Invalid Firebase token', error: error.message });
    }

    const { email, name, uid } = decodedToken;

    // Check if user exists by email
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // User exists - check role
      if (user.role !== role) {
        const roleName = user.role === 'organizer' ? 'organizer' : 'user';
        return res.status(400).json({ 
          message: `This email is already registered as a ${roleName}. Please use the ${roleName} login page.` 
        });
      }
      
      // Link Firebase UID to existing account if not already linked
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        user.loginMethod = 'google';
        await user.save();
        console.log(`✅ Linked Firebase UID to existing user: ${email}`);
      }
    } else {
      // Create new user from Firebase data
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        role,
        firebaseUid: uid,
        loginMethod: 'google',
      });
      console.log(`✅ Created new user from Firebase: ${email}`);
    }

    // Generate JWT token
    const token = generateToken(user._id.toString());

    res.json({
      message: 'Firebase authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationName: user.organizationName,
      },
    });
  } catch (error) {
    console.error('Firebase auth error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
