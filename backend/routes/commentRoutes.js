const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/post/:postId', optionalAuth, commentController.getCommentsByPost);
router.get('/:id', commentController.getCommentById);
router.get('/post/:postId/search', commentController.searchInComments);
router.get('/post/:postId/comment/:id/count', commentController.countTotalReplies);
router.get('/post/:postId/comment/:id/participants', commentController.getThreadParticipants);

// Protected routes (cần token)
router.post('/', authenticateToken, commentController.createComment);
router.put('/:id', authenticateToken, commentController.updateComment);
router.delete('/:id', authenticateToken, commentController.deleteComment);
router.post('/:id/vote', authenticateToken, commentController.voteComment);

module.exports = router;
