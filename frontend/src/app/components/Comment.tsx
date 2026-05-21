import { ArrowUp, ArrowDown, MessageSquare, Share2 } from 'lucide-react';
import { useState } from 'react';

export interface CommentData {
  id: string;
  username: string;
  timestamp: string;
  text: string;
  upvotes: number;
  isUpvoted?: boolean;
  replies?: CommentData[];
}

interface CommentProps {
  comment: CommentData;
  depth?: number;
}

export function Comment({ comment, depth = 0 }: CommentProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [isUpvoted, setIsUpvoted] = useState(comment.isUpvoted || false);

  const maxDepth = 8;
  const shouldIndent = depth < maxDepth;

  // Generate avatar color based on username
  const avatarColors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-indigo-500',
  ];
  const avatarColor = avatarColors[comment.username.length % avatarColors.length];

  return (
    <div className="relative">
      {/* Thread Line */}
      {depth > 0 && shouldIndent && (
        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border" />
      )}

      <div className={`${shouldIndent ? 'ml-8' : ''} relative`}>
        <div className="flex gap-3 mb-4">
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
              <span className="font-medium">u/{comment.username}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{comment.timestamp}</span>
            </div>

            {/* Comment Text */}
            <p className="text-foreground mb-2 leading-relaxed">{comment.text}</p>

            {/* Action Bar */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsUpvoted(!isUpvoted)}
                  className={`hover:bg-muted p-1 rounded transition-colors ${
                    isUpvoted ? 'text-orange-500' : ''
                  }`}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <span className={`font-medium min-w-[1.5rem] text-center ${isUpvoted ? 'text-orange-500' : ''}`}>
                  {comment.upvotes}
                </span>
                <button className="hover:bg-muted p-1 rounded transition-colors">
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="flex items-center gap-1 hover:bg-muted px-2 py-1 rounded transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="font-medium">Reply</span>
              </button>

              <button className="flex items-center gap-1 hover:bg-muted px-2 py-1 rounded transition-colors">
                <Share2 className="w-4 h-4" />
                <span className="font-medium">Share</span>
              </button>
            </div>

            {/* Reply Input */}
            {showReplyInput && (
              <div className="mt-3 bg-muted/50 border border-border rounded-lg p-3">
                <textarea
                  placeholder="Write a reply..."
                  className="w-full min-h-[60px] resize-none border-none outline-none bg-transparent placeholder:text-muted-foreground"
                />
                <div className="flex gap-2 justify-end mt-2">
                  <button
                    onClick={() => setShowReplyInput(false)}
                    className="px-4 py-1.5 rounded-full hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity">
                    Reply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div>
            {comment.replies.map((reply) => (
              <Comment key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
