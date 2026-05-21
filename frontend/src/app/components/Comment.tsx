import { ArrowUp, ArrowDown, MessageSquare, Share2 } from 'lucide-react';
import { useState } from 'react';
import { createComment, voteComment } from '../../api/commentApi';

export interface CommentData {
    id: string | number;
    post_id?: string | number;
    username?: string;
    created_at?: string;
    content?: string;
    text?: string;
    vote_count?: number;
    score?: number;
    replies?: CommentData[];
}

interface CommentProps {
    comment: CommentData;
    depth?: number;
    postId?: string | number;
    onReload?: () => void;
}

export function Comment({ comment, depth = 0, postId, onReload }: CommentProps) {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const maxDepth = 8;
    const shouldIndent = depth < maxDepth;
    const username = comment.username || 'Anonymous';
    const content = comment.content || comment.text || '';
    const score = comment.score ?? comment.vote_count ?? 0;
    const avatarColors = ['bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-pink-600', 'bg-yellow-600', 'bg-indigo-600'];
    const avatarColor = avatarColors[username.length % avatarColors.length];

    const handleReply = async () => {
        if (!replyText.trim() || !postId) return;
        setSubmitting(true);
        try {
            await createComment({ post_id: postId, content: replyText.trim(), parent_comment_id: comment.id });
            setReplyText('');
            setShowReplyInput(false);
            await onReload?.();
        } catch (err: any) {
            alert(err?.message || 'Trả lời thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    const handleVote = async (voteType: 1 | -1) => {
        try {
            await voteComment(comment.id, voteType);
            await onReload?.();
        } catch (err: any) {
            alert(err?.message || 'Vote bình luận thất bại');
        }
    };

    return (
        <div className="relative">
            {depth > 0 && shouldIndent && <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-[#2a2a2a]" />}

            <div className={`${shouldIndent ? 'ml-8' : ''} relative`}>
                <div className="flex gap-3 mb-4">
                    <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-sm font-medium">{username.charAt(0).toUpperCase()}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white">u/{username}</span>
                            <span className="text-gray-600">•</span>
                            <span className="text-sm text-gray-400">{comment.created_at ? new Date(comment.created_at).toLocaleString() : 'vừa xong'}</span>
                        </div>

                        <p className="text-gray-300 mb-2 leading-relaxed whitespace-pre-wrap">{content}</p>

                        <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1">
                                <button onClick={() => handleVote(1)} className="hover:bg-[#1a1a1a] hover:text-orange-500 p-1 rounded transition-colors text-gray-400">
                                    <ArrowUp className="w-4 h-4" />
                                </button>
                                <span className="font-medium min-w-[1.5rem] text-center text-white">{score}</span>
                                <button onClick={() => handleVote(-1)} className="hover:bg-[#1a1a1a] hover:text-blue-500 p-1 rounded transition-colors text-gray-400">
                                    <ArrowDown className="w-4 h-4" />
                                </button>
                            </div>

                            <button onClick={() => setShowReplyInput(!showReplyInput)} className="flex items-center gap-1 hover:bg-[#1a1a1a] px-2 py-1 rounded transition-colors text-gray-400 hover:text-white">
                                <MessageSquare className="w-4 h-4" />
                                <span className="font-medium">Reply</span>
                            </button>

                            <button className="flex items-center gap-1 hover:bg-[#1a1a1a] px-2 py-1 rounded transition-colors text-gray-400 hover:text-white">
                                <Share2 className="w-4 h-4" />
                                <span className="font-medium">Share</span>
                            </button>
                        </div>

                        {showReplyInput && (
                            <div className="mt-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-3">
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Write a reply..."
                                    className="w-full min-h-[60px] resize-none border-none outline-none bg-transparent text-white placeholder:text-gray-500"
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
                        {comment.replies.map((reply) => (
                            <Comment key={reply.id} comment={reply} depth={depth + 1} postId={postId} onReload={onReload} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
