SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;

DELIMITER $$

DROP PROCEDURE IF EXISTS insert_test_comments$$

CREATE PROCEDURE insert_test_comments()
BEGIN
    DECLARE counter INT DEFAULT 0;

    -- TẠO DỮ LIỆU GIẢ ĐỂ KHÔNG BỊ LỖI FOREIGN KEY
    INSERT IGNORE INTO users (id, username, email, password_hash) VALUES 
    (1, 'test_user_1', 'user1@test.com', 'hash123'),
    (2, 'test_user_2', 'user2@test.com', 'hash123');

    INSERT IGNORE INTO posts (id, user_id, title, content) VALUES 
    (3, 1, 'BÀI VIẾT TEST 1000 COMMENT', 'Nội dung test');

    -- VÒNG LẶP INSERT 1000 COMMENTS
    WHILE counter < 1000 DO
        INSERT INTO comments (user_id, post_id, parent_comment_id, content, vote_count, created_at)
        VALUES (
            IF(counter % 2 = 0, 1, 2),  
            3,                          
            NULL,                       
            CONCAT('Test comment ', counter),
            FLOOR(RAND() * 50),        
            DATE_SUB(NOW(), INTERVAL counter SECOND)  
        );
        SET counter = counter + 1;
    END WHILE;
END$$

DELIMITER ;

CALL insert_test_comments();

SELECT COUNT(*) as total_comments FROM comments WHERE post_id = 3;