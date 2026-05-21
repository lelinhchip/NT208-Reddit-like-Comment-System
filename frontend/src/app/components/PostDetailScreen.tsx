import { ArrowLeft, ArrowUp, ArrowDown, MessageSquare, Share2, Send, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface CommentData {
  id: string;
  username: string;
  timestamp: string;
  text: string;
  upvotes: number;
  isUpvoted?: boolean;
  replies?: CommentData[];
}

interface PostDetailScreenProps {
  onBack: () => void;
}

export function PostDetailScreen({ onBack }: PostDetailScreenProps) {
  const comments: CommentData[] = [
    {
      id: '1',
      username: 'technetworking',
      timestamp: '2h ago',
      text: 'Make sure your GRE tunnel is configured correctly to redirect traffic to Squid. The WCCP protocol can be tricky with routing tables.',
      upvotes: 24,
      isUpvoted: true,
      replies: [
        {
          id: '1-1',
          username: 'proxymaster',
          timestamp: '1h ago',
          text: 'Great point! Also worth checking if your router supports WCCP v2. Some older models only have v1 support which is quite limited.',
          upvotes: 12,
          replies: [
            {
              id: '1-1-1',
              username: 'netadmin2024',
              timestamp: '45m ago',
              text: 'This saved me so much time! I was struggling with v1 limitations for weeks before switching to v2. The multicast support alone makes it worth the upgrade.',
              upvotes: 8,
            },
          ],
        },
      ],
    },
    {
      id: '2',
      username: 'securitypro',
      timestamp: '3h ago',
      text: 'Have you considered the security implications? WCCP redirects can potentially expose internal traffic patterns if not properly secured.',
      upvotes: 18,
      replies: [
        {
          id: '2-1',
          username: 'networksec',
          timestamp: '2h ago',
          text: 'Absolutely. Make sure to implement proper ACLs and authentication between your router and Squid proxy.',
          upvotes: 9,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top Bar */}
      <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-white font-medium">Post</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Full Post */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6">
          {/* Post Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-sm">r/</span>
            </div>
            <span className="text-sm font-medium text-white">r/netsec</span>
            <span className="text-gray-600">•</span>
            <span className="text-sm text-gray-400">u/sysadmin_42</span>
            <span className="text-gray-600">•</span>
            <span className="text-sm text-gray-400">5h ago</span>
          </div>

          {/* Post Title */}
          <h1 className="text-white mb-4">Architecture design for Transparent Proxy using WCCP</h1>

          {/* Post Body */}
          <p className="text-gray-300 mb-4 leading-relaxed">
            I'm designing a transparent proxy setup using WCCP (Web Cache Communication Protocol) to redirect traffic to a Squid proxy server. The goal is to intercept HTTP/HTTPS traffic from clients without requiring any client-side configuration. Has anyone implemented a similar architecture? Looking for advice on potential pitfalls and best practices for handling GRE tunnels and return traffic routing.
          </p>

          {/* Action Bar */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#0a0a0a] rounded-full px-3 py-2">
              <button className="hover:text-orange-500 text-gray-400 transition-colors">
                <ArrowUp className="w-5 h-5" />
              </button>
              <span className="text-white font-medium min-w-[2rem] text-center">156</span>
              <button className="hover:text-blue-500 text-gray-400 transition-colors">
                <ArrowDown className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-gray-400 hover:bg-[#0a0a0a] px-3 py-2 rounded-full transition-colors">
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">12</span>
            </div>

            <button className="flex items-center gap-2 text-gray-400 hover:bg-[#0a0a0a] px-3 py-2 rounded-full transition-colors">
              <Share2 className="w-5 h-5" />
              <span className="font-medium">Share</span>
            </button>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="mb-4">
          <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <span className="font-medium">Sort by: Top</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Add Comment Input */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-white placeholder:text-gray-500 focus:outline-none"
            />
            <button className="text-gray-400 hover:text-white transition-colors">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-0">
          {comments.map((comment) => (
            <DarkComment key={comment.id} comment={comment} depth={0} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DarkComment({ comment, depth }: { comment: CommentData; depth: number }) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [isUpvoted, setIsUpvoted] = useState(comment.isUpvoted || false);

  const maxDepth = 8;
  const shouldIndent = depth < maxDepth;

  const avatarColors = [
    'bg-blue-600',
    'bg-green-600',
    'bg-purple-600',
    'bg-pink-600',
    'bg-yellow-600',
    'bg-indigo-600',
  ];
  const avatarColor = avatarColors[comment.username.length % avatarColors.length];

  return (
    <div className="relative">
      {/* Thread Line */}
      {depth > 0 && shouldIndent && (
        <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-[#2a2a2a]" />
      )}

      <div className={`${shouldIndent ? 'ml-8' : ''} relative py-3`}>
        <div className="flex gap-3">
          {/* Avatar */}
          <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center flex-shrink-0`}>
            <span className="text-white text-sm font-medium">
              {comment.username.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            {/* Comment Header */}
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-white">u/{comment.username}</span>
              <span className="text-gray-600">•</span>
              <span className="text-sm text-gray-400">{comment.timestamp}</span>
            </div>

            {/* Comment Text */}
            <p className="text-gray-300 mb-2 leading-relaxed">{comment.text}</p>

            {/* Action Bar */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsUpvoted(!isUpvoted)}
                  className={`hover:bg-[#1a1a1a] p-1 rounded transition-colors ${
                    isUpvoted ? 'text-orange-500' : 'text-gray-400'
                  }`}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <span className={`font-medium min-w-[1.5rem] text-center ${isUpvoted ? 'text-orange-500' : 'text-white'}`}>
                  {comment.upvotes}
                </span>
                <button className="hover:bg-[#1a1a1a] p-1 rounded transition-colors text-gray-400">
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="flex items-center gap-1 hover:bg-[#1a1a1a] px-2 py-1 rounded transition-colors text-gray-400 hover:text-white"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="font-medium">Reply</span>
              </button>
            </div>

            {/* Reply Input */}
            {showReplyInput && (
              <div className="mt-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-3">
                <input
                  type="text"
                  placeholder="Write a reply..."
                  className="w-full bg-transparent text-white placeholder:text-gray-500 focus:outline-none mb-2"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowReplyInput(false)}
                    className="px-4 py-1.5 rounded-full text-gray-400 hover:bg-[#1a1a1a] transition-colors"
                  >
                    Cancel
                  </button>
                  <button className="bg-[#FF4500] text-white px-4 py-1.5 rounded-full hover:bg-[#ff5722] transition-colors">
                    Reply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => (
              <DarkComment key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
