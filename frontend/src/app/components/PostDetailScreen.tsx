import { ArrowLeft, ArrowUp, ArrowDown, MessageSquare, Send, LogOut, Edit, Trash2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { useEffect, useState } from 'react';
import { getPostById, votePost, deletePost } from '../../api/postApi';
import { getCommentsByPostId, createComment, voteComment } from '../../api/commentApi';
import { isAuthenticated } from '../../api/userApi';

interface PostDetailScreenProps {
    postId: string;
    user?: any;
    onBack: () => void;
    onLogout?: () => void;
    onEditPost?: () => void;
    onDeletePost?: () => void; // Hàm để quay lại màn hình list sau khi xóa
}

function unwrapResponse(response: any) {
    return response?.data ?? response;
}

function unwrapPost(response: any) {
    const payload = unwrapResponse(response);
    return payload?.post ?? payload?.data ?? payload;
}

function unwrapComments(response: any): any[] {
    const payload = unwrapResponse(response);
    const comments = payload?.comments ?? payload?.data ?? payload;
    return Array.isArray(comments) ? comments : [];
}

function getScore(item: any) {
    return Number(item?.vote_count ?? item?.score ?? item?.votes ?? 0);
}

function getUserVote(item: any) {
    return Number(item?.user_vote ?? item?.userVote ?? 0);
}

function formatDate(value: string) {
    if (!value) return 'vừa xong';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
}

function countAllComments(comments: any[]): number {
    let total = 0;

    const traverse = (nodes: any[]) => {
        nodes.forEach((comment) => {
            total += 1;
            if (Array.isArray(comment.replies) && comment.replies.length > 0) {
                traverse(comment.replies);
            }
        });
    };

    traverse(comments);
    return total;
}

const ROOT_COMMENTS_PER_PAGE = 15;
const REPLIES_PER_PAGE = 5;

export function PostDetailScreen({ postId, user, onBack, onLogout, onEditPost, onDeletePost }: PostDetailScreenProps) {
    const [post, setPost] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [votingPost, setVotingPost] = useState(false);
    const [commentSort, setCommentSort] = useState<'new' | 'top'>('new');

    const [visiblePage, setVisiblePage] = useState(1);

    const loadData = async () => {
        setError('');

        try {
            const [postRes, commentsRes] = await Promise.all([
                getPostById(postId),
                getCommentsByPostId(postId, commentSort),
            ]);

            setPost(unwrapPost(postRes));
            setComments(unwrapComments(commentsRes));
            setVisiblePage(1);
        } catch (err: any) {
            console.error('Lỗi lấy chi tiết bài viết:', err);
            setError(err?.message || 'Không tải được chi tiết bài viết');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        void loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postId, commentSort]);

    const requireLogin = (message: string) => {
        if (isAuthenticated()) return true;
        alert(message);
        return false;
    };

    const handleSendComment = async () => {
        if (!commentText.trim()) return;
        if (!requireLogin('Vui lòng đăng nhập để bình luận')) return;

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
            console.error('Lỗi gửi bình luận:', err);
            alert(err?.message || 'Gửi bình luận thất bại');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVotePost = async (voteType: 1 | -1) => {
        if (!requireLogin('Vui lòng đăng nhập để vote')) return;
        if (votingPost) return;

        setVotingPost(true);

        try {
            await votePost(postId, voteType);
            await loadData();
        } catch (err: any) {
            console.error('Lỗi vote post:', err);
            alert(err?.message || 'Vote bài viết thất bại');
        } finally {
            setVotingPost(false);
        }
    };

    // Hàm xử lý Xóa bài viết
    const handleDeletePost = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;

        try {
            await deletePost(postId);
            // Sau khi xóa, quay trở về trang list
            if (onDeletePost) {
                onDeletePost();
            } else {
                onBack();
            }
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
                <button onClick={onBack} className="px-4 py-2 rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors">
                    Quay lại
                </button>
            </div>
        );
    }

    if (!post) {
        return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Bài viết không tồn tại</div>;
    }

    const postUserVote = getUserVote(post);
    const totalComments = Number(post?.comment_count ?? post?.commentCount ?? countAllComments(comments));
    const isAuthor = user && (user.id === post.user_id || user.username === post.username);
    const isEdited = new Date(post.updated_at).getTime() > new Date(post.created_at).getTime() + 2000;

    const visibleComments = comments.slice(0, visiblePage * ROOT_COMMENTS_PER_PAGE);
    const hasMoreComments = visibleComments.length < comments.length;

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-4 py-3 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <span className="text-white font-medium flex-1">Post Detail</span>
                    {onLogout && (
                        <button onClick={onLogout} className="text-gray-400 hover:text-[#FF4500] transition-colors" title="Logout">
                            <LogOut className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-white text-sm font-bold">r/</span>
                        </div>
                        <span className="text-white font-medium">{post.community || 'r/general'}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-sm text-gray-400">u/{post.username || 'Anonymous'}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-sm text-gray-400">
                            {formatDate(post.created_at)}
                            {isEdited && <span className="ml-1 italic">(edited)</span>}
                        </span>
                    </div>

                    <h1 className="text-white mb-4 text-2xl font-bold">{post.title}</h1>
                    <div className="text-gray-300 mb-4 leading-relaxed overflow-hidden prose prose-invert max-w-none prose-p:my-2 prose-a:text-blue-400 hover:prose-a:underline prose-img:rounded-lg prose-img:max-w-full prose-img:max-h-[500px] prose-img:object-contain prose-pre:bg-[#0a0a0a] prose-pre:border prose-pre:border-[#2a2a2a]">
                        <Markdown>{post.content}</Markdown>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-[#0a0a0a] rounded-full px-3 py-2">
                            <button
                                type="button"
                                onClick={() => handleVotePost(1)}
                                disabled={votingPost}
                                className={`hover:text-orange-500 transition-colors disabled:opacity-50 ${postUserVote === 1 ? 'text-orange-500' : 'text-gray-400'}`}
                            >
                                <ArrowUp className="w-5 h-5" />
                            </button>
                            <span className="text-white font-medium min-w-[2rem] text-center">{getScore(post)}</span>
                            <button
                                type="button"
                                onClick={() => handleVotePost(-1)}
                                disabled={votingPost}
                                className={`hover:text-blue-500 transition-colors disabled:opacity-50 ${postUserVote === -1 ? 'text-blue-500' : 'text-gray-400'}`}
                            >
                                <ArrowDown className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 text-gray-400">
                            <MessageSquare className="w-5 h-5" />
                            <span>{totalComments} Comments</span>
                        </div>

                        {/* Nút Sửa & Xóa dành cho Author */}
                        {isAuthor && (
                            <div className="flex items-center gap-2 ml-auto">
                                {onEditPost && (
                                    <button onClick={onEditPost} className="flex items-center gap-2 text-gray-400 hover:text-blue-400 hover:bg-[#0a0a0a] px-3 py-1.5 rounded-full transition-colors" title="Chỉnh sửa bài viết">
                                        <Edit className="w-5 h-5" />
                                        <span className="font-medium hidden sm:inline">Edit</span>
                                    </button>
                                )}
                                <button onClick={handleDeletePost} className="flex items-center gap-2 text-gray-400 hover:text-red-500 hover:bg-[#0a0a0a] px-3 py-1.5 rounded-full transition-colors" title="Xóa bài viết">
                                    <Trash2 className="w-5 h-5" />
                                    <span className="font-medium hidden sm:inline">Delete</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 mb-6">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(event) => setCommentText(event.target.value)}
                            onKeyDown={(event) => event.key === 'Enter' && handleSendComment()}
                            placeholder="Thêm bình luận..."
                            className="flex-1 bg-transparent text-white placeholder:text-gray-500 focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={handleSendComment}
                            disabled={isSubmitting || !commentText.trim()}
                            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4 border-b border-[#2a2a2a] pb-2">
                    <span className="text-white font-medium">Bình luận ({totalComments})</span>
                    <select
                        value={commentSort}
                        onChange={(e) => setCommentSort(e.target.value as 'new' | 'top')}
                        className="bg-[#1a1a1a] text-white border border-[#2a2a2a] rounded px-3 py-1.5 focus:outline-none focus:border-gray-500 transition-colors"
                    >
                        <option value="new">Mới nhất</option>
                        <option value="top">Top (Nhiều Vote)</option>
                    </select>
                </div>

                <div className="space-y-0">
                    {comments.length === 0 ? (
                        <div className="text-gray-500 text-center py-4">Chưa có bình luận nào.</div>
                    ) : (
                        visibleComments.map((comment) => (
                            <DarkComment
                                key={comment.id}
                                comment={comment}
                                depth={0}
                                postId={postId}
                                onReload={loadData}
                            />
                        ))
                    )}

                    {hasMoreComments && (
                        <div className="py-6 flex justify-center">
                            <button
                                onClick={() => setVisiblePage(prev => prev + 1)}
                                className="px-6 py-2.5 bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] text-gray-300 hover:text-white rounded-full font-medium transition-colors"
                            >
                                Xem thêm bình luận ({comments.length - visibleComments.length} bình luận nữa)
                            </button>
                        </div>
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
    onReload,
}: {
    comment: any;
    depth: number;
    postId: string;
    onReload: () => Promise<void> | void;
}) {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVoting, setIsVoting] = useState(false);

    const [visibleRepliesCount, setVisibleRepliesCount] = useState(REPLIES_PER_PAGE);

    const maxDepth = 8;
    const shouldIndent = depth < maxDepth;
    const username = comment.username || 'Anonymous';
    const avatarColors = ['bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-pink-600', 'bg-yellow-600'];
    const avatarColor = avatarColors[username.length % avatarColors.length];
    const userVote = getUserVote(comment);

    const requireLogin = (message: string) => {
        if (isAuthenticated()) return true;
        alert(message);
        return false;
    };

    const handleReply = async () => {
        if (!replyText.trim()) return;
        if (!requireLogin('Vui lòng đăng nhập để trả lời')) return;

        setIsSubmitting(true);

        try {
            await createComment({
                post_id: postId,
                content: replyText.trim(),
                parent_comment_id: comment.id,
            });

            setReplyText('');
            setShowReplyInput(false);
            setVisibleRepliesCount(prev => prev + 1);
            await onReload();
        } catch (err: any) {
            console.error('Lỗi trả lời bình luận:', err);
            alert(err?.message || 'Trả lời thất bại');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVoteComment = async (voteType: 1 | -1) => {
        if (!requireLogin('Vui lòng đăng nhập để vote bình luận')) return;
        if (isVoting) return;

        setIsVoting(true);

        try {
            await voteComment(comment.id, voteType);
            await onReload();
        } catch (err: any) {
            console.error('Lỗi vote bình luận:', err);
            alert(err?.message || 'Vote bình luận thất bại');
        } finally {
            setIsVoting(false);
        }
    };

    const hasReplies = Array.isArray(comment.replies) && comment.replies.length > 0;
    const visibleReplies = hasReplies ? comment.replies.slice(0, visibleRepliesCount) : [];
    const hasMoreReplies = hasReplies && comment.replies.length > visibleRepliesCount;

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

                        <div className="text-gray-300 mb-2 leading-relaxed overflow-hidden prose prose-invert max-w-none prose-sm prose-p:my-1 prose-a:text-blue-400 hover:prose-a:underline prose-img:rounded-md prose-img:max-h-64 prose-img:object-contain prose-pre:bg-[#0a0a0a] prose-pre:border prose-pre:border-[#2a2a2a]">
                            <Markdown>{comment.content}</Markdown>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => handleVoteComment(1)}
                                    disabled={isVoting}
                                    className={`hover:bg-[#1a1a1a] hover:text-orange-500 p-1 rounded transition-colors disabled:opacity-50 ${userVote === 1 ? 'text-orange-500' : 'text-gray-400'}`}
                                >
                                    <ArrowUp className="w-4 h-4" />
                                </button>
                                <span className="font-medium min-w-[1.5rem] text-center text-white">{getScore(comment)}</span>
                                <button
                                    type="button"
                                    onClick={() => handleVoteComment(-1)}
                                    disabled={isVoting}
                                    className={`hover:bg-[#1a1a1a] hover:text-blue-500 p-1 rounded transition-colors disabled:opacity-50 ${userVote === -1 ? 'text-blue-500' : 'text-gray-400'}`}
                                >
                                    <ArrowDown className="w-4 h-4" />
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowReplyInput(!showReplyInput)}
                                className="flex items-center gap-1 hover:bg-[#1a1a1a] px-2 py-1 rounded transition-colors text-gray-400 hover:text-white"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span className="font-medium">Reply</span>
                            </button>
                        </div>

                        {showReplyInput && (
                            <div className="mt-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-3">
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={(event) => setReplyText(event.target.value)}
                                    onKeyDown={(event) => event.key === 'Enter' && handleReply()}
                                    placeholder={`Trả lời u/${username}...`}
                                    className="w-full bg-transparent text-white placeholder:text-gray-500 focus:outline-none mb-2"
                                />
                                <div className="flex gap-2 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowReplyInput(false)}
                                        className="px-4 py-1.5 rounded-full text-gray-400 hover:bg-[#1a1a1a] transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="button"
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

                {hasReplies && (
                    <div className="mt-2">
                        {visibleReplies.map((reply: any) => (
                            <DarkComment
                                key={reply.id}
                                comment={reply}
                                depth={depth + 1}
                                postId={postId}
                                onReload={onReload}
                            />
                        ))}

                        {hasMoreReplies && (
                            <button
                                onClick={() => setVisibleRepliesCount(prev => prev + 10)}
                                className="flex items-center gap-2 mt-2 mb-1 ml-4 text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors"
                            >
                                <div className="w-6 h-px bg-[#2a2a2a] inline-block" />
                                Xem thêm {comment.replies.length - visibleRepliesCount} phản hồi
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}