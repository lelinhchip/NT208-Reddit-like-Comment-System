const Comment = require('../models/Comment');
const { buildCommentTree, traverseCommentsDFS } = require('../utils/treeUtils');

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

// Lấy tất cả bình luận và chuyển đổi thành cấu trúc Cây (Tree Structure)
exports.getCommentsByPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const flatComments = await Comment.getByPostId(postId);

        const commentTree = buildCommentTree(flatComments);

        res.status(200).json(commentTree);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy bình luận", error: error.message });
    }
}

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

// Áp dụng DFS
// Tìm kiếm từ khóa trong cây bình luận
exports.searchInComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const { keyword } = req.query;

        if (!keyword) {
            return res.status(400).json({ message: "Vui lòng cung cấp từ khóa tìm kiếm" });
        }

        const flatComments = await Comment.getByPostId(postId);
        // Dựng cây
        const commentTree = buildCommentTree(flatComments);
        const matchedComments = [];

        // Duyệt cây bằng DFS
        traverseCommentsDFS(commentTree, (comment) => {
            if (comment.content.toLowerCase().includes(keyword.toLowerCase())) {
                const { replies, ...cleanComment } = comment;
                matchedComments.push(cleanComment);
            }
        });

        res.status(200).json(matchedComments);
    } catch (error) {
        res.status(500).json({ message: "Lỗi tìm kiếm bình luận", error: error.message });
    }
};

// Tính tổng số lượng phản hồi của 1 bình luận cụ thể (ưd: hiển thị nút "Xem tất cả 15 phản hồi" dưới một bình luận gốc)
exports.countTotalReplies = async (req, res) => {
    try {
        const { id, postId } = req.params; // id của bình luận gốc cần đếm

        // Dựng cây
        const flatComments = await Comment.getByPostId(postId);
        const commentTree = buildCommentTree(flatComments);

        // Tìm kiếm node mục tiêu
        let targetNode = null;
        traverseCommentsDFS(commentTree, (node) => {
            if (node.id === Number(id)) targetNode = node;
        });

        if (!targetNode) return res.status(404).json({ message: "Không tìm thấy bình luận" });

        let totalCount = 0;

        // ỨNG DỤNG DFS ĐỂ ĐẾM (Bỏ qua chính nó, chỉ đếm con cháu)
        traverseCommentsDFS([targetNode], (comment) => {
            if (comment.id !== Number(id)) {
                totalCount++;
            }
        });

        res.status(200).json({ comment_id: id, total_replies: totalCount });
    } catch (error) {
        res.status(500).json({ message: "Lỗi đếm số phản hồi", error: error.message });
    }
};

// Lấy danh sách ID người dùng tham gia vào một nhánh bình luận (Để gửi thông báo)
exports.getThreadParticipants = async (req, res) => {
    try {
        const { id, postId } = req.params;

        const flatComments = await Comment.getByPostId(postId);
        const commentTree = buildCommentTree(flatComments);

        let targetNode = null;
        traverseCommentsDFS(commentTree, (node) => {
            if (node.id === Number(id)) targetNode = node;
        });

        if (!targetNode) return res.status(404).json({ message: "Không tìm thấy bình luận" });

        const participants = new Set();
        traverseCommentsDFS([targetNode], (comment) => {
            if (comment.user_id) participants.add(comment.user_id);
        });

        res.status(200).json({ thread_id: id, participant_ids: Array.from(participants) });
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy người tham gia", error: error.message });
    }
};