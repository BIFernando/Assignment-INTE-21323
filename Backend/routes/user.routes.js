const express = require('express');
const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */
const { body, validationResult } = require('express-validator');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');
const { createUser, getAllUsers, updateUser, deactivateUser,searchUsers} = require('../controllers/user.controller');

// Validation rules for creating a user
const createUserValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters.')
    .escape(),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('role')
    .isIn(['admin', 'project_manager', 'collaborator'])
    .withMessage('Role must be admin, project_manager, or collaborator.'),
];

// Validation rules for updating a user
const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters.')
    .escape(),
  body('role')
    .optional()
    .isIn(['admin', 'project_manager', 'collaborator'])
    .withMessage('Invalid role value.'),
];

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errorCode: 400,
      message: 'Validation failed.',
      errors: errors.array().map(e => ({
        field: e.path,
        message: e.msg,
      }))
    });
  }
  next();
};

  /**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 */
 // GET all users — global admin only
  router.get('/', verifyToken, authorizeRoles('admin'), getAllUsers);

  /**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Search users by email
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Search results
 */
 
  // GET user by email search — any logged in user (for inviting)
  router.get('/search', verifyToken, searchUsers);

  /**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: User created successfully
 */
 
  // POST create user — global admin only
  router.post('/', verifyToken, authorizeRoles('admin'), createUserValidation, validate, createUser);

  /**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User updated successfully
 */
 
  // PUT update user — global admin only
  router.put('/:id', verifyToken, authorizeRoles('admin'), updateUserValidation, validate, updateUser);

  /**
 * @swagger
 * /api/users/{id}/deactivate:
 *   patch:
 *     summary: Deactivate user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deactivated successfully
 */
 
  // PATCH deactivate — global admin only
  router.patch('/:id/deactivate', verifyToken, authorizeRoles('admin'), deactivateUser);
 

// Routes with validation
router.post('/', createUserValidation, validate, createUser);
router.get('/', getAllUsers);
router.put('/:id', updateUserValidation, validate, updateUser);
router.patch('/:id/deactivate', deactivateUser);

module.exports = router;