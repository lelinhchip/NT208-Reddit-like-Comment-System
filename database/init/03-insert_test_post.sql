SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;

DELIMITER $$

DROP PROCEDURE IF EXISTS insert_test_posts$$

CREATE PROCEDURE insert_test_posts()
BEGIN
    DECLARE counter INT DEFAULT 1;
    DECLARE max_posts INT DEFAULT 50; -- Tạo 50 bài post giả

    -- 1. TẠO DỮ LIỆU USER GIẢ ĐỂ KHÔNG BỊ LỖI FOREIGN KEY (nếu chưa có)
    INSERT IGNORE INTO users (id, username, email, password_hash) VALUES 
    (1, 'test_user_1', 'user1@test.com', 'hash123'),
    (2, 'test_user_2', 'user2@test.com', 'hash123'),
    (3, 'test_user_3', 'user3@test.com', 'hash123');

    -- 2. VÒNG LẶP INSERT POSTS
    WHILE counter <= max_posts DO
        INSERT INTO posts (user_id, title, content, vote_count, comment_count, created_at)
        VALUES (
            (counter % 3) + 1,  -- Luân phiên bài viết thuộc về user 1, 2 và 3
            CONCAT('Bài viết test số ', counter, ': Hướng dẫn sử dụng hệ thống ThreadNest'),
            CONCAT('Đây là nội dung chi tiết của bài viết số ', counter, '. Dữ liệu này được tự động sinh ra để kiểm tra tính năng hiển thị danh sách, phân trang và tìm kiếm của dự án.'),
            FLOOR(RAND() * 100), -- Random vote_count từ 0 đến 99 để test sắp xếp Top
            0,                   -- comment_count mặc định 0
            DATE_SUB(NOW(), INTERVAL counter HOUR) -- Lùi dần thời gian để test sắp xếp New
        );
        SET counter = counter + 1;
    END WHILE;
END$$

DELIMITER ;

-- 3. GỌI PROCEDURE ĐỂ THỰC THI
CALL insert_test_posts();

-- 4. KIỂM TRA LẠI KẾT QUẢ
SELECT COUNT(*) as total_posts FROM posts;
SELECT id, title, user_id, vote_count, created_at FROM posts ORDER BY created_at DESC LIMIT 5;