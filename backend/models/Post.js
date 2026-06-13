const { pool } = require('../config/db');

class Post {
    static sanitizePagination(options = {}) {
        const page = Math.max(parseInt(options.page, 10) || 1, 1);
        const rawLimit = parseInt(options.limit, 10) || 10;
        const limit = Math.min(Math.max(rawLimit, 1), 100);
        const offset = (page - 1) * limit;
        return { page, limit, offset };
    }

    static getPostSelectSql() {
        return `p.*, u.username, u.avatar_url,
                COALESCE((SELECT SUM(pv.vote_type) FROM post_votes pv WHERE pv.post_id = p.id), 0) AS vote_count,
                (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count`;
    }

    static async recalculateCounts(postId) {
        await pool.execute(
            `UPDATE posts p
             SET p.vote_count = COALESCE((SELECT SUM(pv.vote_type) FROM post_votes pv WHERE pv.post_id = p.id), 0),
                 p.comment_count = (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id)
             WHERE p.id = ?`,
            [postId]
        );
    }

    static async create(userId, community, title, content) {
        try {
            const [result] = await pool.execute(
                'INSERT INTO posts (user_id, community, title, content) VALUES (?, ?, ?, ?)',
                [userId, community, title, content]
            );
            return await this.findById(result.insertId);
        } catch (error) {
            console.error('Error in Post.create:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            await this.recalculateCounts(id);

            const [rows] = await pool.execute(
                `SELECT ${this.getPostSelectSql()}
                 FROM posts p
                 JOIN users u ON p.user_id = u.id
                 WHERE p.id = ?`,
                [id]
            );

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error in Post.findById:', error);
            throw error;
        }
    }

    static async getAll(options = {}) {
        try {
            const { page, limit, offset } = this.sanitizePagination(options);
            const sort = options.sort === 'top' ? 'top' : 'new';
            const orderBy = sort === 'top'
                ? 'vote_count DESC, comment_count DESC, p.created_at DESC'
                : 'p.created_at DESC';

            const [rows] = await pool.query(
                `SELECT ${this.getPostSelectSql()}
                 FROM posts p
                 JOIN users u ON p.user_id = u.id
                 ORDER BY ${orderBy}
                 LIMIT ${limit} OFFSET ${offset}`
            );

            const [countResult] = await pool.execute('SELECT COUNT(*) AS total FROM posts');
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

    static async update(id, userId, community, title, content) {
        try {
            const post = await this.findById(id);
            if (!post) return null;
            if (post.user_id !== userId) return null;

            const [result] = await pool.execute(
                'UPDATE posts SET community = ?, title = ?, content = ? WHERE id = ? AND user_id = ?',
                [community, title, content, id, userId]
            );

            if (result.affectedRows === 0) return null;
            return await this.findById(id);
        } catch (error) {
            console.error('Error in Post.update:', error);
            throw error;
        }
    }

    static async delete(id, userId) {
        try {
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

    static async updateVotes(id, userId, voteType) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [postRows] = await connection.execute('SELECT id FROM posts WHERE id = ?', [id]);
            if (postRows.length === 0) throw new Error('Post not found');

            const [existing] = await connection.execute(
                'SELECT vote_type FROM post_votes WHERE post_id = ? AND user_id = ?',
                [id, userId]
            );

            let userVote = voteType;
            let hasVoted = true;

            if (existing.length > 0) {
                const oldVoteType = Number(existing[0].vote_type);

                if (oldVoteType === voteType) {
                    await connection.execute(
                        'DELETE FROM post_votes WHERE post_id = ? AND user_id = ?',
                        [id, userId]
                    );
                    userVote = null;
                    hasVoted = false;
                } else {
                    await connection.execute(
                        'UPDATE post_votes SET vote_type = ? WHERE post_id = ? AND user_id = ?',
                        [voteType, id, userId]
                    );
                }
            } else {
                await connection.execute(
                    'INSERT INTO post_votes (post_id, user_id, vote_type) VALUES (?, ?, ?)',
                    [id, userId, voteType]
                );
            }

            await connection.execute(
                `UPDATE posts p
                 SET p.vote_count = COALESCE((SELECT SUM(pv.vote_type) FROM post_votes pv WHERE pv.post_id = p.id), 0),
                     p.comment_count = (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id)
                 WHERE p.id = ?`,
                [id]
            );

            const [result] = await connection.execute(
                'SELECT vote_count, comment_count FROM posts WHERE id = ?',
                [id]
            );

            await connection.commit();

            return {
                postId: id,
                voteCount: result[0].vote_count,
                vote_count: result[0].vote_count,
                commentCount: result[0].comment_count,
                comment_count: result[0].comment_count,
                userVote,
                user_vote: userVote,
                hasVoted
            };
        } catch (error) {
            await connection.rollback();
            console.error('Error in Post.updateVotes:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    static async findByUser(userId, options = {}) {
        try {
            const { page, limit, offset } = this.sanitizePagination(options);

            const [rows] = await pool.query(
                `SELECT ${this.getPostSelectSql()}
                 FROM posts p
                 JOIN users u ON p.user_id = u.id
                 WHERE p.user_id = ?
                 ORDER BY p.created_at DESC
                 LIMIT ${limit} OFFSET ${offset}`,
                [userId]
            );

            const [countResult] = await pool.execute(
                'SELECT COUNT(*) AS total FROM posts WHERE user_id = ?',
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

    static async search(keyword, options = {}) {
        try {
            const cleanKeyword = String(keyword || '').trim();
            const { page, limit, offset } = this.sanitizePagination(options);

            if (!cleanKeyword) {
                return {
                    posts: [],
                    pagination: {
                        page,
                        limit,
                        total: 0,
                        totalPages: 0,
                        keyword: cleanKeyword
                    }
                };
            }

            const searchTerm = `%${cleanKeyword}%`;

            const [rows] = await pool.query(
                `SELECT ${this.getPostSelectSql()}
                 FROM posts p
                 JOIN users u ON p.user_id = u.id
                 WHERE p.title LIKE ? OR p.content LIKE ?
                 ORDER BY p.created_at DESC
                 LIMIT ${limit} OFFSET ${offset}`,
                [searchTerm, searchTerm]
            );

            const [countResult] = await pool.execute(
                'SELECT COUNT(*) AS total FROM posts WHERE title LIKE ? OR content LIKE ?',
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
                    keyword: cleanKeyword
                }
            };
        } catch (error) {
            console.error('Error in Post.search:', error);
            throw error;
        }
    }

    static async getTopPosts(limit = 5) {
        try {
            const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 20);

            const [rows] = await pool.query(
                `SELECT ${this.getPostSelectSql()}
                 FROM posts p
                 JOIN users u ON p.user_id = u.id
                 ORDER BY vote_count DESC, comment_count DESC, p.created_at DESC
                 LIMIT ${safeLimit}`
            );

            return rows;
        } catch (error) {
            console.error('Error in Post.getTopPosts:', error);
            throw error;
        }
    }

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

module.exports = Post;
