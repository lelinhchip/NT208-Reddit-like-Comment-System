const db = require('../config/db');

const Vote = {
  upsert: (post_id, user_id, value) =>
    db.query(
      `INSERT INTO votes (post_id, user_id, value) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE value = ?`,
      [post_id, user_id, value, value]
    ),

  recalcScore: (post_id) =>
    db.query(
      `UPDATE posts SET score = (
         SELECT COALESCE(SUM(value), 0) FROM votes WHERE post_id = ?
       ) WHERE id = ?`,
      [post_id, post_id]
    ),
};

module.exports = Vote;