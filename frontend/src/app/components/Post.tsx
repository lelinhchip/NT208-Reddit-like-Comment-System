import { ArrowUp, ArrowDown, MessageSquare, Share2 } from 'lucide-react';
import Markdown from 'react-markdown';

interface PostProps {
    community?: string;
    username?: string;
    timestamp?: string;
    title: string;
    body: string;
    upvotes?: number;
    commentCount?: number;
    onUpvote?: () => void;
    onDownvote?: () => void;
}

export function Post({
    community = 'r/general',
    username = 'Anonymous',
    timestamp = 'vừa xong',
    title,
    body,
    upvotes = 0,
    commentCount = 0,
    onUpvote,
    onDownvote,
}: PostProps) {
    return (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-xs">r/</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-white">{community}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-400">Posted by u/{username}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-400">{timestamp}</span>
                </div>
            </div>

            <h1 className="mb-3 text-white text-xl font-bold">{title}</h1>
            <div className="text-gray-300 mb-4 leading-relaxed overflow-hidden prose prose-invert max-w-none prose-p:my-1 prose-a:text-blue-400 hover:prose-a:underline prose-img:rounded-md prose-img:max-h-96 prose-img:object-contain prose-pre:bg-[#0a0a0a] prose-pre:border prose-pre:border-[#2a2a2a]">
                <Markdown>{body}</Markdown>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-[#0a0a0a] rounded-full px-3 py-1.5">
                    <button onClick={onUpvote} className="text-gray-400 hover:text-orange-500 transition-colors">
                        <ArrowUp className="w-5 h-5" />
                    </button>
                    <span className="text-white font-medium min-w-[2rem] text-center">{upvotes}</span>
                    <button onClick={onDownvote} className="text-gray-400 hover:text-blue-500 transition-colors">
                        <ArrowDown className="w-5 h-5" />
                    </button>
                </div>

                <button className="flex items-center gap-2 text-gray-400 hover:bg-[#0a0a0a] px-3 py-1.5 rounded-full transition-colors">
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-medium">{commentCount} Comments</span>
                </button>

                <button className="flex items-center gap-2 text-gray-400 hover:bg-[#0a0a0a] px-3 py-1.5 rounded-full transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span className="font-medium">Share</span>
                </button>
            </div>
        </div>
    );
}
