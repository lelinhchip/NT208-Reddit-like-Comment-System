USE reddit_db;

-- 1. TẠO BẢNG
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(300) NOT NULL,
    content TEXT,
    vote_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    parent_comment_id INT NULL,
    content TEXT NOT NULL,
    vote_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comment_votes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    comment_id INT NOT NULL,
    vote_type TINYINT NOT NULL CHECK (vote_type IN (1, -1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_comment_vote (user_id, comment_id)
);

CREATE TABLE IF NOT EXISTS post_votes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    vote_type TINYINT NOT NULL CHECK (vote_type IN (1, -1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_post_vote (user_id, post_id)
);

-- 2. TẠO INDEX
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX idx_post_votes_post_id ON post_votes(post_id);

-- 3. TẠO TRIGGERS (ĐÃ BỔ SUNG SỰ KIỆN UPDATE)
DELIMITER $$

-- Triggers cho Posts
CREATE TRIGGER after_post_vote_insert AFTER INSERT ON post_votes FOR EACH ROW
BEGIN
    UPDATE posts SET vote_count = vote_count + NEW.vote_type WHERE id = NEW.post_id;
END$$

CREATE TRIGGER after_post_vote_delete AFTER DELETE ON post_votes FOR EACH ROW
BEGIN
    UPDATE posts SET vote_count = vote_count - OLD.vote_type WHERE id = OLD.post_id;
END$$

CREATE TRIGGER after_post_vote_update AFTER UPDATE ON post_votes FOR EACH ROW
BEGIN
    UPDATE posts SET vote_count = vote_count - OLD.vote_type + NEW.vote_type WHERE id = NEW.post_id;
END$$

-- Triggers cho Comments
CREATE TRIGGER after_comment_vote_insert AFTER INSERT ON comment_votes FOR EACH ROW
BEGIN
    UPDATE comments SET vote_count = vote_count + NEW.vote_type WHERE id = NEW.comment_id;
END$$

CREATE TRIGGER after_comment_vote_delete AFTER DELETE ON comment_votes FOR EACH ROW
BEGIN
    UPDATE comments SET vote_count = vote_count - OLD.vote_type WHERE id = OLD.comment_id;
END$$

CREATE TRIGGER after_comment_vote_update AFTER UPDATE ON comment_votes FOR EACH ROW
BEGIN
    UPDATE comments SET vote_count = vote_count - OLD.vote_type + NEW.vote_type WHERE id = NEW.comment_id;
END$$

-- Triggers đếm số lượng Comment
CREATE TRIGGER after_comment_insert AFTER INSERT ON comments FOR EACH ROW
BEGIN   
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
END$$

CREATE TRIGGER after_comment_delete AFTER DELETE ON comments FOR EACH ROW
BEGIN   
    UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
END$$

DELIMITER ;