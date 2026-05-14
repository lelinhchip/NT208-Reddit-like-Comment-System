const Comment = require('../models/Comment');

exports.createComment = async (req, res) => {
    try {
        const { post_id, content, parent_comment_id } = req.body;
        const user_id = req.user?.id; // Lấy từ token (auth middleware)

        // Validation
        if (!content || content.trim() === "") {
            return res.status(400).json({ message: "Nội dung không được để trống" });
        }

        if (!post_id) {
            return res.status(400).json({ message: "post_id là bắt buộc" });
        }

        if (!user_id) {
            return res.status(401).json({ message: "Vui lòng đăng nhập" });
        }

        // Tạo comment trong database
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
        const user_id = req.user?.id;

        if (!content || content.trim() === "") {
            return res.status(400).json({ message: "Nội dung không được để trống" });
        }

        // TODO: Kiểm tra user có sở hữu comment không trước khi update
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
        const user_id = req.user?.id;

        // TODO: Kiểm tra user có sở hữu comment không trước khi xóa
        const deleted = await Comment.delete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Bình luận không tồn tại" });
        }
        res.status(200).json({ message: "Bình luận đã được xóa" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa bình luận", error: error.message });
    }
};

// Vote cho bình luận (Upvote/Downvote)
exports.voteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { vote_type } = req.body;
        const user_id = req.user?.id;

        if (![1, -1].includes(Number(vote_type))) {
            return res.status(400).json({ message: "vote_type phải là 1 (upvote) hoặc -1 (downvote)" });
        }

        if (!user_id) {
            return res.status(401).json({ message: "Vui lòng đăng nhập" });
        }

        // TODO: Implement vote logic với database
        console.log(`Vote comment ${id} với type ${vote_type} từ user ${user_id}`);
        
        res.status(200).json({ 
            message: "Vote thành công",
            comment_id: id,
            vote_type,
            user_id
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi vote", error: error.message });
    }
};