const express = require('express');
  const router  = express.Router();
  /**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management endpoints
 */
  const { verifyToken } = require('../middleware/auth.middleware');
  const {
    createProject,
    getMyProjects,
    getProjectById,
    inviteMember,
    updateMemberRole,
    removeMember,
    deleteProject
  } = require('../controllers/project.controller');
 
  router.use(verifyToken);
 
  /**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Project created successfully
 *       401:
 *         description: Unauthorized
 */
  router.post('/',                          createProject);
  /**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects for logged-in user
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects
 *       401:
 *         description: Unauthorized
 */
  router.get('/',                           getMyProjects);
  /**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
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
 *         description: Project details
 *       404:
 *         description: Project not found
 */
  router.get('/:id',                        getProjectById);
  /**
 * @swagger
 * /api/projects/{id}/members:
 *   post:
 *     summary: Invite member to project
 *     tags: [Projects]
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
 *         description: Member invited successfully
 *       404:
 *         description: Project not found
 */
  router.post('/:id/members',               inviteMember);
  /**
 * @swagger
 * /api/projects/{id}/members/{userId}:
 *   put:
 *     summary: Update project member role
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Member role updated
 */
  router.put('/:id/members/:userId',        updateMemberRole);
  /**
 * @swagger
 * /api/projects/{id}/members/{userId}:
 *   delete:
 *     summary: Remove member from project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Member removed successfully
 */
  router.delete('/:id/members/:userId',     removeMember);
  router.delete('/:id', deleteProject);
 
  module.exports = router;