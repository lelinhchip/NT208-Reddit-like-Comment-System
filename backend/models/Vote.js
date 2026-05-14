const db = require('../config/db');

const Vote = {
  upsert: (post_id, user_id, value) =>
    db.query
    (
      `INSERT INTO post_votes (post_id, user_id, vote_type) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE vote_type = ?`,
      [post_id, user_id, value, value]
    ),
};

module.exports = Vote;
