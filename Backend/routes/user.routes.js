const express    = require('express');
    const router     = express.Router();
    const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');
    const { createUser, getAllUsers, updateUser, deactivateUser }
      = require('../controllers/user.controller');
 
    // Apply both middleware to ALL routes in this file
    // Only logged-in Admins can access user management
    router.use(verifyToken, authorizeRoles('admin'));
 
    // POST   /api/users           → create a new user
    // GET    /api/users           → get all users
    // PUT    /api/users/:id       → update a user
    // PATCH  /api/users/:id/deactivate → deactivate a user
 
    router.post('/',                 createUser);
    router.get('/',                  getAllUsers);
    router.put('/:id',               updateUser);
    router.patch('/:id/deactivate',  deactivateUser);
 
    module.exports = router;