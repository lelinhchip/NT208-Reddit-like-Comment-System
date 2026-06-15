/**
 * Thuật toán dựng cấu trúc cây từ mảng bình luận phẳng bằng HashMap.
 * * @param {Array} flatComments - Mảng phẳng các bình luận lấy từ database
 * @returns {Array} Mảng các bình luận gốc đã được lồng cấu trúc 'replies'
 */
exports.buildCommentTree = (flatComments) => {
    if (!flatComments || flatComments.length === 0) return [];

    const commentMap = {};
    const rootComments = [];

    // Vòng 1: Khởi tạo Map và gắn sẵn thuộc tính 'replies' rỗng cho từng node
    flatComments.forEach(comment => {
        comment.replies = [];
        commentMap[comment.id] = comment;
    });

    // Vòng 2: Duyệt và gắn các node con vào đúng vị trí node cha dựa trên parent_comment_id
    flatComments.forEach(comment => {
        const currentMapped = commentMap[comment.id];
        if (comment.parent_comment_id) {
            const parentComment = commentMap[comment.parent_comment_id];
            if (parentComment) {
                parentComment.replies.push(currentMapped);
            }
        } else {
            rootComments.push(currentMapped);
        }
    });

    return rootComments;
};

/**
 * Thuật toán duyệt cây bình luận theo chiều sâu (Iterative DFS)
 * * @param {Array} rootComments - Cây bình luận gốc 
 * @param {Function} callback - Hàm thực thi logic trên từng node bình luận
 */
exports.traverseCommentsDFS = (rootComments, callback) => {
    if (!rootComments || rootComments.length === 0) return;

    // Đảo ngược mảng gốc trước khi đưa vào Stack để giữ đúng thứ tự thời gian
    const stack = [...rootComments].reverse();

    while (stack.length > 0) {
        const currentComment = stack.pop();

        callback(currentComment);

        if (currentComment.replies && currentComment.replies.length > 0) {
            for (let i = currentComment.replies.length - 1; i >= 0; i--) {
                stack.push(currentComment.replies[i]);
            }
        }
    }
};