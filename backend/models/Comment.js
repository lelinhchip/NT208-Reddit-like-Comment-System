const pool = require('../config/db');

class Comment {
    // Tạo comment mới
    static async create(commentData) {
        try {
            const { post_id, user_id, content, parent_comment_id } = commentData;

            const query = `
                INSERT INTO comments (user_id, post_id, parent_comment_id, content, vote_count)
                VALUES (?, ?, ?, ?, 0)
            `;

            const [result] = await pool.execute(query, [
                user_id,
                post_id,
                parent_comment_id || null,
                content
            ]);

            return {
                id: result.insertId,
                post_id,
                user_id,
                content,
                parent_comment_id: parent_comment_id || null,
                vote_count: 0,
                created_at: new Date(),
                updated_at: new Date()
            };
        } catch (error) {
            throw new Error(`Lỗi tạo comment: ${error.message}`);
        }
    }

    // Lấy comment theo ID
    static async findById(id) {
        try {
            const query = `SELECT * FROM comments WHERE id = ?`;
            const [rows] = await pool.execute(query, [id]);
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Lỗi lấy comment: ${error.message}`);
        }
    }

    // Lấy tất cả comment của một bài post (Dữ liệu phẳng)
    static async getByPostId(postId) {
        try {
            const query = `
                SELECT c.*, u.username, u.avatar_url 
                FROM comments c
                LEFT JOIN users u ON c.user_id = u.id
                WHERE c.post_id = ? 
                ORDER BY c.created_at ASC
            `;
            const [rows] = await pool.execute(query, [postId]);
            return rows;
        } catch (error) {
            throw new Error(`Lỗi lấy comment theo post: ${error.message}`);
        }
    }

    // Cập nhật comment
    static async update(id, updateData) {
        try {
            const { content } = updateData;
            const query = `
                UPDATE comments 
                SET content = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            const [result] = await pool.execute(query, [content, id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Lỗi cập nhật comment: ${error.message}`);
        }
    }

    // Xóa comment
    static async delete(id) {
        try {
            const query = `DELETE FROM comments WHERE id = ?`;
            const [result] = await pool.execute(query, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Lỗi xóa comment: ${error.message}`);
        }
    }

    // Cập nhật vote count
    static async updateVotes(id, voteCount) {
        try {
            const query = `
                UPDATE comments 
                SET vote_count = ?
                WHERE id = ?
            `;
            const [result] = await pool.execute(query, [voteCount, id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Lỗi cập nhật vote: ${error.message}`);
        }
    }
}

module.exports = Comment;
