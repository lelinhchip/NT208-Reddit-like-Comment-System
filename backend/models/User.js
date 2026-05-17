const db = require('../config/db');

const User = {
  // Tạo user mới
  create: (username, email, password_hash) =>
    db.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, password_hash]
    ),

  // Tìm user theo ID
  findById: (id) =>
    db.query(
      'SELECT id, username, email, avatar_url, created_at FROM users WHERE id = ?',
      [id]
    ),

  // Tìm user theo username
  findByUsername: (username) =>
    db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    ),

  // Tìm user theo email
  findByEmail: (email) =>
    db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    ),

  // Lấy tất cả users
  getAll: () =>
    db.query(
      'SELECT id, username, email, avatar_url, created_at FROM users'
    ),

  // Cập nhật user
  update: (id, data) => {
    const { username, email, avatar_url } = data;
    return db.query(
      'UPDATE users SET username = ?, email = ?, avatar_url = ? WHERE id = ?',
      [username, email, avatar_url, id]
    );
  },

  // Xóa user
  delete: (id) =>
    db.query('DELETE FROM users WHERE id = ?', [id])
};

module.exports = User;
