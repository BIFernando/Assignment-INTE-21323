const express    = require('express');
const router     = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');

// Placeholder routes — will be fully built in Phase 6
router.use(verifyToken);

router.get('/', (req, res) => {
  res.status(200).json([]);
});

router.get('/unread', (req, res) => {
  res.status(200).json({ count: 0 });
});

router.put('/read-all', (req, res) => {
  res.status(200).json({ message: 'OK' });
});

router.put('/:id/read', (req, res) => {
  res.status(200).json({ message: 'OK' });
});

module.exports = router;