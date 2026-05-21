import { Search, ArrowUp, ArrowDown, MessageSquare } from 'lucide-react';

interface PostCardData {
  id: string;
  community: string;
  username: string;
  timestamp: string;
  title: string;
  preview: string;
  upvotes: number;
  commentCount: number;
}

interface PostListScreenProps {
  onPostClick: (postId: string) => void;
}

export function PostListScreen({ onPostClick }: PostListScreenProps) {
  const posts: PostCardData[] = [
    {
      id: '1',
      community: 'r/netsec',
      username: 'sysadmin_42',
      timestamp: '5h ago',
      title: 'Architecture design for Transparent Proxy using WCCP',
      preview: 'I\'m designing a transparent proxy setup using WCCP protocol to redirect traffic to a Squid proxy server. The goal is to intercept HTTP/HTTPS traffic...',
      upvotes: 156,
      commentCount: 12,
    },
    {
      id: '2',
      community: 'r/cybersecurity',
      username: 'securitypro',
      timestamp: '8h ago',
      title: 'New zero-day vulnerability discovered in popular web framework',
      preview: 'Security researchers have identified a critical remote code execution vulnerability affecting versions 3.x and 4.x. Patches are being rolled out...',
      upvotes: 342,
      commentCount: 28,
    },
    {
      id: '3',
      community: 'r/programming',
      username: 'devguru',
      timestamp: '12h ago',
      title: 'Best practices for implementing rate limiting in distributed systems',
      preview: 'After years of dealing with DDoS attacks and API abuse, here are the lessons learned about rate limiting strategies that actually work in production...',
      upvotes: 89,
      commentCount: 15,
    },
  ];

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
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onClick={() => onPostClick(post.id)} />
        ))}
      </div>
    </div>
  );
}

function PostCard({ post, onClick }: { post: PostCardData; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 hover:border-[#3a3a3a] transition-colors cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-white text-xs">r/</span>
        </div>
        <span className="text-sm font-medium text-white">{post.community}</span>
        <span className="text-gray-600">•</span>
        <span className="text-sm text-gray-400">u/{post.username}</span>
        <span className="text-gray-600">•</span>
        <span className="text-sm text-gray-400">{post.timestamp}</span>
      </div>

      {/* Content */}
      <h3 className="text-white mb-2">{post.title}</h3>
      <p className="text-gray-400 text-sm line-clamp-2 mb-3">{post.preview}</p>

      {/* Action Bar */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-[#0a0a0a] rounded-full px-3 py-1.5">
          <button className="hover:text-orange-500 text-gray-400 transition-colors">
            <ArrowUp className="w-4 h-4" />
          </button>
          <span className="text-white text-sm font-medium min-w-[2rem] text-center">{post.upvotes}</span>
          <button className="hover:text-blue-500 text-gray-400 transition-colors">
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-gray-400 hover:bg-[#0a0a0a] px-3 py-1.5 rounded-full transition-colors">
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm font-medium">{post.commentCount}</span>
        </div>
      </div>
    </div>
  );
}
