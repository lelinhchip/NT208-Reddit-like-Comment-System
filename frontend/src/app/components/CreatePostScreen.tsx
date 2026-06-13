import { ArrowLeft, Bold, Italic, Link as LinkIcon, Image, ChevronDown, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPost, getPostById, updatePost, uploadImage } from '../../api/postApi';

interface CreatePostScreenProps {
    onPost: (postId?: string | number) => void;
    onCancel: () => void;
    editPostId?: string | null;
}

export function CreatePostScreen({ onPost, onCancel, editPostId }: CreatePostScreenProps) {
    const [selectedCommunity, setSelectedCommunity] = useState('r/general');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!editPostId);
    const [uploadingImage, setUploadingImage] = useState(false);
    
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const communities = ['r/general', 'r/programming', 'r/technology', 'r/askreddit'];

    // Load Draft or Post Data
    useEffect(() => {
        if (editPostId) {
            const fetchPost = async () => {
                try {
                    const res = await getPostById(editPostId);
                    const post = res?.data || res;
                    setTitle(post.title || '');
                    setContent(post.content || '');
                    setSelectedCommunity(post.community || 'r/general');
                } catch (err: any) {
                    setError('Không thể tải bài viết');
                } finally {
                    setFetching(false);
                }
            };
            fetchPost();
        } else {
            const savedDraft = localStorage.getItem('reddit_draft');
            if (savedDraft) {
                try {
                    const parsed = JSON.parse(savedDraft);
                    setTitle(parsed.title || '');
                    setContent(parsed.content || '');
                } catch (e) {}
            }
            setFetching(false);
        }
    }, [editPostId]);

    // Save Draft
    useEffect(() => {
        if (!editPostId && !fetching) {
            localStorage.setItem('reddit_draft', JSON.stringify({ title, content }));
        }
    }, [title, content, editPostId, fetching]);

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
            let response;
            if (editPostId) {
                response = await updatePost(editPostId, { community: selectedCommunity, title: title.trim(), content: content.trim() });
            } else {
                response = await createPost({ community: selectedCommunity, title: title.trim(), content: content.trim() });
                localStorage.removeItem('reddit_draft');
            }
            onPost(response?.data?.id || response?.id || editPostId);
        } catch (err: any) {
            setError(err?.message || (editPostId ? 'Cập nhật thất bại' : 'Tạo bài viết thất bại'));
        } finally {
            setLoading(false);
        }
    };

    const insertMarkdown = (prefix: string, suffix: string) => {
        if (!textareaRef.current) return;
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        const newContent = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
        
        setContent(newContent);
        
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 0);
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        setUploadingImage(true);
        setError('');

        try {
            const response = await uploadImage(file);
            if (response?.url) {
                insertMarkdown(`![image](${response.url})`, '');
            }
        } catch (err: any) {
            setError(err?.message || 'Lỗi tải ảnh lên server');
        } finally {
            setUploadingImage(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-4 py-3 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <span className="text-white font-medium">{editPostId ? 'Edit Post' : 'Create Post'}</span>
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
                            <button onClick={() => insertMarkdown('**', '**')} className="p-2 rounded hover:bg-[#0a0a0a] text-gray-400 hover:text-white transition-colors" title="Bold" type="button">
                                <Bold className="w-5 h-5" />
                            </button>
                            <button onClick={() => insertMarkdown('*', '*')} className="p-2 rounded hover:bg-[#0a0a0a] text-gray-400 hover:text-white transition-colors" title="Italic" type="button">
                                <Italic className="w-5 h-5" />
                            </button>
                            <button onClick={() => insertMarkdown('[', '](url)')} className="p-2 rounded hover:bg-[#0a0a0a] text-gray-400 hover:text-white transition-colors" title="Link" type="button">
                                <LinkIcon className="w-5 h-5" />
                            </button>
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputRef} 
                                className="hidden" 
                                onChange={handleImageUpload} 
                            />
                            <button onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} className="p-2 rounded hover:bg-[#0a0a0a] text-gray-400 hover:text-white transition-colors disabled:opacity-50" title="Upload Image" type="button">
                                {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Image className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Text"
                            rows={12}
                            maxLength={10000}
                            className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-[#FF4500] focus:outline-none transition-colors resize-none font-mono"
                        />
                        <div className="text-right text-xs text-gray-500 mt-1">{content.length}/10000</div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <button onClick={onCancel} className="px-6 py-2.5 rounded-full text-gray-400 hover:bg-[#0a0a0a] transition-colors font-medium">
                            Cancel
                        </button>
                        <button
                            onClick={handleCreatePost}
                            disabled={loading || fetching}
                            className="px-6 py-2.5 rounded-full bg-[#FF4500] hover:bg-[#ff5722] disabled:opacity-60 disabled:cursor-not-allowed text-white transition-colors font-medium"
                        >
                            {loading ? (editPostId ? 'Saving...' : 'Posting...') : (editPostId ? 'Save' : 'Post')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
