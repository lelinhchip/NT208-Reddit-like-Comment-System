import { Search, ArrowUp, ArrowDown, MessageSquare, Plus, LogOut, RefreshCw, Trash2, Edit } from 'lucide-react';
import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { getAllPosts, searchPosts, votePost, deletePost } from '../../api/postApi';
import { isAuthenticated } from '../../api/userApi';

interface PostListScreenProps {
    user?: any;
    onLogout: () => void;
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

export function PostListScreen({ user, onLogout, onPostClick, onCreatePostClick }: PostListScreenProps) {
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
            await loadPosts(page); // Tải lại trang sau khi xóa
        } catch (err: any) {
            alert(err?.message || 'Xóa bài viết thất bại');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-4 py-3 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search ThreadHub"
                            className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-full pl-10 pr-4 py-2 text-white placeholder:text-gray-500 focus:border-[#FF4500] focus:outline-none transition-colors"
                        />
                    </form>

                    <button
                        onClick={() => loadPosts(1)}
                        className="w-10 h-10 rounded-full bg-[#0a0a0a] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white hover:border-[#FF4500] transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>

                    <div className="hidden sm:block text-right">
                        <div className="text-white text-sm font-medium">u/{user?.username || 'User'}</div>
                        <button onClick={onLogout} className="text-xs text-gray-400 hover:text-[#FF4500] transition-colors inline-flex items-center gap-1">
                            <LogOut className="w-3 h-3" /> Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSort('new')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${sort === 'new' ? 'bg-[#FF4500] text-white' : 'bg-[#1a1a1a] text-gray-400 hover:text-white'}`}
                        >
                            New
                        </button>
                        <button
                            onClick={() => setSort('top')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${sort === 'top' ? 'bg-[#FF4500] text-white' : 'bg-[#1a1a1a] text-gray-400 hover:text-white'}`}
                        >
                            Top
                        </button>
                    </div>

                    <button onClick={() => onCreatePostClick()} className="hidden sm:inline-flex items-center gap-2 bg-[#FF4500] hover:bg-[#ff5722] text-white px-4 py-2 rounded-full font-medium transition-colors">
                        <Plus className="w-4 h-4" /> Create
                    </button>
                </div>

                {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mb-4">{error}</div>}

                {loading ? (
                    <div className="text-center text-gray-500 py-10">Đang tải...</div>
                ) : posts.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">Chưa có bài viết nào.</div>
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
                    <div className="flex items-center justify-center gap-3 mt-6">
                        <button
                            disabled={page <= 1 || loading}
                            onClick={() => loadPosts(page - 1)}
                            className="px-4 py-2 rounded-full bg-[#1a1a1a] text-gray-300 disabled:opacity-40 hover:text-white transition-colors"
                        >
                            Prev
                        </button>
                        <span className="text-gray-400 text-sm">Page {page}</span>
                        <button
                            disabled={loading || (pagination?.totalPages && page >= pagination.totalPages)}
                            onClick={() => loadPosts(page + 1)}
                            className="px-4 py-2 rounded-full bg-[#1a1a1a] text-gray-300 disabled:opacity-40 hover:text-white transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}

                <button
                    onClick={() => onCreatePostClick()}
                    className="sm:hidden fixed bottom-8 right-8 w-14 h-14 bg-[#FF4500] hover:bg-[#ff5722] rounded-full flex items-center justify-center shadow-lg transition-colors z-20"
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

    // Kiểm tra xem người đang đăng nhập có phải là tác giả không
    const isAuthor = user && (user.id === post.user_id || user.username === post.username);

    return (
        <div onClick={onClick} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 hover:border-[#3a3a3a] transition-colors cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-white text-xs">r/</span>
                    </div>
                    <span className="text-sm font-medium text-white">{post.community || 'r/general'}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-sm text-gray-400">u/{post.username || 'Anonymous'}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-sm text-gray-400">
                        {formatDate(post.created_at)}
                        {isEdited && <span className="ml-1 italic">(edited)</span>}
                    </span>
                </div>

                {/* Các nút Tùy chọn (Chỉ hiện cho Tác giả) */}
                {isAuthor && (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={onEdit}
                            className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-[#2a2a2a] rounded transition-colors"
                            title="Chỉnh sửa bài viết"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-[#2a2a2a] rounded transition-colors"
                            title="Xóa bài viết"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            <h3 className="text-white mb-2 text-lg font-semibold">{post.title}</h3>

            {/* Sử dụng Markdown và giới hạn chiều cao bằng line-clamp */}
            <div className="text-gray-300 text-sm mb-4 line-clamp-4 overflow-hidden prose prose-invert max-w-none prose-p:my-1 prose-a:text-blue-400 hover:prose-a:underline prose-img:rounded-md prose-img:max-h-32 prose-img:object-cover prose-pre:bg-[#0a0a0a] prose-pre:p-2 prose-pre:rounded prose-pre:border prose-pre:border-[#2a2a2a]">
                <Markdown>{post.content}</Markdown>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-[#0a0a0a] rounded-full px-3 py-1.5">
                    <button onClick={(e) => onVote(e, post.id, 1)} className={`hover:text-orange-500 transition-colors ${userVote === 1 ? 'text-orange-500' : 'text-gray-400'}`}>
                        <ArrowUp className="w-4 h-4" />
                    </button>
                    <span className="text-white text-sm font-medium min-w-[2rem] text-center">{getScore(post)}</span>
                    <button onClick={(e) => onVote(e, post.id, -1)} className={`hover:text-blue-500 transition-colors ${userVote === -1 ? 'text-blue-500' : 'text-gray-400'}`}>
                        <ArrowDown className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-2 text-gray-400 hover:bg-[#0a0a0a] px-3 py-1.5 rounded-full transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm font-medium">{getCommentCount(post)} Comments</span>
                </div>
            </div>
        </div>
    );
}