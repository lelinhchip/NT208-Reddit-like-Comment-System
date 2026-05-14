const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', postController.getAllPosts);
router.get('/top', postController.getTopPosts);
router.get('/search', postController.searchPosts);
router.get('/user/:userId', postController.getUserPosts);
router.get('/:id', postController.getPost);

router.post('/', authenticateToken, postController.createPost);
router.put('/:id', authenticateToken, postController.updatePost);
router.delete('/:id', authenticateToken, postController.deletePost);
router.post('/:id/vote', authenticateToken, postController.votePost);

module.exports = router;