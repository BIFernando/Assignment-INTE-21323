const express = require('express');
const router  = express.Router();
const { body, validationResult } = require('express-validator');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');
const {
  createUser,
  getAllUsers,
  updateUser,
  deactivateUser,
  searchUsers,
  updateProfile
} = require('../controllers/user.controller');

// ── Validation Rules ───────────────────────────────────
const createUserValidation = [
  body('name')
    .trim()
    .notEmpty()    .withMessage('Name is required.')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters.')
    .escape(),
  body('email')
    .trim()
    .isEmail()     .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('role')
    .isIn(['admin', 'project_manager', 'collaborator'])
    .withMessage('Role must be admin, project_manager, or collaborator.'),
];

const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters.')
    .escape(),
  body('role')
    .optional()
    .isIn(['admin', 'project_manager', 'collaborator'])
    .withMessage('Invalid role value.'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errorCode: 400,
      message:   'Validation failed.',
      errors:    errors.array().map(e => ({
        field:   e.path,
        message: e.msg,
      }))
    });
  }
  next();
};

// ── Routes ─────────────────────────────────────────────

// Profile — any authenticated user (must be before /:id routes)
router.put('/profile', verifyToken, updateProfile);

// Search users by email — any authenticated user (for project invites)
router.get('/search', verifyToken, searchUsers);

// Admin only routes
router.get('/',
  verifyToken, authorizeRoles('admin'),
  getAllUsers);

router.post('/',
  verifyToken, authorizeRoles('admin'),
  createUserValidation, validate,
  createUser);

router.put('/:id',
  verifyToken, authorizeRoles('admin'),
  updateUserValidation, validate,
  updateUser);

router.patch('/:id/deactivate',
  verifyToken, authorizeRoles('admin'),
  deactivateUser);

module.exports = router;