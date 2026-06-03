const express = require('express');
const router = express.Router();
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

// Create task — Project Managers and Admins only
router.post('/', authorizeRoles('ADMIN', 'PROJECT_MANAGER'), createTask);

// Get all tasks — all roles can view
router.get('/', getAllTasks);

// Get single task — all roles can view
router.get('/:id', getTaskById);

// Update task — all roles (controller handles restrictions)
router.put('/:id', updateTask);

// Delete task — Project Managers and Admins only
router.delete('/:id', authorizeRoles('ADMIN', 'PROJECT_MANAGER'), deleteTask);

// Assign users to a task — Project Managers and Admins only
router.post('/:id/assign', authorizeRoles('ADMIN', 'PROJECT_MANAGER'), assignUsers);

// ── COMMENT ROUTES ─────────────────────────────────────

// Add a comment — all roles can comment
router.post('/:taskId/comments', addComment);

// Get all comments on a task — all roles
router.get('/:taskId/comments', getComments);

// Delete a comment — controller handles own-comment check
router.delete('/:taskId/comments/:commentId', deleteComment);

// ── ATTACHMENT ROUTES ──────────────────────────────────

// Upload a file — all roles can attach files
router.post('/:taskId/attachments', upload.single('file'), uploadAttachment);

// Get all attachments on a task — all roles
router.get('/:taskId/attachments', getAttachments);

// Delete an attachment — controller handles permission check
router.delete('/:taskId/attachments/:attachmentId', deleteAttachment);

module.exports = router;