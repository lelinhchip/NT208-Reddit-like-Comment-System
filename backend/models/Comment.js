const { pool } = require('../config/db');

let commentVoteTableReady = false;

async function ensureCommentVotesTable() {
    if (commentVoteTableReady) return;

    await pool.execute(`
    CREATE TABLE IF NOT EXISTS comment_votes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      comment_id INT NOT NULL,
      user_id INT NOT NULL,
      vote_type TINYINT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_comment_user (comment_id, user_id),
      INDEX idx_comment_votes_comment_id (comment_id),
      INDEX idx_comment_votes_user_id (user_id)
    )
  `);

    commentVoteTableReady = true;
}

class Comment {
    static async create(commentData) {
        const connection = await pool.getConnection();
        try {
            const { post_id, user_id, content, parent_comment_id } = commentData;

            await connection.beginTransaction();

            const [result] = await connection.execute(
                `INSERT INTO comments (user_id, post_id, parent_comment_id, content, vote_count)
         VALUES (?, ?, ?, ?, 0)`,
                [user_id, post_id, parent_comment_id || null, content]
            );

            try {
                await connection.execute(
                    `UPDATE posts
           SET comment_count = (SELECT COUNT(*) FROM comments WHERE post_id = ?)
           WHERE id = ?`,
                    [post_id, post_id]
                );
            } catch (error) {
                if (error.code !== 'ER_BAD_FIELD_ERROR') throw error;
            }

            await connection.commit();

            return await this.findById(result.insertId);
        } catch (error) {
            await connection.rollback();
            throw new Error(`Lỗi tạo comment: ${error.message}`);
        } finally {
            connection.release();
        }
    }

    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                `SELECT c.*, u.username, u.avatar_url,
                COALESCE((SELECT SUM(cv.vote_type) FROM comment_votes cv WHERE cv.comment_id = c.id), c.vote_count, 0) AS calculated_vote_count
         FROM comments c
         LEFT JOIN users u ON c.user_id = u.id
         WHERE c.id = ?`,
                [id]
            );
            if (!rows[0]) return null;
            rows[0].vote_count = Number(rows[0].calculated_vote_count || 0);
            delete rows[0].calculated_vote_count;
            return rows[0];
        } catch (error) {
            if (error.code === 'ER_NO_SUCH_TABLE') {
                const [rows] = await pool.execute('SELECT * FROM comments WHERE id = ?', [id]);
                return rows[0] || null;
            }
            throw new Error(`Lỗi lấy comment: ${error.message}`);
        }
    }

    static async getByPostId(postId, userId = null, sort = 'new') {
        try {
            await ensureCommentVotesTable();

            const params = userId ? [userId, postId] : [postId];
            const userVoteSelect = userId
                ? ', (SELECT cv2.vote_type FROM comment_votes cv2 WHERE cv2.comment_id = c.id AND cv2.user_id = ? LIMIT 1) AS user_vote'
                : ', NULL AS user_vote';

            const orderByClause = sort === 'top' 
                ? 'ORDER BY calculated_vote_count DESC, c.created_at DESC' 
                : 'ORDER BY c.created_at ASC';

            const [rows] = await pool.execute(
                `SELECT c.*, u.username, u.avatar_url,
                COALESCE((SELECT SUM(cv.vote_type) FROM comment_votes cv WHERE cv.comment_id = c.id), 0) AS calculated_vote_count
                ${userVoteSelect}
         FROM comments c
         LEFT JOIN users u ON c.user_id = u.id
         WHERE c.post_id = ?
         ${orderByClause}`,
                params
            );

            return rows.map((row) => {
                row.vote_count = Number(row.calculated_vote_count || 0);
                row.user_vote = row.user_vote === null || row.user_vote === undefined ? null : Number(row.user_vote);
                delete row.calculated_vote_count;
                return row;
            });
        } catch (error) {
            throw new Error(`Lỗi lấy comment theo post: ${error.message}`);
        }
    }

    static async update(id, updateData) {
        try {
            const { content } = updateData;
            const [result] = await pool.execute(
                `UPDATE comments
         SET content = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
                [content, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            if (error.code === 'ER_BAD_FIELD_ERROR') {
                const [result] = await pool.execute(
                    'UPDATE comments SET content = ? WHERE id = ?',
                    [content, id]
                );
                return result.affectedRows > 0;
            }
            throw new Error(`Lỗi cập nhật comment: ${error.message}`);
        }
    }

    static async delete(id) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [commentRows] = await connection.execute(
                'SELECT post_id FROM comments WHERE id = ?',
                [id]
            );
            if (commentRows.length === 0) {
                await connection.rollback();
                return false;
            }

            const postId = commentRows[0].post_id;

            await connection.execute('DELETE FROM comment_votes WHERE comment_id = ?', [id]).catch(() => { });
            const [result] = await connection.execute('DELETE FROM comments WHERE id = ?', [id]);

            try {
                await connection.execute(
                    `UPDATE posts
           SET comment_count = (SELECT COUNT(*) FROM comments WHERE post_id = ?)
           WHERE id = ?`,
                    [postId, postId]
                );
            } catch (error) {
                if (error.code !== 'ER_BAD_FIELD_ERROR') throw error;
            }

            await connection.commit();
            return result.affectedRows > 0;
        } catch (error) {
            await connection.rollback();
            throw new Error(`Lỗi xóa comment: ${error.message}`);
        } finally {
            connection.release();
        }
    }

    static async updateVotes(id, userId, voteType) {
        const connection = await pool.getConnection();
        try {
            const vote = Number(voteType);
            if (![1, -1].includes(vote)) {
                throw new Error('vote_type phải là 1 hoặc -1');
            }

            await ensureCommentVotesTable();
            await connection.beginTransaction();

            const [commentRows] = await connection.execute(
                'SELECT id, user_id, post_id FROM comments WHERE id = ?',
                [id]
            );
            if (commentRows.length === 0) {
                throw new Error('Bình luận không tồn tại');
            }

            const [existing] = await connection.execute(
                'SELECT vote_type FROM comment_votes WHERE comment_id = ? AND user_id = ?',
                [id, userId]
            );

            let userVote = vote;

            if (existing.length > 0) {
                const oldVoteType = Number(existing[0].vote_type);
                if (oldVoteType === vote) {
                    await connection.execute(
                        'DELETE FROM comment_votes WHERE comment_id = ? AND user_id = ?',
                        [id, userId]
                    );
                    userVote = null;
                } else {
                    await connection.execute(
                        'UPDATE comment_votes SET vote_type = ? WHERE comment_id = ? AND user_id = ?',
                        [vote, id, userId]
                    );
                }
            } else {
                await connection.execute(
                    'INSERT INTO comment_votes (comment_id, user_id, vote_type) VALUES (?, ?, ?)',
                    [id, userId, vote]
                );
            }

            const [counterRows] = await connection.execute(
                'SELECT COALESCE(SUM(vote_type), 0) AS vote_count FROM comment_votes WHERE comment_id = ?',
                [id]
            );
            const voteCount = Number(counterRows[0]?.vote_count || 0);

            await connection.execute(
                'UPDATE comments SET vote_count = ? WHERE id = ?',
                [voteCount, id]
            );

            await connection.commit();

            return {
                comment_id: Number(id),
                commentId: Number(id),
                post_id: Number(commentRows[0].post_id),
                vote_count: voteCount,
                voteCount,
                user_vote: userVote,
                userVote,
                hasVoted: userVote !== null,
            };
        } catch (error) {
            await connection.rollback();
            throw new Error(`Lỗi cập nhật vote: ${error.message}`);
        } finally {
            connection.release();
        }
    }
}

module.exports = Comment;
