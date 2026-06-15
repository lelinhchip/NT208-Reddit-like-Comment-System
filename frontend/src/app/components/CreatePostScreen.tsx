import { ArrowLeft, Bold, Italic, Link as LinkIcon, Image, ChevronDown, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPost, getPostById, updatePost, uploadImage } from '../../api/postApi';

interface CreatePostScreenProps {
    onPost: (postId?: string | number) => void;
    onCancel: () => void;
    editPostId?: string | null;
}

// Chuyển đổi dữ liệu Markdown từ Server thành HTML để hiển thị trực quan trong Editor
function markdownToHtml(md: string): string {
    if (!md) return '';
    let html = md;

    // Thay thế ảnh: ![alt](url) -> <img src="url" />
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" />');

    // Thay thế liên kết: [text](url) -> <a href="url">text</a>
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Thay thế chữ in đậm: **text** hoặc __text__ -> <strong>text</strong>
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Thay thế chữ in nghiêng: *text* hoặc _text_ -> <em>text</em>
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // Thay thế các dấu xuống dòng bằng thẻ <br /> để hiển thị đúng hàng
    html = html.replace(/\n/g, '<br />');

    return html;
}

// Chuyển đổi cấu trúc HTML từ Editor về lại định dạng Markdown gọn sạch trước khi lưu lên Server
function htmlToMarkdown(html: string): string {
    if (!html) return '';
    let md = html;

    // Xử lý các khối xuống dòng từ thẻ div/p/br của trình duyệt
    md = md.replace(/<div[^>]*>(.*?)<\/div>/gi, '$1\n');
    md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n');
    md = md.replace(/<br\s*\/?>/gi, '\n');

    // Chuyển đổi thẻ in đậm về **
    md = md.replace(/<(strong|b)[^>]*>(.*?)<\/\1>/gi, '**$2**');

    // Chuyển đổi thẻ in nghiêng về *
    md = md.replace(/<(em|i)[^>]*>(.*?)<\/\1>/gi, '*$2*');

    // Chuyển đổi thẻ img về ![image](url)
    md = md.replace(/<img[^>]+src="([^">]+)"[^>]*>/gi, '![image]($1)');

    // Chuyển đổi thẻ a về [text](url)
    md = md.replace(/<a[^>]+href="([^">]+)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

    // Loại bỏ toàn bộ các thẻ HTML rác còn lại
    md = md.replace(/<[^>]+>/g, '');

    // Giải mã các ký tự HTML đặc biệt để chuỗi markdown chuẩn xác nhất
    md = md.replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ');

    return md.trim();
}

export function CreatePostScreen({ onPost, onCancel, editPostId }: CreatePostScreenProps) {
    const [selectedCommunity, setSelectedCommunity] = useState('r/general');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!editPostId);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [contentLength, setContentLength] = useState(0);

    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const communities = ['r/general', 'r/programming', 'r/technology', 'r/askreddit'];

    // Khởi tạo dữ liệu ban đầu (Bài viết cũ khi Edit hoặc Bản nháp tự động lưu)
    useEffect(() => {
        const initializeContent = async () => {
            if (editPostId) {
                try {
                    const res = await getPostById(editPostId);
                    const post = res?.data || res;
                    setTitle(post.title || '');
                    setSelectedCommunity(post.community || 'r/general');
                    if (editorRef.current) {
                        editorRef.current.innerHTML = markdownToHtml(post.content || '');
                        setContentLength((editorRef.current.innerText || '').length);
                    }
                } catch (err: any) {
                    setError('Không thể tải bài viết');
                } finally {
                    setFetching(false);
                }
            } else {
                const savedDraft = localStorage.getItem('reddit_draft');
                if (savedDraft) {
                    try {
                        const parsed = JSON.parse(savedDraft);
                        setTitle(parsed.title || '');
                        if (editorRef.current && parsed.content) {
                            editorRef.current.innerHTML = markdownToHtml(parsed.content);
                            setContentLength((editorRef.current.innerText || '').length);
                        }
                    } catch (e) { }
                }
                setFetching(false);
            }
        };

        const timer = setTimeout(() => {
            void initializeContent();
        }, 50);

        return () => clearTimeout(timer);
    }, [editPostId]);

    // Đồng bộ lưu bản nháp local khi tiêu đề đổi
    useEffect(() => {
        if (!editPostId && !fetching && editorRef.current) {
            const md = htmlToMarkdown(editorRef.current.innerHTML);
            localStorage.setItem('reddit_draft', JSON.stringify({ title, content: md }));
        }
    }, [title, editPostId, fetching]);

    // Xử lý sự kiện thời gian thực khi người dùng nhập liệu vào Editor trực quan
    const handleInput = () => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            const text = editorRef.current.innerText || '';
            setContentLength(text.length);

            if (!editPostId && !fetching) {
                const md = htmlToMarkdown(html);
                localStorage.setItem('reddit_draft', JSON.stringify({ title, content: md }));
            }
        }
    };

    // Áp dụng định dạng phong cách Rich Text lên con trỏ hoặc vùng bôi đen đang chọn
    const applyFormat = (command: string, value: string = '') => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false, value);
            handleInput();
        }
    };

    const handleLinkClick = () => {
        const url = prompt('Nhập URL liên kết:');
        if (url) {
            applyFormat('createLink', url);
        }
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
                // Đưa ảnh vào ngay vị trí con trỏ chuột đang đứng trong bài viết
                applyFormat('insertImage', response.url);
            }
        } catch (err: any) {
            setError(err?.message || 'Lỗi tải ảnh lên server');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleCreatePost = async () => {
        if (!title.trim()) {
            setError('Tiêu đề không được để trống');
            return;
        }

        const htmlContent = editorRef.current ? editorRef.current.innerHTML : '';
        const markdownContent = htmlToMarkdown(htmlContent);

        if (!markdownContent.trim()) {
            setError('Nội dung không được để trống');
            return;
        }

        setLoading(true);
        setError('');

        try {
            let response;
            if (editPostId) {
                response = await updatePost(editPostId, { community: selectedCommunity, title: title.trim(), content: markdownContent });
            } else {
                response = await createPost({ community: selectedCommunity, title: title.trim(), content: markdownContent });
                localStorage.removeItem('reddit_draft');
            }
            onPost(response?.data?.id || response?.id || editPostId);
        } catch (err: any) {
            setError(err?.message || (editPostId ? 'Cập nhật thất bại' : 'Tạo bài viết thất bại'));
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
                        <div className="flex items-center gap-2 pb-2 border-b border-[#2a2a2a] mb-3">
                            <button onClick={() => applyFormat('bold')} className="p-2 rounded hover:bg-[#0a0a0a] text-gray-400 hover:text-white transition-colors" title="Bold" type="button">
                                <Bold className="w-5 h-5" />
                            </button>
                            <button onClick={() => applyFormat('italic')} className="p-2 rounded hover:bg-[#0a0a0a] text-gray-400 hover:text-white transition-colors" title="Italic" type="button">
                                <Italic className="w-5 h-5" />
                            </button>
                            <button onClick={handleLinkClick} className="p-2 rounded hover:bg-[#0a0a0a] text-gray-400 hover:text-white transition-colors" title="Link" type="button">
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
                        {/* Editor contentEditable thay thế textarea hoàn hảo cho trải nghiệm WYSIWYG */}
                        <div
                            ref={editorRef}
                            contentEditable
                            onInput={handleInput}
                            placeholder="Nhập nội dung bài viết ở đây... "
                            className="w-full min-h-[300px] bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:border-[#FF4500] focus:outline-none transition-colors overflow-y-auto outline-none font-sans leading-relaxed empty:before:content-[attr(placeholder)] empty:before:text-gray-500 empty:before:pointer-events-none [&_img]:max-h-80 [&_img]:my-3 [&_img]:rounded-lg [&_img]:block [&_a]:text-blue-400 [&_a]:underline"
                            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                        />
                        <div className="text-right text-xs text-gray-500 mt-1">{contentLength}/10000</div>
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