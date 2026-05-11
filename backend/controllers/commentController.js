const Comment = require('../models/Comment');

exports.createComment = async (req, res) => {
    try {
        const { post_id, user_id, content, parent_comment_id } = req.body;

        // 1. Validation
        if (!content || content.trim() === "") {
            return res.status(400).json({ message: "Nội dung không được để trống" });
        }

        if (!post_id || !user_id) {
            return res.status(400).json({ message: "post_id và user_id là bắt buộc" });
        }

        // 2. Tạo comment trong database
        const newComment = await Comment.create({
            post_id,
            user_id,
            content: content.trim(),
            parent_comment_id: parent_comment_id || null
        });

        console.log("Đã tạo comment mới:", newComment);
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi tạo bình luận", error: error.message });
    }
};

// Lấy tất cả bình luận của một bài viết
exports.getCommentsByPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await Comment.getByPostId(postId);
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy bình luận", error: error.message });
    }
};

// Lấy chi tiết một bình luận
exports.getCommentById = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ message: "Bình luận không tồn tại" });
        }
        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy bình luận", error: error.message });
    }
};

// Lấy các reply của một bình luận
exports.getReplies = async (req, res) => {
    try {
        const { commentId } = req.params;
        const replies = await Comment.getReplies(commentId);
        res.status(200).json(replies);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy reply", error: error.message });
    }
};

// Cập nhật bình luận
exports.updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!content || content.trim() === "") {
            return res.status(400).json({ message: "Nội dung không được để trống" });
        }

        const updated = await Comment.update(id, { content: content.trim() });
        if (!updated) {
            return res.status(404).json({ message: "Bình luận không tồn tại" });
        }

        const updatedComment = await Comment.findById(id);
        res.status(200).json(updatedComment);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi cập nhật bình luận", error: error.message });
    }
};

// Xóa bình luận
exports.deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Comment.delete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Bình luận không tồn tại" });
        }
        res.status(200).json({ message: "Bình luận đã được xóa" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa bình luận", error: error.message });
    }
};

// Vote cho bình luận (Upvote/Downvote) - TODO
exports.voteComment = async (req, res) => {
    try {
        res.status(501).json({ message: "Chức năng vote chưa được implement" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi vote", error: error.message });
    }
};