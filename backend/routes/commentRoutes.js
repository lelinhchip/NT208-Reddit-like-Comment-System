// TODO: Implement comment routes
// - POST /
// - GET /post/:postId
// - GET /:id
// - GET /:commentId/replies
// - PUT /:id
// - DELETE /:id
// - POST /:id/vote

const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// 1. Tạo bình luận mới 
router.post('/', commentController.createComment);

// 2. Lấy tất cả bình luận của một bài viết (Dạng cây)
router.get('/post/:postId', commentController.getCommentsByPost);

// 3. Lấy chi tiết một bình luận
router.get('/:id', commentController.getCommentById);

// 4. Lấy các Replies của một bình luận
router.get('/:commentId/replies', commentController.getReplies);

// 5. Cập nhật bình luận
router.put('/:id', commentController.updateComment);

// 6. Xóa bình luận
router.delete('/:id', commentController.deleteComment);

// 7. Vote cho bình luận (Upvote/Downvote)
router.post('/:id/vote', commentController.voteComment);

module.exports = router;