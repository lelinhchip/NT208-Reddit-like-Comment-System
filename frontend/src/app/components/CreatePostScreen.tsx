import { ArrowLeft, Bold, Italic, Link as LinkIcon, Image, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { createPost } from '../../api/postApi';

interface CreatePostScreenProps {
    onPost: (postId?: string | number) => void;
    onCancel: () => void;
}

export function CreatePostScreen({ onPost, onCancel }: CreatePostScreenProps) {
    const [selectedCommunity, setSelectedCommunity] = useState('r/general');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const communities = ['r/general', 'r/programming', 'r/technology', 'r/askreddit'];

    const handleCreatePost = async () => {
        if (!title.trim()) {
            setError('Tiêu đề không được để trống');
            return;
        }

        if (!content.trim()) {
            setError('Nội dung không được để trống');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await createPost({ title: title.trim(), content: content.trim() });
            onPost(response?.data?.id || response?.id);
        } catch (err: any) {
            setError(err?.message || 'Tạo bài viết thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-4 py-3 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <span className="text-white font-medium">Create Post</span>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
                    {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mb-4">{error}</div>}

                    <div className="mb-6">
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white hover:border-[#4a4a4a] transition-colors"
                            >
                                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                                    <span className="text-white text-xs">r/</span>
                                </div>
                                <span>{selectedCommunity}</span>
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute top-full mt-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-lg overflow-hidden z-20 min-w-[220px]">
                                    {communities.map((community) => (
                                        <button
                                            key={community}
                                            onClick={() => {
                                                setSelectedCommunity(community);
                                                setIsDropdownOpen(false);
                                            }}
                                            className="block w-full text-left px-4 py-3 text-white hover:bg-[#0a0a0a] transition-colors"
                                        >
                                            {community}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-4">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Title"
                            maxLength={300}
                            className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white text-lg placeholder:text-gray-500 focus:border-[#FF4500] focus:outline-none transition-colors"
                        />
                        <div className="text-right text-xs text-gray-500 mt-1">{title.length}/300</div>
                    </div>

                    <div className="mb-2">
                        <div className="flex items-center gap-2 pb-2">
                            <button className="p-2 rounded hover:bg-[#0a0a0a] text-gray-400 hover:text-white transition-colors" title="Bold" type="button">
                                <Bold className="w-5 h-5" />
                            </button>
                            <button className="p-2 rounded hover:bg-[#0a0a0a] text-gray-400 hover:text-white transition-colors" title="Italic" type="button">
                                <Italic className="w-5 h-5" />
                            </button>
                            <button className="p-2 rounded hover:bg-[#0a0a0a] text-gray-400 hover:text-white transition-colors" title="Link" type="button">
                                <LinkIcon className="w-5 h-5" />
                            </button>
                            <button className="p-2 rounded hover:bg-[#0a0a0a] text-gray-400 hover:text-white transition-colors" title="Image" type="button">
                                <Image className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Text"
                            rows={12}
                            maxLength={10000}
                            className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-[#FF4500] focus:outline-none transition-colors resize-none"
                        />
                        <div className="text-right text-xs text-gray-500 mt-1">{content.length}/10000</div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <button onClick={onCancel} className="px-6 py-2.5 rounded-full text-gray-400 hover:bg-[#0a0a0a] transition-colors font-medium">
                            Cancel
                        </button>
                        <button
                            onClick={handleCreatePost}
                            disabled={loading}
                            className="px-6 py-2.5 rounded-full bg-[#FF4500] hover:bg-[#ff5722] disabled:opacity-60 disabled:cursor-not-allowed text-white transition-colors font-medium"
                        >
                            {loading ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
