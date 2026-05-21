import { ArrowUp, ArrowDown, MessageSquare, Share2 } from 'lucide-react';

interface PostProps {
  community: string;
  username: string;
  timestamp: string;
  title: string;
  body: string;
  upvotes: number;
  commentCount: number;
}

export function Post({
  community,
  username,
  timestamp,
  title,
  body,
  upvotes,
  commentCount
}: PostProps) {
  return (
    <div className="bg-white border border-border rounded-lg p-4 mb-4">
      {/* Post Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <span className="text-white text-sm font-medium">r/</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold">{community}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">Posted by u/{username}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{timestamp}</span>
        </div>
      </div>

      {/* Post Title */}
      <h1 className="mb-3">{title}</h1>

      {/* Post Body */}
      <p className="text-foreground mb-4 leading-relaxed">{body}</p>

      {/* Action Bar */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-muted rounded-full px-3 py-1.5">
          <button className="hover:text-orange-500 transition-colors">
            <ArrowUp className="w-5 h-5" />
          </button>
          <span className="font-medium min-w-[2rem] text-center">{upvotes}</span>
          <button className="hover:text-blue-500 transition-colors">
            <ArrowDown className="w-5 h-5" />
          </button>
        </div>

        <button className="flex items-center gap-2 hover:bg-muted px-3 py-1.5 rounded-full transition-colors">
          <MessageSquare className="w-5 h-5" />
          <span className="font-medium">{commentCount} Comments</span>
        </button>

        <button className="flex items-center gap-2 hover:bg-muted px-3 py-1.5 rounded-full transition-colors">
          <Share2 className="w-5 h-5" />
          <span className="font-medium">Share</span>
        </button>
      </div>
    </div>
  );
}
