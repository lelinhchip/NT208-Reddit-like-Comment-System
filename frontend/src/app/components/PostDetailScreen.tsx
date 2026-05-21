import { ArrowLeft, ArrowUp, ArrowDown, MessageSquare, Send, LogOut, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getPostById, votePost, deletePost } from '../../api/postApi';
import { createComment, deleteComment, getCommentsByPostId, voteComment } from '../../api/commentApi';
import { isAuthenticated } from '../../api/userApi';

interface PostDetailScreenProps {
    postId: string;
    user?: any;
    onBack: () => void;
    onLogout: () => void;
}

function getScore(item: any) {
    return item?.score ?? item?.vote_count ?? item?.votes ?? 0;
}

function formatDate(value: string) {
    if (!value) return 'vừa xong';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
}

export function PostDetailScreen({ postId, user, onBack, onLogout }: PostDetailScreenProps) {
    const [post, setPost] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadData = async () => {
        setLoading(true);
        setError('');

        try {
            const [postRes, commentsRes] = await Promise.all([
                getPostById(postId),
                getCommentsByPostId(postId),
            ]);

            setPost(postRes?.data || postRes);
            setComments(Array.isArray(commentsRes) ? commentsRes : commentsRes?.data || []);
        } catch (err: any) {
            setError(err?.message || 'Không tải được chi tiết bài viết');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postId]);

    const handleSendComment = async () => {
        if (!commentText.trim()) return;

        if (!isAuthenticated()) {
            alert('Vui lòng đăng nhập để bình luận');
            return;
        }

        setIsSubmitting(true);

        try {
            await createComment({
                post_id: postId,
                content: commentText.trim(),
                parent_comment_id: null,
            });
            setCommentText('');
            await loadData();
        } catch (err: any) {
            alert(err?.message || 'Gửi bình luận thất bại');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVotePost = async (voteType: 1 | -1) => {
        if (!isAuthenticated()) {
            alert('Vui lòng đăng nhập để vote');
            return;
        }

        try {
            await votePost(postId, voteType);
            await loadData();
        } catch (err: any) {
            alert(err?.message || 'Vote thất bại');
        }
    };

    const handleDeletePost = async () => {
        if (!window.confirm('Bạn có chắc muốn xóa bài viết này?')) return;

        try {
            await deletePost(postId);
            onBack();
        } catch (err: any) {
            alert(err?.message || 'Xóa bài viết thất bại');
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Đang tải...</div>;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center gap-4 px-4">
                <div className="text-red-400 text-center">{error}</div>
                <button onClick={onBack} className="px-4 py-2 rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors">Quay lại</button>
            </div>
        );
    }

    if (!post) {
        return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Bài viết không tồn tại</div>;
    }

    const canDeletePost = user?.id && post?.user_id && Number(user.id) === Number(post.user_id);

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-4 py-3 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <span className="text-white font-medium flex-1">Post Detail</span>
                    <button onClick={onLogout} className="text-gray-400 hover:text-[#FF4500] transition-colors" title="Logout">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-white text-sm">r/</span>
                        </div>
                        <span className="text-sm font-medium text-white">r/general</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-sm text-gray-400">u/{post.username || 'Anonymous'}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-sm text-gray-400">{formatDate(post.created_at)}</span>
                    </div>

                    <h1 className="text-white mb-4 text-2xl font-bold">{post.title}</h1>
                    <p className="text-gray-300 mb-4 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-[#0a0a0a] rounded-full px-3 py-2">
                                <button onClick={() => handleVotePost(1)} className={`hover:text-orange-500 transition-colors ${post.user_vote === 1 ? 'text-orange-500' : 'text-gray-400'}`}>
                                    <ArrowUp className="w-5 h-5" />
                                </button>
                                <span className="text-white font-medium min-w-[2rem] text-center">{getScore(post)}</span>
                                <button onClick={() => handleVotePost(-1)} className={`hover:text-blue-500 transition-colors ${post.user_vote === -1 ? 'text-blue-500' : 'text-gray-400'}`}>
                                    <ArrowDown className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex items-center gap-2 text-gray-400">
                                <MessageSquare className="w-5 h-5" />
                                <span>{comments.length} Comments</span>
                            </div>
                        </div>

                        {canDeletePost && (
                            <button onClick={handleDeletePost} className="text-gray-400 hover:text-red-400 transition-colors" title="Delete post">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

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
                        <button onClick={handleSendComment} disabled={isSubmitting || !commentText.trim()} className="text-gray-400 hover:text-white transition-colors disabled:opacity-50">
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>

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
                                currentUser={user}
                                onReload={loadData}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function DarkComment({
    comment,
    depth,
    postId,
    currentUser,
    onReload,
}: {
    comment: any;
    depth: number;
    postId: string;
    currentUser?: any;
    onReload: () => void;
}) {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const maxDepth = 8;
    const shouldIndent = depth < maxDepth;
    const username = comment.username || 'Anonymous';
    const avatarColors = ['bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-pink-600', 'bg-yellow-600'];
    const avatarColor = avatarColors[username.length % avatarColors.length];
    const canDeleteComment = currentUser?.id && comment?.user_id && Number(currentUser.id) === Number(comment.user_id);

    const handleReply = async () => {
        if (!replyText.trim()) return;

        if (!isAuthenticated()) {
            alert('Vui lòng đăng nhập để trả lời');
            return;
        }

        setSubmitting(true);

        try {
            await createComment({
                post_id: postId,
                content: replyText.trim(),
                parent_comment_id: comment.id,
            });
            setReplyText('');
            setShowReplyInput(false);
            await onReload();
        } catch (err: any) {
            alert(err?.message || 'Trả lời thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    const handleVoteComment = async (voteType: 1 | -1) => {
        if (!isAuthenticated()) {
            alert('Vui lòng đăng nhập để vote');
            return;
        }

        try {
            await voteComment(comment.id, voteType);
            await onReload();
        } catch (err: any) {
            alert(err?.message || 'Vote bình luận thất bại');
        }
    };

    const handleDeleteComment = async () => {
        if (!window.confirm('Bạn có chắc muốn xóa bình luận này?')) return;

        try {
            await deleteComment(comment.id);
            await onReload();
        } catch (err: any) {
            alert(err?.message || 'Xóa bình luận thất bại');
        }
    };

    return (
        <div className="relative">
            {depth > 0 && shouldIndent && <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-[#2a2a2a]" />}

            <div className={`${shouldIndent ? 'ml-8' : ''} relative py-3`}>
                <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-sm font-medium">{username.charAt(0).toUpperCase()}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white">u/{username}</span>
                            <span className="text-gray-600">•</span>
                            <span className="text-sm text-gray-400">{formatDate(comment.created_at)}</span>
                        </div>

                        <p className="text-gray-300 mb-2 leading-relaxed whitespace-pre-wrap">{comment.content}</p>

                        <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1">
                                <button onClick={() => handleVoteComment(1)} className="hover:bg-[#1a1a1a] hover:text-orange-500 p-1 rounded transition-colors text-gray-400">
                                    <ArrowUp className="w-4 h-4" />
                                </button>
                                <span className="font-medium min-w-[1.5rem] text-center text-white">{getScore(comment)}</span>
                                <button onClick={() => handleVoteComment(-1)} className="hover:bg-[#1a1a1a] hover:text-blue-500 p-1 rounded transition-colors text-gray-400">
                                    <ArrowDown className="w-4 h-4" />
                                </button>
                            </div>

                            <button onClick={() => setShowReplyInput(!showReplyInput)} className="flex items-center gap-1 hover:bg-[#1a1a1a] px-2 py-1 rounded transition-colors text-gray-400 hover:text-white">
                                <MessageSquare className="w-4 h-4" />
                                <span className="font-medium">Reply</span>
                            </button>

                            {canDeleteComment && (
                                <button onClick={handleDeleteComment} className="flex items-center gap-1 hover:bg-[#1a1a1a] px-2 py-1 rounded transition-colors text-gray-400 hover:text-red-400">
                                    <Trash2 className="w-4 h-4" />
                                    <span className="font-medium">Delete</span>
                                </button>
                            )}
                        </div>

                        {showReplyInput && (
                            <div className="mt-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-3">
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Write a reply..."
                                    className="w-full min-h-[70px] resize-none border-none outline-none bg-transparent text-white placeholder:text-gray-500"
                                />
                                <div className="flex gap-2 justify-end mt-2">
                                    <button onClick={() => setShowReplyInput(false)} className="px-4 py-1.5 rounded-full text-gray-400 hover:bg-[#1a1a1a] transition-colors">
                                        Cancel
                                    </button>
                                    <button onClick={handleReply} disabled={submitting || !replyText.trim()} className="bg-[#FF4500] text-white px-4 py-1.5 rounded-full hover:bg-[#ff5722] disabled:opacity-50 transition-colors">
                                        Reply
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {comment.replies && comment.replies.length > 0 && (
                    <div>
                        {comment.replies.map((reply: any) => (
                            <DarkComment
                                key={reply.id}
                                comment={reply}
                                depth={depth + 1}
                                postId={postId}
                                currentUser={currentUser}
                                onReload={onReload}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
