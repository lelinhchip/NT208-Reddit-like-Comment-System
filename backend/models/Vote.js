const db = require('../config/db');

const Vote = {
  upsert: (post_id, user_id, value) =>
    db.query(
      `INSERT INTO post_votes (post_id, user_id, vote_type) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE vote_type = ?`,
      [post_id, user_id, value, value]
    ),

  recalcScore: (post_id) =>
    db.query(
      `UPDATE posts SET score = (
        SELECT COALESCE(SUM(vote_type), 0) FROM post_votes WHERE post_id = ?
      ) WHERE id = ?`,
      [post_id, post_id]
    ),
};

module.exports = Vote;
