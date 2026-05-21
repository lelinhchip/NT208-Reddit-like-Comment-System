-- Tạo 1000 test comments cho post id=3
DELIMITER $$

DROP PROCEDURE IF EXISTS insert_test_comments$$

CREATE PROCEDURE insert_test_comments()
BEGIN
    DECLARE counter INT DEFAULT 0;
    WHILE counter < 1000 DO
        INSERT INTO comments (user_id, post_id, parent_comment_id, content, vote_count, created_at)
        VALUES (
            IF(counter % 2 = 0, 1, 2),  -- Thay đổi user_id giữa 1 và 2
            3,                          -- post_id
            NULL,                       -- parent_comment_id (main comments)
            CONCAT('Test comment ', counter),
            FLOOR(RAND() * 50),        -- vote_count
            DATE_SUB(NOW(), INTERVAL counter SECOND)  -- created_at
        );
        SET counter = counter + 1;
    END WHILE;
END$$

DELIMITER ;

-- Gọi procedure
CALL insert_test_comments();

-- Kiểm tra kết quả
SELECT COUNT(*) as total_comments FROM comments WHERE post_id = 3;
