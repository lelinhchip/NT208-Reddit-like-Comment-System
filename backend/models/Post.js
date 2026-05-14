<<<<<<< HEAD
const { pool } = require('../config/db');

class Post {
    /**
     * Tạo bài đăng mới
     * @param {number} userId - ID của người dùng
     * @param {string} title - Tiêu đề bài đăng
     * @param {string} content - Nội dung bài đăng
     * @returns {Promise<Object>} - Bài đăng vừa tạo
     */
    static async create(userId, title, content) {
        try {
            const [result] = await pool.execute(
                'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)',
                [userId, title, content]
            );
            return await this.findById(result.insertId);
        } catch (error) {
            console.error('Error in Post.create:', error);
            throw error;
        }
    }

    /**
     * Tìm bài đăng theo ID
     * @param {number} id - ID bài đăng
     * @returns {Promise<Object|null>} - Bài đăng hoặc null nếu không tìm thấy
     */
    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                `SELECT p.*, u.username, u.avatar_url 
                 FROM posts p 
                 JOIN users u ON p.user_id = u.id 
                 WHERE p.id = ?`,
                [id]
            );
            
            if (rows.length === 0) return null;
            
            const post = rows[0];
            
            // Lấy số lượng comments thực tế
            const [countResult] = await pool.execute(
                'SELECT COUNT(*) as count FROM comments WHERE post_id = ?',
                [id]
            );
            post.comment_count = countResult[0].count;
            
            return post;
        } catch (error) {
            console.error('Error in Post.findById:', error);
            throw error;
        }
    }

    /**
     * Lấy tất cả bài đăng (có phân trang và lọc)
     * @param {Object} options - Tùy chọn phân trang và lọc
     * @param {number} options.page - Số trang (mặc định: 1)
     * @param {number} options.limit - Số bài đăng mỗi trang (mặc định: 10)
     * @param {string} options.sortBy - Sắp xếp theo (created_at, vote_count, comment_count)
     * @param {string} options.order - Thứ tự sắp xếp (ASC, DESC)
     * @returns {Promise<Object>} - Danh sách bài đăng và thông tin phân trang
     */
    static async getAll(options = {}) {
        try {
            const page = parseInt(options.page) || 1;
            const limit = parseInt(options.limit) || 10;
            const offset = (page - 1) * limit;
            const sortBy = options.sortBy || 'created_at';
            const order = options.order || 'DESC';
            
            // Validate sortBy để tránh SQL injection
            const validSortColumns = ['created_at', 'vote_count', 'comment_count', 'title'];
            const finalSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
            
            const [rows] = await pool.execute(
                `SELECT p.*, u.username, u.avatar_url,
                        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as actual_comment_count
                 FROM posts p 
                 JOIN users u ON p.user_id = u.id 
                 ORDER BY ${finalSortBy} ${order}
                 LIMIT ? OFFSET ?`,
                [limit, offset]
            );
            
            // Đếm tổng số bài đăng
            const [countResult] = await pool.execute(
                'SELECT COUNT(*) as total FROM posts'
            );
            const total = countResult[0].total;
            
            return {
                posts: rows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error in Post.getAll:', error);
            throw error;
        }
    }

    /**
     * Cập nhật bài đăng
     * @param {number} id - ID bài đăng
     * @param {number} userId - ID người dùng (để kiểm tra quyền)
     * @param {string} title - Tiêu đề mới
     * @param {string} content - Nội dung mới
     * @returns {Promise<Object|null>} - Bài đăng đã cập nhật hoặc null nếu không có quyền
     */
    static async update(id, userId, title, content) {
        try {
            // Kiểm tra bài đăng tồn tại và người dùng có quyền
            const post = await this.findById(id);
            if (!post) return null;
            if (post.user_id !== userId) return null;
            
            const [result] = await pool.execute(
                'UPDATE posts SET title = ?, content = ? WHERE id = ? AND user_id = ?',
                [title, content, id, userId]
            );
            
            if (result.affectedRows === 0) return null;
            
            return await this.findById(id);
        } catch (error) {
            console.error('Error in Post.update:', error);
            throw error;
        }
    }

    /**
     * Xóa bài đăng
     * @param {number} id - ID bài đăng
     * @param {number} userId - ID người dùng (để kiểm tra quyền)
     * @returns {Promise<boolean>} - True nếu xóa thành công
     */
    static async delete(id, userId) {
        try {
            // Kiểm tra bài đăng tồn tại và người dùng có quyền
            const post = await this.findById(id);
            if (!post) return false;
            if (post.user_id !== userId) return false;
            
            const [result] = await pool.execute(
                'DELETE FROM posts WHERE id = ? AND user_id = ?',
                [id, userId]
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error in Post.delete:', error);
            throw error;
        }
    }

    /**
     * Cập nhật vote_count cho bài đăng
     * @param {number} id - ID bài đăng
     * @param {number} userId - ID người dùng vote
     * @param {number} voteType - Loại vote (1: upvote, -1: downvote)
     * @returns {Promise<Object>} - Thông tin vote mới
     */
    static async updateVotes(id, userId, voteType) {
        try {
            // Kiểm tra bài đăng tồn tại
            const post = await this.findById(id);
            if (!post) throw new Error('Post not found');
            
            // Kiểm tra đã vote trước đó chưa
            const [existing] = await pool.execute(
                'SELECT * FROM post_votes WHERE post_id = ? AND user_id = ?',
                [id, userId]
            );
            
            let newVoteCount = post.vote_count;
            
            if (existing.length > 0) {
                const oldVoteType = existing[0].vote_type;
                
                if (oldVoteType === voteType) {
                    // Bỏ vote (undo)
                    await pool.execute(
                        'DELETE FROM post_votes WHERE post_id = ? AND user_id = ?',
                        [id, userId]
                    );
                    newVoteCount = post.vote_count - voteType;
                } else {
                    // Đổi vote (upvote -> downvote hoặc ngược lại)
                    await pool.execute(
                        'UPDATE post_votes SET vote_type = ? WHERE post_id = ? AND user_id = ?',
                        [voteType, id, userId]
                    );
                    newVoteCount = post.vote_count + (voteType * 2);
                }
            } else {
                // Thêm vote mới
                await pool.execute(
                    'INSERT INTO post_votes (post_id, user_id, vote_type) VALUES (?, ?, ?)',
                    [id, userId, voteType]
                );
                newVoteCount = post.vote_count + voteType;
            }
            
            // Lấy vote_count đã được trigger cập nhật
            const [result] = await pool.execute(
                'SELECT vote_count FROM posts WHERE id = ?',
                [id]
            );
            
            return {
                postId: id,
                voteCount: result[0].vote_count,
                userVote: voteType,
                hasVoted: true
            };
        } catch (error) {
            console.error('Error in Post.updateVotes:', error);
            throw error;
        }
    }

    /**
     * Lấy bài đăng theo user
     * @param {number} userId - ID người dùng
     * @param {Object} options - Tùy chọn phân trang
     * @returns {Promise<Object>} - Danh sách bài đăng của user
     */
    static async findByUser(userId, options = {}) {
        try {
            const page = parseInt(options.page) || 1;
            const limit = parseInt(options.limit) || 10;
            const offset = (page - 1) * limit;
            
            const [rows] = await pool.execute(
                `SELECT p.*, u.username, u.avatar_url,
                        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as actual_comment_count
                 FROM posts p 
                 JOIN users u ON p.user_id = u.id 
                 WHERE p.user_id = ?
                 ORDER BY p.created_at DESC
                 LIMIT ? OFFSET ?`,
                [userId, limit, offset]
            );
            
            const [countResult] = await pool.execute(
                'SELECT COUNT(*) as total FROM posts WHERE user_id = ?',
                [userId]
            );
            const total = countResult[0].total;
            
            return {
                posts: rows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error in Post.findByUser:', error);
            throw error;
        }
    }

    /**
     * Tìm kiếm bài đăng theo từ khóa
     * @param {string} keyword - Từ khóa tìm kiếm
     * @param {Object} options - Tùy chọn phân trang
     * @returns {Promise<Object>} - Danh sách bài đăng phù hợp
     */
    static async search(keyword, options = {}) {
        try {
            const page = parseInt(options.page) || 1;
            const limit = parseInt(options.limit) || 10;
            const offset = (page - 1) * limit;
            const searchTerm = `%${keyword}%`;
            
            const [rows] = await pool.execute(
                `SELECT p.*, u.username, u.avatar_url,
                        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as actual_comment_count
                 FROM posts p 
                 JOIN users u ON p.user_id = u.id 
                 WHERE p.title LIKE ? OR p.content LIKE ?
                 ORDER BY p.created_at DESC
                 LIMIT ? OFFSET ?`,
                [searchTerm, searchTerm, limit, offset]
            );
            
            const [countResult] = await pool.execute(
                'SELECT COUNT(*) as total FROM posts WHERE title LIKE ? OR content LIKE ?',
                [searchTerm, searchTerm]
            );
            const total = countResult[0].total;
            
            return {
                posts: rows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    keyword
                }
            };
        } catch (error) {
            console.error('Error in Post.search:', error);
            throw error;
        }
    }

    /**
     * Lấy bài đăng nổi bật (có nhiều vote nhất)
     * @param {number} limit - Số lượng bài đăng (mặc định: 5)
     * @returns {Promise<Array>} - Danh sách bài đăng nổi bật
     */
    static async getTopPosts(limit = 5) {
        try {
            const [rows] = await pool.execute(
                `SELECT p.*, u.username, u.avatar_url,
                        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as actual_comment_count
                 FROM posts p 
                 JOIN users u ON p.user_id = u.id 
                 ORDER BY p.vote_count DESC, p.comment_count DESC
                 LIMIT ?`,
                [limit]
            );
            
            return rows;
        } catch (error) {
            console.error('Error in Post.getTopPosts:', error);
            throw error;
        }
    }

    /**
     * Kiểm tra người dùng đã vote bài đăng chưa
     * @param {number} postId - ID bài đăng
     * @param {number} userId - ID người dùng
     * @returns {Promise<number|null>} - Loại vote hoặc null nếu chưa vote
     */
    static async getUserVote(postId, userId) {
        try {
            const [rows] = await pool.execute(
                'SELECT vote_type FROM post_votes WHERE post_id = ? AND user_id = ?',
                [postId, userId]
            );
            
            return rows.length > 0 ? rows[0].vote_type : null;
        } catch (error) {
            console.error('Error in Post.getUserVote:', error);
            throw error;
        }
    }
}
=======
const db = require('../config/db');

const Post = {
  getAll: (sort = 'new') => {
    const order = sort === 'top' ? 'score DESC' : 'created_at DESC';
    return db.query(`SELECT * FROM posts ORDER BY ${order}`);
  },

  getById: (id) => db.query('SELECT * FROM posts WHERE id = ?', [id]),

  create: (user_id, title, content) =>
    db.query('INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)', [user_id, title, content]),

  update: (id, title, content) =>
    db.query('UPDATE posts SET title=?, content=? WHERE id=?', [title, content, id]),

  delete: (id) => db.query('DELETE FROM posts WHERE id=?', [id]),

  getByUserId: (user_id) =>
    db.query('SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC', [user_id]),
};
>>>>>>> 398ffd25bff2e22c1cb21044608144852da4d36c

module.exports = Post;