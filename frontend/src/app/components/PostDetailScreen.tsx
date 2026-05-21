import { ArrowLeft, ArrowUp, ArrowDown, MessageSquare, Share2, Send, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPostById } from '../../api/postApi';
import { getCommentsByPostId, createComment } from '../../api/commentApi';

interface PostDetailScreenProps {
    postId: string;
    onBack: () => void;
}

export function PostDetailScreen({ postId, onBack }: PostDetailScreenProps) {
    const [post, setPost] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Hàm tải dữ liệu (Dùng chung để gọi lại khi có bình luận mới)
    const loadData = async () => {
        try {
            const [postRes, commentsRes] = await Promise.all([
                getPostById(postId),
                getCommentsByPostId(postId)
            ]);
            setPost(postRes.data);
            setComments(commentsRes); // commentsRes trả về mảng Tree Structure trực tiếp từ Backend
        } catch (error) {
            console.error("Lỗi lấy chi tiết bài viết:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [postId]);

    // Gửi bình luận gốc (Comment cấp 1)
    const handleSendComment = async () => {
        if (!commentText.trim()) return;
        setIsSubmitting(true);
        try {
            await createComment({
                post_id: postId,
                content: commentText.trim(),
                parent_comment_id: null // Bình luận gốc
            });
            setCommentText('');
            loadData(); // Reload để hiện bình luận mới
        } catch (error) {
            console.error("Lỗi gửi bình luận:", error);
            alert("Gửi bình luận thất bại");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Đang tải...</div>;
    if (!post) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Bài viết không tồn tại</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Top Bar */}
            <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-4 py-3 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <span className="text-white font-medium">Post Detail</span>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Full Post */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-white text-sm">r/</span>
                        </div>
                        <span className="text-sm font-medium text-white">r/general</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-sm text-gray-400">u/{post.username || 'Anonymous'}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-sm text-gray-400">{new Date(post.created_at).toLocaleString()}</span>
                    </div>

                    <h1 className="text-white mb-4 text-2xl font-bold">{post.title}</h1>
                    <p className="text-gray-300 mb-4 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                    {/* Action Bar */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-[#0a0a0a] rounded-full px-3 py-2">
                            <button className="hover:text-orange-500 text-gray-400 transition-colors">
                                <ArrowUp className="w-5 h-5" />
                            </button>
                            <span className="text-white font-medium min-w-[2rem] text-center">{post.vote_count || 0}</span>
                            <button className="hover:text-blue-500 text-gray-400 transition-colors">
                                <ArrowDown className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Add Comment Input */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 mb-6">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                            placeholder="Thêm bình luận..."
                            className="flex-1 bg-transparent text-white placeholder:text-gray-500 focus:outline-none"
                        />
                        <button
                            onClick={handleSendComment}
                            disabled={isSubmitting || !commentText.trim()}
                            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Tree Comments */}
                <div className="space-y-0">
                    {comments.length === 0 ? (
                        <div className="text-gray-500 text-center py-4">Chưa có bình luận nào.</div>
                    ) : (
                        comments.map((comment) => (
                            <DarkComment
                                key={comment.id}
                                comment={comment}
                                depth={0}
                                postId={postId}
                                onReplySuccess={loadData} // Truyền hàm reload xuống các component con
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// Component hiển thị Bình luận Đệ quy
function DarkComment({ comment, depth, postId, onReplySuccess }: { comment: any; depth: number, postId: string, onReplySuccess: () => void }) {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const maxDepth = 8;
    const shouldIndent = depth < maxDepth;

    const handleReply = async () => {
        if (!replyText.trim()) return;
        setIsSubmitting(true);
        try {
            await createComment({
                post_id: postId,
                content: replyText.trim(),
                parent_comment_id: comment.id // Truyền ID của bình luận cha để tạo Cây
            });
            setReplyText('');
            setShowReplyInput(false);
            onReplySuccess(); // Cập nhật lại cây bình luận
        } catch (error) {
            alert("Trả lời thất bại");
        } finally {
            setIsSubmitting(false);
        }
    };

    const username = comment.username || 'Anonymous';
    const avatarColors = ['bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-pink-600', 'bg-yellow-600'];
    const avatarColor = avatarColors[username.length % avatarColors.length];

    return (
        <div className="relative">
            {depth > 0 && shouldIndent && (
                <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-[#2a2a2a]" />
            )}

            <div className={`${shouldIndent ? 'ml-8' : ''} relative py-3`}>
                <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-sm font-medium">{username.charAt(0).toUpperCase()}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white">u/{username}</span>
                            <span className="text-gray-600">•</span>
                            <span className="text-sm text-gray-400">{new Date(comment.created_at).toLocaleString()}</span>
                        </div>

                        <p className="text-gray-300 mb-2 leading-relaxed">{comment.content}</p>

                        <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1">
                                <button className="hover:bg-[#1a1a1a] p-1 rounded transition-colors text-gray-400">
                                    <ArrowUp className="w-4 h-4" />
                                </button>
                                <span className="font-medium min-w-[1.5rem] text-center text-white">{comment.vote_count || 0}</span>
                                <button className="hover:bg-[#1a1a1a] p-1 rounded transition-colors text-gray-400">
                                    <ArrowDown className="w-4 h-4" />
                                </button>
                            </div>

                            <button
                                onClick={() => setShowReplyInput(!showReplyInput)}
                                className="flex items-center gap-1 hover:bg-[#1a1a1a] px-2 py-1 rounded transition-colors text-gray-400 hover:text-white"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span className="font-medium">Reply</span>
                            </button>
                        </div>

                        {/* Form Trả lời */}
                        {showReplyInput && (
                            <div className="mt-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-3">
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                                    placeholder={`Trả lời u/${username}...`}
                                    className="w-full bg-transparent text-white placeholder:text-gray-500 focus:outline-none mb-2"
                                />
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => setShowReplyInput(false)}
                                        className="px-4 py-1.5 rounded-full text-gray-400 hover:bg-[#1a1a1a] transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleReply}
                                        disabled={isSubmitting || !replyText.trim()}
                                        className="bg-[#FF4500] text-white px-4 py-1.5 rounded-full hover:bg-[#ff5722] transition-colors disabled:opacity-50"
                                    >
                                        Gửi
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Đệ quy các replies con */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-2">
                        {comment.replies.map((reply: any) => (
                            <DarkComment
                                key={reply.id}
                                comment={reply}
                                depth={depth + 1}
                                postId={postId}
                                onReplySuccess={onReplySuccess}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}