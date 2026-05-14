const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/postController');
const voteCtrl = require('../controllers/voteController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/', ctrl.getAllPosts);
router.get('/:id', ctrl.getPost);

// Protected routes (cần token)
router.post('/', authenticate, ctrl.createPost);
router.put('/:id', authenticate, ctrl.updatePost);
router.delete('/:id', authenticate, ctrl.deletePost);
router.post('/:post_id/vote', authenticate, voteCtrl.vote);

module.exports = router;