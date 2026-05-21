import { Search, ArrowUp, ArrowDown, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAllPosts } from '../../api/postApi';

interface PostListScreenProps {
    onPostClick: (postId: string) => void;
}

export function PostListScreen({ onPostClick }: PostListScreenProps) {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await getAllPosts();
                // SỬA Ở ĐÂY: Trích xuất đúng mảng 'posts' theo tài liệu API của bạn
                setPosts(response.posts || response.data || []);
            } catch (error) {
                console.error("Lỗi lấy danh sách bài viết:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Top Bar */}
            <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-4 py-3 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search ThreadHub"
                            className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-full pl-10 pr-4 py-2 text-white placeholder:text-gray-500 focus:border-[#4a4a4a] focus:outline-none transition-colors"
                        />
                    </div>

                    {/* User Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center cursor-pointer">
                        <span className="text-white font-medium">U</span>
                    </div>
                </div>
            </div>

            {/* Post Feed */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="text-center text-gray-500 py-10">Đang tải...</div>
                ) : posts.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">
                        Chưa có bài viết nào.
                        {/* Bạn có thể thêm nút "Tạo bài viết mới" ở đây để người dùng dễ thao tác */}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} onClick={() => onPostClick(post.id.toString())} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function PostCard({ post, onClick }: { post: any; onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 hover:border-[#3a3a3a] transition-colors cursor-pointer"
        >
            <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-xs">r/</span>
                </div>
                <span className="text-sm font-medium text-white">r/general</span>
                <span className="text-gray-600">•</span>
                <span className="text-sm text-gray-400">u/{post.username || 'Anonymous'}</span>
                <span className="text-gray-600">•</span>
                <span className="text-sm text-gray-400">{new Date(post.created_at).toLocaleDateString()}</span>
            </div>

            <h3 className="text-white mb-2">{post.title}</h3>
            <p className="text-gray-400 text-sm line-clamp-2 mb-3">{post.content}</p>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-[#0a0a0a] rounded-full px-3 py-1.5">
                    <button className="hover:text-orange-500 text-gray-400 transition-colors">
                        <ArrowUp className="w-4 h-4" />
                    </button>
                    <span className="text-white text-sm font-medium min-w-[2rem] text-center">{post.vote_count || 0}</span>
                    <button className="hover:text-blue-500 text-gray-400 transition-colors">
                        <ArrowDown className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-2 text-gray-400 hover:bg-[#0a0a0a] px-3 py-1.5 rounded-full transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm font-medium">Bình luận</span>
                </div>
            </div>
        </div>
    );
}