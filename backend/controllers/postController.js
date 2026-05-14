const Post = require('../models/Post');

<<<<<<< HEAD
const postController = {
    /**
     * Tạo bài đăng mới
     * POST /api/posts
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async createPost(req, res) {
        try {
            const { title, content } = req.body;
            const userId = req.user.id; // Lấy từ middleware authenticateToken

            // Validate input
            if (!title || title.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Tiêu đề không được để trống'
                });
            }

            if (title.length > 300) {
                return res.status(400).json({
                    success: false,
                    message: 'Tiêu đề không được vượt quá 300 ký tự'
                });
            }

            if (content && content.length > 10000) {
                return res.status(400).json({
                    success: false,
                    message: 'Nội dung không được vượt quá 10000 ký tự'
                });
            }

            const newPost = await Post.create(userId, title, content || '');
            
            res.status(201).json({
                success: true,
                message: 'Tạo bài đăng thành công',
                data: newPost
            });
        } catch (error) {
            console.error('Error in createPost:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi tạo bài đăng',
                error: error.message
            });
        }
    },

    /**
     * Lấy chi tiết bài đăng theo ID
     * GET /api/posts/:id
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getPost(req, res) {
        try {
            const postId = parseInt(req.params.id);
            
            if (isNaN(postId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID bài đăng không hợp lệ'
                });
            }

            const post = await Post.findById(postId);
            
            if (!post) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy bài đăng'
                });
            }

            // Nếu người dùng đã đăng nhập, lấy thông tin vote của họ
            let userVote = null;
            if (req.user && req.user.id) {
                userVote = await Post.getUserVote(postId, req.user.id);
            }

            res.json({
                success: true,
                data: {
                    ...post,
                    user_vote: userVote
                }
            });
        } catch (error) {
            console.error('Error in getPost:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy bài đăng',
                error: error.message
            });
        }
    },

    /**
     * Lấy danh sách tất cả bài đăng (có phân trang và lọc)
     * GET /api/posts?page=1&limit=10&sortBy=created_at&order=DESC
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getAllPosts(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const sortBy = req.query.sortBy || 'created_at';
            const order = req.query.order || 'DESC';
            
            // Validate page và limit
            if (page < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Số trang phải lớn hơn 0'
                });
            }
            
            if (limit < 1 || limit > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Số lượng bài đăng mỗi trang phải từ 1 đến 100'
                });
            }

            const result = await Post.getAll({ page, limit, sortBy, order });
            
            // Nếu người dùng đã đăng nhập, lấy thông tin vote cho từng bài đăng
            if (req.user && req.user.id && result.posts.length > 0) {
                const userId = req.user.id;
                for (let post of result.posts) {
                    post.user_vote = await Post.getUserVote(post.id, userId);
                }
            }

            res.json({
                success: true,
                data: result.posts,
                pagination: result.pagination,
                filters: { sortBy, order }
            });
        } catch (error) {
            console.error('Error in getAllPosts:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh sách bài đăng',
                error: error.message
            });
        }
    },

    /**
     * Cập nhật bài đăng
     * PUT /api/posts/:id
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async updatePost(req, res) {
        try {
            const postId = parseInt(req.params.id);
            const { title, content } = req.body;
            const userId = req.user.id;

            if (isNaN(postId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID bài đăng không hợp lệ'
                });
            }

            // Validate input
            if (!title || title.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Tiêu đề không được để trống'
                });
            }

            if (title.length > 300) {
                return res.status(400).json({
                    success: false,
                    message: 'Tiêu đề không được vượt quá 300 ký tự'
                });
            }

            // Kiểm tra bài đăng tồn tại
            const existingPost = await Post.findById(postId);
            if (!existingPost) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy bài đăng'
                });
            }

            // Kiểm tra quyền sở hữu
            if (existingPost.user_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền cập nhật bài đăng này'
                });
            }

            const updatedPost = await Post.update(postId, userId, title, content || '');
            
            if (!updatedPost) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể cập nhật bài đăng'
                });
            }

            res.json({
                success: true,
                message: 'Cập nhật bài đăng thành công',
                data: updatedPost
            });
        } catch (error) {
            console.error('Error in updatePost:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi cập nhật bài đăng',
                error: error.message
            });
        }
    },

    /**
     * Xóa bài đăng
     * DELETE /api/posts/:id
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async deletePost(req, res) {
        try {
            const postId = parseInt(req.params.id);
            const userId = req.user.id;

            if (isNaN(postId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID bài đăng không hợp lệ'
                });
            }

            // Kiểm tra bài đăng tồn tại
            const existingPost = await Post.findById(postId);
            if (!existingPost) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy bài đăng'
                });
            }

            // Kiểm tra quyền sở hữu
            if (existingPost.user_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền xóa bài đăng này'
                });
            }

            const deleted = await Post.delete(postId, userId);
            
            if (!deleted) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể xóa bài đăng'
                });
            }

            res.json({
                success: true,
                message: 'Xóa bài đăng thành công'
            });
        } catch (error) {
            console.error('Error in deletePost:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi xóa bài đăng',
                error: error.message
            });
        }
    },

    /**
     * Vote cho bài đăng (upvote/downvote)
     * POST /api/posts/:id/vote
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async votePost(req, res) {
        try {
            const postId = parseInt(req.params.id);
            const { voteType } = req.body;
            const userId = req.user.id;

            if (isNaN(postId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID bài đăng không hợp lệ'
                });
            }

            // Validate voteType
            if (voteType !== 1 && voteType !== -1) {
                return res.status(400).json({
                    success: false,
                    message: 'Loại vote không hợp lệ. Chỉ chấp nhận 1 (upvote) hoặc -1 (downvote)'
                });
            }

            // Kiểm tra bài đăng tồn tại
            const existingPost = await Post.findById(postId);
            if (!existingPost) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy bài đăng'
                });
            }

            // Không cho phép tự vote bài viết của mình
            if (existingPost.user_id === userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không thể vote cho bài đăng của chính mình'
                });
            }

            const voteResult = await Post.updateVotes(postId, userId, voteType);
            
            res.json({
                success: true,
                message: 'Vote thành công',
                data: voteResult
            });
        } catch (error) {
            console.error('Error in votePost:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi vote bài đăng',
                error: error.message
            });
        }
    },

    /**
     * Lấy bài đăng theo người dùng
     * GET /api/posts/user/:userId?page=1&limit=10
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getUserPosts(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            if (isNaN(userId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID người dùng không hợp lệ'
                });
            }

            const result = await Post.findByUser(userId, { page, limit });
            
            res.json({
                success: true,
                data: result.posts,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Error in getUserPosts:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy bài đăng của người dùng',
                error: error.message
            });
        }
    },

    /**
     * Tìm kiếm bài đăng
     * GET /api/posts/search?q=keyword&page=1&limit=10
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async searchPosts(req, res) {
        try {
            const keyword = req.query.q;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            if (!keyword || keyword.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng nhập từ khóa tìm kiếm'
                });
            }

            const result = await Post.search(keyword, { page, limit });
            
            res.json({
                success: true,
                data: result.posts,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Error in searchPosts:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi tìm kiếm bài đăng',
                error: error.message
            });
        }
    },

    /**
     * Lấy bài đăng nổi bật (top posts)
     * GET /api/posts/top?limit=5
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getTopPosts(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 5;
            
            if (limit < 1 || limit > 20) {
                return res.status(400).json({
                    success: false,
                    message: 'Số lượng bài đăng phải từ 1 đến 20'
                });
            }

            const topPosts = await Post.getTopPosts(limit);
            
            res.json({
                success: true,
                data: topPosts
            });
        } catch (error) {
            console.error('Error in getTopPosts:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy bài đăng nổi bật',
                error: error.message
            });
        }
    }
};

module.exports = postController;
=======
exports.getAllPosts = async (req, res) => {
  try {
    const { sort } = req.query;
    const [rows] = await Post.getAll(sort);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách posts: ' + error.message });
  }
};

exports.getPost = async (req, res) => {
  try {
    const [rows] = await Post.getById(req.params.id);
    if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy post' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy post: ' + error.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const user_id = req.user?.id; // Lấy từ token (auth middleware)

    if (!title || !content) {
      return res.status(400).json({ message: 'Tiêu đề và nội dung không được để trống' });
    }

    if (!user_id) {
      return res.status(401).json({ message: 'Vui lòng đăng nhập' });
    }

    const [result] = await Post.create(user_id, title, content);
    res.status(201).json({ 
      id: result.insertId, 
      user_id, 
      title, 
      content,
      score: 0,
      created_at: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo post: ' + error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const postId = req.params.id;
    const user_id = req.user?.id;

    if (!title || !content) {
      return res.status(400).json({ message: 'Tiêu đề và nội dung không được để trống' });
    }

    // TODO: Kiểm tra user có sở hữu post không trước khi update
    await Post.update(postId, title, content);
    res.json({ message: 'Cập nhật post thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật post: ' + error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const user_id = req.user?.id;

    // TODO: Kiểm tra user có sở hữu post không trước khi xóa
    await Post.delete(postId);
    res.json({ message: 'Xóa post thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa post: ' + error.message });
  }
};
>>>>>>> 398ffd25bff2e22c1cb21044608144852da4d36c
