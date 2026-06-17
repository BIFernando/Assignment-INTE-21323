const express = require('express');
  const router  = express.Router();
  const { verifyToken } = require('../middleware/auth.middleware');
  const {
    createProject,
    getMyProjects,
    getProjectById,
    inviteMember,
    updateMemberRole,
    removeMember
  } = require('../controllers/project.controller');
 
  router.use(verifyToken);
 
  router.post('/',                          createProject);
  router.get('/',                           getMyProjects);
  router.get('/:id',                        getProjectById);
  router.post('/:id/members',               inviteMember);
  router.put('/:id/members/:userId',        updateMemberRole);
  router.delete('/:id/members/:userId',     removeMember);
 
  module.exports = router;