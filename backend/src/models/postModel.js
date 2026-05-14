const db = require('../config/db');

const Post = 
{
    getAll: (sort = 'new') => 
    {
        const order = sort === 'top' ? 'score DESC' : 'created_at DESC';
        return db.query(`SELECT * FROM posts ORDER BY ${order}`);
    },

    getById: (id) => db.query('SELECT * FROM posts WHERE id = ?', [id]),
    
    create: (title, content) =>
        db.query('INSERT INTO posts (title, content) VALUES (?,?)', [title, content]),
    
    update: (id, title, content) =>
        db.query('UPDATE posts SET title=?, content=? WHERE id=?', [title, content,id]),

    delete: (id) => db.query('DELETE FROM posts WHERE id=?', [id]),
};

module.exports = Post;