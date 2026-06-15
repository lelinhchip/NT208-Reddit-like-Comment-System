import { Search, ArrowUp, ArrowDown, MessageSquare, Plus, LogOut, RefreshCw, Trash2, Edit, Users, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { getAllPosts, searchPosts, votePost, deletePost } from '../../api/postApi';
import { isAuthenticated } from '../../api/userApi';

interface PostListScreenProps {
    user?: any;
    onLogout: () => void;
    onLoginClick: () => void;
    onPostClick: (postId: string | number) => void;
    onCreatePostClick: (editPostId?: string | number) => void;
}

function getScore(post: any) {
    return post?.score ?? post?.vote_count ?? post?.votes ?? 0;
}

function getCommentCount(post: any) {
    return post?.comment_count ?? post?.comments_count ?? post?.comments?.length ?? 0;
}

function formatDate(value: string) {
    if (!value) return 'vừa xong';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
}

export function PostListScreen({ user, onLogout, onLoginClick, onPostClick, onCreatePostClick }: PostListScreenProps) {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState<'new' | 'top'>('new');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);

    const loadPosts = async (nextPage = page) => {
        setLoading(true);
        setError('');

        try {
            const response = query.trim()
                ? await searchPosts(query.trim(), { page: nextPage, limit: 10 })
                : await getAllPosts({ page: nextPage, limit: 10, sort });

            setPosts(response?.data || []);
            setPagination(response?.pagination || null);
            setPage(nextPage);
        } catch (err: any) {
            setError(err?.message || 'Không tải được danh sách bài viết');
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sort]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadPosts(1);
    };

    const handleVote = async (e: React.MouseEvent, postId: string | number, voteType: 1 | -1) => {
        e.stopPropagation();

        if (!isAuthenticated()) {
            alert('Vui lòng đăng nhập để vote');
            onLoginClick();
            return;
        }

        try {
            await votePost(postId, voteType);
            await loadPosts(page);
        } catch (err: any) {
            alert(err?.message || 'Vote thất bại');
        }
    };

    const handleDelete = async (e: React.MouseEvent, postId: string | number) => {
        e.stopPropagation();
        if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;

        try {
            await deletePost(postId);
            await loadPosts(page);
        } catch (err: any) {
            alert(err?.message || 'Xóa bài viết thất bại');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Header */}
            <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-4 py-3 sticky top-0 z-20">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search ThreadHub"
                            className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-full pl-10 pr-4 py-2.5 text-white placeholder:text-gray-500 focus:border-[#FF4500] focus:outline-none transition-colors"
                        />
                    </form>

                    <button
                        onClick={() => loadPosts(1)}
                        className="w-10 h-10 rounded-full bg-[#0a0a0a] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white hover:border-[#FF4500] transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>

                    <div className="hidden sm:block text-right min-w-[120px]">
                        {user && user.username ? (
                            <>
                                <div className="text-white text-sm font-medium truncate">u/{user.username}</div>
                                <button onClick={onLogout} className="text-xs text-gray-400 hover:text-[#FF4500] transition-colors inline-flex items-center gap-1 mt-0.5">
                                    <LogOut className="w-3 h-3" /> Logout
                                </button>
                            </>
                        ) : (
                            <button onClick={onLoginClick} className="bg-[#FF4500] hover:bg-[#ff5722] text-white px-5 py-2 rounded-full text-sm font-medium transition-colors w-full">
                                Đăng nhập
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                {!query && (
                    <div className="bg-gradient-to-br from-[#FF4500] to-[#ff8750] rounded-2xl p-8 mb-8 relative overflow-hidden shadow-lg shadow-orange-900/20">
                        <div className="relative z-10">
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Welcome to ThreadHub</h1>
                            <p className="text-orange-50 text-base sm:text-lg max-w-xl mb-6 opacity-90 leading-relaxed">
                                Nơi hội tụ cộng đồng, khám phá các chủ đề thú vị và chia sẻ góc nhìn của bạn với hàng ngàn người dùng khác.
                            </p>
                            <div className="flex items-center gap-6 text-white/90 text-sm font-medium">
                                <span className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                    <Users className="w-4 h-4" /> 1.2M Members
                                </span>
                                <span className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                    <Activity className="w-4 h-4" /> Top 1% Ranked
                                </span>
                            </div>
                        </div>
                        <div className="absolute right-0 top-0 w-64 h-full opacity-10 pointer-events-none flex items-center justify-center transform translate-x-8">
                            <MessageSquare className="w-64 h-64 text-white -rotate-12" />
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 bg-[#1a1a1a] p-1 rounded-full border border-[#2a2a2a]">
                        <button
                            onClick={() => setSort('new')}
                            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${sort === 'new' ? 'bg-[#2a2a2a] text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            New
                        </button>
                        <button
                            onClick={() => setSort('top')}
                            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${sort === 'top' ? 'bg-[#2a2a2a] text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            Top
                        </button>
                    </div>

                    <button onClick={() => onCreatePostClick()} className="hidden sm:inline-flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-5 py-2 rounded-full font-semibold transition-colors">
                        <Plus className="w-5 h-5" /> Tạo bài viết
                    </button>
                </div>

                {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6 flex items-center gap-2">⚠️ {error}</div>}

                {loading ? (
                    <div className="text-center text-gray-500 py-20 flex flex-col items-center gap-3">
                        <RefreshCw className="w-8 h-8 animate-spin text-[#FF4500]" />
                        <p>Đang tải dòng thời gian...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center text-gray-400 py-20 bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a]">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-lg font-medium">Chưa có bài viết nào.</p>
                        <p className="text-sm opacity-60">Hãy là người đầu tiên tạo chủ đề mới!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                user={user}
                                onClick={() => onPostClick(post.id)}
                                onEdit={(e) => { e.stopPropagation(); onCreatePostClick(post.id); }}
                                onDelete={(e) => handleDelete(e, post.id)}
                                onVote={handleVote}
                            />
                        ))}
                    </div>
                )}

                {pagination && (
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <button
                            disabled={page <= 1 || loading}
                            onClick={() => loadPosts(page - 1)}
                            className="px-5 py-2 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 disabled:opacity-40 hover:text-white hover:border-gray-500 transition-colors font-medium"
                        >
                            Trước
                        </button>
                        <span className="text-gray-400 text-sm font-medium">Trang {page}</span>
                        <button
                            disabled={loading || (pagination?.totalPages && page >= pagination.totalPages)}
                            onClick={() => loadPosts(page + 1)}
                            className="px-5 py-2 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 disabled:opacity-40 hover:text-white hover:border-gray-500 transition-colors font-medium"
                        >
                            Tiếp
                        </button>
                    </div>
                )}

                <button
                    onClick={() => onCreatePostClick()}
                    className="sm:hidden fixed bottom-8 right-8 w-14 h-14 bg-[#FF4500] hover:bg-[#ff5722] rounded-full flex items-center justify-center shadow-[0_4px_14px_0_rgba(255,69,0,0.39)] transition-transform active:scale-95 z-20"
                    title="Create Post"
                >
                    <Plus className="w-6 h-6 text-white" />
                </button>
            </div>
        </div>
    );
}

function PostCard({
    post,
    user,
    onClick,
    onEdit,
    onDelete,
    onVote
}: {
    post: any;
    user: any;
    onClick: () => void;
    onEdit: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
    onVote: (e: React.MouseEvent, postId: string | number, voteType: 1 | -1) => void;
}) {
    const userVote = post?.user_vote;
    const isEdited = new Date(post.updated_at).getTime() > new Date(post.created_at).getTime() + 2000;

    const isAuthor = user && user.id && (user.id === post.user_id || user.username === post.username);

    return (
        <div onClick={onClick} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#4a4a4a] transition-colors cursor-pointer group shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-inner">
                        <span className="text-white text-xs font-bold">r/</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{post.community || 'r/general'}</span>
                    <span className="text-gray-600 text-xs">•</span>
                    <span className="text-sm text-gray-400">u/{post.username || 'Anonymous'}</span>
                    <span className="text-gray-600 text-xs">•</span>
                    <span className="text-sm text-gray-400 hover:underline">
                        {formatDate(post.created_at)}
                        {isEdited && <span className="ml-1 italic opacity-70">(đã sửa)</span>}
                    </span>
                </div>

                {isAuthor && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={onEdit}
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-[#2a2a2a] rounded-full transition-colors"
                            title="Chỉnh sửa bài viết"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                            title="Xóa bài viết"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            <h3 className="text-white mb-2 text-[1.15rem] font-bold leading-snug">{post.title}</h3>

            <div className="text-gray-300 text-sm mb-5 line-clamp-4 overflow-hidden prose prose-invert max-w-none prose-p:my-1 prose-a:text-blue-400 hover:prose-a:underline prose-img:rounded-lg prose-img:max-h-40 prose-img:object-cover prose-pre:bg-[#0a0a0a] prose-pre:p-3 prose-pre:rounded-lg prose-pre:border prose-pre:border-[#2a2a2a]">
                <Markdown>{post.content}</Markdown>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-[#272729] rounded-full px-1 py-1">
                    <button
                        onClick={(e) => onVote(e, post.id, 1)}
                        className={`p-1.5 rounded-full hover:bg-black/20 transition-colors ${userVote === 1 ? 'text-[#FF4500]' : 'text-gray-400 hover:text-[#FF4500]'}`}
                    >
                        <ArrowUp className="w-5 h-5" />
                    </button>
                    <span className={`text-sm font-bold min-w-[1.5rem] text-center ${userVote === 1 ? 'text-[#FF4500]' : userVote === -1 ? 'text-[#7193ff]' : 'text-white'}`}>
                        {getScore(post)}
                    </span>
                    <button
                        onClick={(e) => onVote(e, post.id, -1)}
                        className={`p-1.5 rounded-full hover:bg-black/20 transition-colors ${userVote === -1 ? 'text-[#7193ff]' : 'text-gray-400 hover:text-[#7193ff]'}`}
                    >
                        <ArrowDown className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center gap-2 text-gray-400 bg-[#272729] hover:bg-[#323234] px-4 py-2 rounded-full transition-colors font-medium text-sm">
                    <MessageSquare className="w-4 h-4" />
                    <span>{getCommentCount(post)} Comments</span>
                </div>
            </div>
        </div>
    );
}