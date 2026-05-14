const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   POST /api/posts
 * @desc    Tạo bài đăng mới
 * @access  Private (Cần đăng nhập)
 * @body    { title, content }
 * @returns {Object} Bài đăng vừa tạo
 */
router.post('/', authenticateToken, postController.createPost);

/**
 * @route   GET /api/posts
 * @desc    Lấy danh sách tất cả bài đăng (có phân trang và lọc)
 * @access  Public
 * @query   {number} page - Số trang (mặc định: 1)
 * @query   {number} limit - Số bài đăng mỗi trang (mặc định: 10)
 * @query   {string} sortBy - Sắp xếp theo (created_at, vote_count, comment_count)
 * @query   {string} order - Thứ tự sắp xếp (ASC, DESC)
 * @returns {Array} Danh sách bài đăng
 */
router.get('/', postController.getAllPosts);

/**
 * @route   GET /api/posts/top
 * @desc    Lấy bài đăng nổi bật (có nhiều vote nhất)
 * @access  Public
 * @query   {number} limit - Số lượng bài đăng (mặc định: 5, tối đa: 20)
 * @returns {Array} Danh sách bài đăng nổi bật
 */
router.get('/top', postController.getTopPosts);

/**
 * @route   GET /api/posts/search
 * @desc    Tìm kiếm bài đăng theo từ khóa
 * @access  Public
 * @query   {string} q - Từ khóa tìm kiếm
 * @query   {number} page - Số trang (mặc định: 1)
 * @query   {number} limit - Số bài đăng mỗi trang (mặc định: 10)
 * @returns {Array} Danh sách bài đăng phù hợp
 */
router.get('/search', postController.searchPosts);

/**
 * @route   GET /api/posts/user/:userId
 * @desc    Lấy bài đăng theo người dùng
 * @access  Public
 * @param   {number} userId - ID người dùng
 * @query   {number} page - Số trang (mặc định: 1)
 * @query   {number} limit - Số bài đăng mỗi trang (mặc định: 10)
 * @returns {Array} Danh sách bài đăng của người dùng
 */
router.get('/user/:userId', postController.getUserPosts);

/**
 * @route   GET /api/posts/:id
 * @desc    Lấy chi tiết bài đăng theo ID
 * @access  Public
 * @param   {number} id - ID bài đăng
 * @returns {Object} Chi tiết bài đăng
 */
router.get('/:id', postController.getPost);

/**
 * @route   PUT /api/posts/:id
 * @desc    Cập nhật bài đăng
 * @access  Private (Chỉ chủ sở hữu)
 * @param   {number} id - ID bài đăng
 * @body    { title, content }
 * @returns {Object} Bài đăng đã cập nhật
 */
router.put('/:id', authenticateToken, postController.updatePost);

/**
 * @route   DELETE /api/posts/:id
 * @desc    Xóa bài đăng
 * @access  Private (Chỉ chủ sở hữu)
 * @param   {number} id - ID bài đăng
 * @returns {Object} Thông báo xóa thành công
 */
router.delete('/:id', authenticateToken, postController.deletePost);

/**
 * @route   POST /api/posts/:id/vote
 * @desc    Vote cho bài đăng (upvote/downvote)
 * @access  Private (Cần đăng nhập)
 * @param   {number} id - ID bài đăng
 * @body    { voteType } - 1: upvote, -1: downvote
 * @returns {Object} Thông tin vote mới
 */
router.post('/:id/vote', authenticateToken, postController.votePost);

module.exports = router;