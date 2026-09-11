const { getFirebaseAuth } = require('../config/firebase');
const { getDatabase } = require('../config/database');
const logger = require('../utils/logger');

// Verifies the Firebase ID token the client obtained from
// firebase.auth().currentUser.getIdToken() (works identically for
// Email/Password and Google Sign-In, since both are Firebase Auth
// providers and issue the same kind of ID token).
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    const idToken = authHeader.substring(7);
    const auth = getFirebaseAuth();

    // Throws on expired/invalid/revoked tokens - handled below.
    const decoded = await auth.verifyIdToken(idToken);

    const db = getDatabase();
    const userDoc = await db.collection('users').doc(decoded.uid).get();

    if (!userDoc.exists) {
      // The Firebase Auth account exists but there's no Firestore profile
      // yet - the client should call POST /api/auth/register first.
      return res.status(401).json({
        success: false,
        message: 'User profile not found. Please complete registration.',
        code: 'USER_DATA_NOT_FOUND'
      });
    }

    const userData = userDoc.data();

    if (userData.status === 'suspended' || userData.status === 'banned') {
      return res.status(403).json({
        success: false,
        message: 'Account has been suspended',
        code: 'ACCOUNT_SUSPENDED'
      });
    }

    req.user = {
      uid: decoded.uid,
      email: decoded.email || userData.email,
      displayName: userData.displayName || decoded.name,
      role: userData.role || 'user',
      language: userData.language || 'en',
      plan: userData.plan || 'free',
      ...userData
    };

    next();
  } catch (error) {
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    if (error.code === 'auth/argument-error' || error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    logger.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by ${req.user.email}`);
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'FORBIDDEN',
        requiredRoles: roles,
        yourRole: req.user.role
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};