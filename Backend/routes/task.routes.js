const express = require('express');
  const router = express.Router();
  const { verifyToken } = require('../middleware/auth.middleware');
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
 
  router.use(verifyToken);
 
  router.post('/',              createTask);
  router.get('/',               getAllTasks);
  router.get('/:id',            getTaskById);
  router.put('/:id',            updateTask);
  router.delete('/:id',         deleteTask);
  router.post('/:id/assign',    assignUsers);
 
  router.post('/:taskId/comments',                    addComment);
  router.get('/:taskId/comments',                     getComments);
  router.delete('/:taskId/comments/:commentId',       deleteComment);
 
  router.post('/:taskId/attachments', upload.single('file'), uploadAttachment);
  router.get('/:taskId/attachments',                  getAttachments);
  router.delete('/:taskId/attachments/:attachmentId', deleteAttachment);
 
  module.exports = router;