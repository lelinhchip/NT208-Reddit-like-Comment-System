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

module.exports = Post;