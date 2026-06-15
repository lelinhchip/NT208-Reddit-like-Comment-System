const mysql = require('mysql2/promise');

async function seedNested() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'reddit_db'
    });

    try {
        // Lấy post mới nhất
        const [posts] = await pool.query('SELECT id FROM posts ORDER BY id DESC LIMIT 1');
        if (posts.length === 0) {
            console.log('Không có bài viết nào!');
            process.exit();
        }
        const postId = posts[0].id;

        console.log('Đang tạo cây bình luận cho Post ID:', postId);

        // 1. Bình luận gốc
        const [res1] = await pool.query(
            'INSERT INTO comments (user_id, post_id, parent_comment_id, content, vote_count) VALUES (?, ?, ?, ?, ?)', 
            [1, postId, null, 'Đồ án này làm kỹ quá, phần thiết kế Database rất chi tiết!', 12]
        );
        const rootId = res1.insertId;

        // 2. Reply cấp 1
        const [res2] = await pool.query(
            'INSERT INTO comments (user_id, post_id, parent_comment_id, content, vote_count) VALUES (?, ?, ?, ?, ?)', 
            [2, postId, rootId, 'Đúng rồi, đặc biệt là phần đệ quy lấy cây bình luận cực kỳ mượt luôn.', 5]
        );
        const level1Id = res2.insertId;

        // 3. Reply cấp 2
        const [res3] = await pool.query(
            'INSERT INTO comments (user_id, post_id, parent_comment_id, content, vote_count) VALUES (?, ?, ?, ?, ?)', 
            [3, postId, level1Id, 'Nhóm bạn có dùng đệ quy SQL không hay xử lý trên RAM vậy?', 2]
        );
        const level2Id = res3.insertId;

        // 4. Reply cấp 3
        await pool.query(
            'INSERT INTO comments (user_id, post_id, parent_comment_id, content, vote_count) VALUES (?, ?, ?, ?, ?)', 
            [1, postId, level2Id, 'Bọn mình lấy danh sách phẳng rồi dựng cây O(n) bằng HashMap trên Node.js bạn nhé.', 8]
        );

        // 5. Thêm một reply khác ở cấp 1 cho xôm
        await pool.query(
            'INSERT INTO comments (user_id, post_id, parent_comment_id, content, vote_count) VALUES (?, ?, ?, ?, ?)', 
            [4, postId, rootId, 'Cho mình xin Github tham khảo với nhé!', 1]
        );

        // Update comment_count cho post
        await pool.query('UPDATE posts SET comment_count = comment_count + 5 WHERE id = ?', [postId]);

        console.log('Thành công! Đã tạo xong cây bình luận sâu 4 cấp.');
    } catch (error) {
        console.error('Lỗi:', error);
    } finally {
        pool.end();
    }
}

seedNested();
