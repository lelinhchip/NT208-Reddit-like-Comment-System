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
            {/* ... Giữ nguyên phần Header (Top Bar) như code trước ... */}

            {/* Post Feed */}
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
                {loading ? (
                    <div className="text-center text-gray-500 py-10">Đang tải bài viết...</div>
                ) : posts.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">Chưa có bài viết nào.</div>
                ) : (
                    posts.map((post) => (
                        <PostCard key={post.id} post={post} onClick={() => onPostClick(post.id.toString())} />
                    ))
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