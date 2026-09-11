const express = require('express');
const { getFirebaseAuth } = require('../config/firebase');
const User = require('../models/User');
const { authValidators } = require('../utils/validators');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/error-handler');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All actual authentication (email/password AND Google) happens on the
// CLIENT using the Firebase Auth SDK. The client then sends the resulting
// Firebase ID token here as `Authorization: Bearer <idToken>` so the
// backend can verify it and create/read the matching Firestore profile.
// This route never sees a password.
const verifyRequestToken = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('No token provided', 401, 'NO_TOKEN');
  }
  const idToken = authHeader.substring(7);
  return getFirebaseAuth().verifyIdToken(idToken);
};

// Called right after the client does createUserWithEmailAndPassword(),
// or after signInWithPopup(googleProvider) for a brand-new Google user.
// Creates the Firestore profile if it doesn't exist yet (idempotent).
router.post('/register', authValidators.register, async (req, res, next) => {
  try {
    const decoded = await verifyRequestToken(req);
    const { displayName, language = 'en' } = req.body;

    let user = await User.findById(decoded.uid);

    if (!user) {
      user = new User({
        uid: decoded.uid,
        email: decoded.email,
        displayName: displayName || decoded.name || '',
        photoURL: decoded.picture || '',
        language,
        role: 'user',
        status: 'active',
        lastLoginAt: new Date().toISOString()
      });
      await user.save();
      logger.info(`User registered: ${decoded.email}`);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user: user.toJSON() }
    });
  } catch (error) { next(error); }
});

// Called right after the client does signInWithEmailAndPassword() or
// signInWithPopup(googleProvider) for a returning user. Just syncs
// lastLoginAt and returns the profile - Firebase already verified
// the password/Google credential on the client's behalf.
router.post('/login', async (req, res, next) => {
  try {
    const decoded = await verifyRequestToken(req);

    const user = await User.findById(decoded.uid);
    if (!user) throw new AppError('User profile not found. Please register first.', 404, 'USER_NOT_FOUND');
    if (user.status === 'suspended' || user.status === 'banned') {
      throw new AppError('Account suspended', 403, 'ACCOUNT_SUSPENDED');
    }

    await user.update({ lastLoginAt: new Date().toISOString() });
    logger.info(`User logged in: ${decoded.email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: { user: user.toJSON() }
    });
  } catch (error) { next(error); }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.uid);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    res.json({ success: true, data: { user: user.toJSON() } });
  } catch (error) { next(error); }
});

router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { displayName, language, preferences } = req.body;

    const user = await User.findById(req.user.uid);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

    const updates = {};
    if (displayName) updates.displayName = displayName;
    if (language) updates.language = language;
    if (preferences) updates.preferences = { ...user.preferences, ...preferences };

    await user.update(updates);
    if (displayName) {
      const auth = getFirebaseAuth();
      await auth.updateUser(req.user.uid, { displayName });
    }

    res.json({ success: true, message: 'Profile updated', data: { user: user.toJSON() } });
  } catch (error) { next(error); }
});

// Firebase sign-out happens client-side (firebase.auth().signOut()); this
// just gives the frontend a consistent endpoint to call if it wants one.
router.post('/logout', async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
