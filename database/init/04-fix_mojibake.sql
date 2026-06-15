-- 04-fix_mojibake.sql

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;

ALTER DATABASE reddit_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE posts CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE comments CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE post_votes CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE comment_votes CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Repair mojibake in posts.
UPDATE posts
SET
  title = CONVERT(BINARY CONVERT(title USING latin1) USING utf8mb4)
WHERE title REGEXP 'Ã|Â|Ä|Æ|áº|á»|â€';

UPDATE posts
SET
  content = CONVERT(BINARY CONVERT(content USING latin1) USING utf8mb4)
WHERE content REGEXP 'Ã|Â|Ä|Æ|áº|á»|â€';

-- Repair mojibake in comments.
UPDATE comments
SET
  content = CONVERT(BINARY CONVERT(content USING latin1) USING utf8mb4)
WHERE content REGEXP 'Ã|Â|Ä|Æ|áº|á»|â€';

-- Recalculate cached counts.
UPDATE posts p
LEFT JOIN (
  SELECT post_id, COUNT(*) AS total_comments
  FROM comments
  GROUP BY post_id
) c ON c.post_id = p.id
SET p.comment_count = COALESCE(c.total_comments, 0);

UPDATE posts p
LEFT JOIN (
  SELECT post_id, COALESCE(SUM(vote_type), 0) AS total_votes
  FROM post_votes
  GROUP BY post_id
) v ON v.post_id = p.id
SET p.vote_count = COALESCE(v.total_votes, 0);

UPDATE comments c
LEFT JOIN (
  SELECT comment_id, COALESCE(SUM(vote_type), 0) AS total_votes
  FROM comment_votes
  GROUP BY comment_id
) v ON v.comment_id = c.id
SET c.vote_count = COALESCE(v.total_votes, 0);

SELECT id, title, content FROM posts ORDER BY id DESC LIMIT 5;
