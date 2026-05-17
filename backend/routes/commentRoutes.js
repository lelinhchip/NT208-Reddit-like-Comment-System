const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/post/:postId', commentController.getCommentsByPost);
router.get('/:id', commentController.getCommentById);
router.get('/post/:postId/search', commentController.searchInComments);
router.get('/post/:postId/comment/:id/count', commentController.countTotalReplies);
router.get('/post/:postId/comment/:id/participants', commentController.getThreadParticipants);

// Protected routes (cần token)
router.post('/', authenticate, commentController.createComment);
router.put('/:id', authenticate, commentController.updateComment);
router.delete('/:id', authenticate, commentController.deleteComment);
router.post('/:id/vote', authenticate, commentController.voteComment);

module.exports = router;