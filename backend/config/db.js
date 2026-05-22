const mysql = require('mysql2/promise');
require('dotenv').config();

//Tạo connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'reddit_clone',
    charset: 'utf8mb4',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

//Kiểm tra kết nối
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('MySQL connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('MySQL connection failed:', error.message);
        return false;
    }
};

// Wrapper để sử dụng cùng API `db.query(...)` trong các model hiện tại
const query = (...args) => pool.query(...args);

module.exports = { pool, query, testConnection };
