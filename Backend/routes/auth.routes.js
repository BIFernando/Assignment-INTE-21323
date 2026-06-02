const express   = require('express');
    const router    = express.Router();
    const rateLimit = require('express-rate-limit');
    const { login, resetPassword } = require('../controllers/auth.controller');
    const { verifyToken } = require('../middleware/auth.middleware');
 
    // Limit login to 10 attempts per 15 minutes
    const loginLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      message: { error: 'Too many login attempts. Please try again later.' }
    });
 
    // POST /api/auth/login
    router.post('/login', loginLimiter, login);
 
    // POST /api/auth/reset-password  (requires valid token)
    router.post('/reset-password', verifyToken, resetPassword);
 
    module.exports = router;
 