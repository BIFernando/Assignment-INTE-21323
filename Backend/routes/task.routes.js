const express = require('express');
const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management endpoints
 */
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const {
  createTask, getAllTasks, getTaskById,
  updateTask, deleteTask, assignUsers
} = require('../controllers/task.controller');
const {
  addComment, getComments, deleteComment
} = require('../controllers/comment.controller');
const {
  uploadAttachment, getAttachments, deleteAttachment
} = require('../controllers/attachment.controller');

// All task routes require a valid JWT token
router.use(verifyToken);

// ── TASK ROUTES ────────────────────────────────────────

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
// Create task — Project Managers and Admins only
router.post('/', authorizeRoles('admin', 'project_manager'), createTask);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */

// Get all tasks — all roles can view
router.get('/', getAllTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */

// Get single task — all roles can view
router.get('/:id', getTaskById);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */

// Update task — all roles (controller handles restrictions)
router.put('/:id', updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */

// Delete task — Project Managers and Admins only
router.delete('/:id', authorizeRoles('admin', 'project_manager'), deleteTask);

/**
 * @swagger
 * /api/tasks/{id}/assign:
 *   post:
 *     summary: Assign users to a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */

// Assign users to a task — Project Managers and Admins only
router.post('/:id/assign', authorizeRoles('admin', 'project_manager'), assignUsers);

// ── COMMENT ROUTES ─────────────────────────────────────

/**
 * @swagger
 * /api/tasks/{taskId}/comments:
 *   post:
 *     summary: Add comment to task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
// Add a comment — all roles can comment
router.post('/:taskId/comments', addComment);

/**
 * @swagger
 * /api/tasks/{taskId}/comments:
 *   get:
 *     summary: Get task comments
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */

// Get all comments on a task — all roles
router.get('/:taskId/comments', getComments);

/**
 * @swagger
 * /api/tasks/{taskId}/comments/{commentId}:
 *   delete:
 *     summary: Delete comment
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */

// Delete a comment — controller handles own-comment check
router.delete('/:taskId/comments/:commentId', deleteComment);

// ── ATTACHMENT ROUTES ──────────────────────────────────

/**
 * @swagger
 * /api/tasks/{taskId}/attachments:
 *   post:
 *     summary: Upload attachment
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */

// Upload a file — all roles can attach files
router.post('/:taskId/attachments', upload.single('file'), uploadAttachment);

/**
 * @swagger
 * /api/tasks/{taskId}/attachments:
 *   get:
 *     summary: Get task attachments
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */

// Get all attachments on a task — all roles
router.get('/:taskId/attachments', getAttachments);

/**
 * @swagger
 * /api/tasks/{taskId}/attachments/{attachmentId}:
 *   delete:
 *     summary: Delete attachment
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */

// Delete an attachment — controller handles permission check
router.delete('/:taskId/attachments/:attachmentId', deleteAttachment);

module.exports = router;