import { ChevronDown, Bold, Italic, Link as LinkIcon, Image, X } from 'lucide-react';
import { useState } from 'react';

interface CreatePostScreenProps {
    onPost: () => void;
    onCancel: () => void;
}

export function CreatePostScreen({ onPost, onCancel }: CreatePostScreenProps) {
    const [selectedCommunity, setSelectedCommunity] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const communities = [
        'r/netsec',
        'r/cybersecurity',
        'r/programming',
        'r/networking',
        'r/sysadmin',
        'r/devops',
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Header */}
            <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-4 py-4 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-white">Create a post</h2>
                    <div className="w-6" /> {/* Spacer for centering */}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
                    {/* Community Selector */}
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm mb-2">Community</label>
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-left flex items-center justify-between hover:border-[#4a4a4a] transition-colors"
                            >
                                <span className={selectedCommunity ? 'text-white' : 'text-gray-500'}>
                                    {selectedCommunity || 'Choose a community'}
                                </span>
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute top-full mt-2 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl overflow-hidden z-20">
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

                    {/* Title Input */}
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Title"
                            className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white text-lg placeholder:text-gray-500 focus:border-[#4a4a4a] focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Formatting Toolbar */}
                    <div className="mb-2">
                        <div className="flex items-center gap-2 pb-2">
                            <button
                                className="p-2 rounded hover:bg-[#0a0a0a] text-gray-400 hover:text-white transition-colors"
                                title="Bold"
                            >
                                <Bold className="w-5 h-5" />
                            </button>
                            <button
                                className="p-2 rounded hover:bg-[#0a0a0a] text-gray-400 hover:text-white transition-colors"
                                title="Italic"
                            >
                                <Italic className="w-5 h-5" />
                            </button>
                            <button
                                className="p-2 rounded hover:bg-[#0a0a0a] text-gray-400 hover:text-white transition-colors"
                                title="Link"
                            >
                                <LinkIcon className="w-5 h-5" />
                            </button>
                            <button
                                className="p-2 rounded hover:bg-[#0a0a0a] text-gray-400 hover:text-white transition-colors"
                                title="Image"
                            >
                                <Image className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Body Input */}
                    <div className="mb-6">
                        <textarea
                            placeholder="Text (optional)"
                            rows={12}
                            className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-[#4a4a4a] focus:outline-none transition-colors resize-none"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3">
                        <button
                            onClick={onCancel}
                            className="px-6 py-2.5 rounded-full text-gray-400 hover:bg-[#0a0a0a] transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onPost}
                            className="px-6 py-2.5 rounded-full bg-[#FF4500] hover:bg-[#ff5722] text-white transition-colors font-medium"
                        >
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
    