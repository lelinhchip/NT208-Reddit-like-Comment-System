import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface CommentInputProps {
    value?: string;
    onChange?: (value: string) => void;
    onSubmit?: () => void;
    disabled?: boolean;
}

export function CommentInput({ value = '', onChange, onSubmit, disabled = false }: CommentInputProps) {
    const [sortBy, setSortBy] = useState('Best');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const sortOptions = ['Best', 'Top', 'New'];

    return (
        <div className="mb-6">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 mb-3">
                <textarea
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full min-h-[80px] resize-none border-none outline-none bg-transparent text-white placeholder:text-gray-500"
                />
                <div className="flex justify-end mt-2">
                    <button onClick={onSubmit} disabled={disabled || !value.trim()} className="bg-[#FF4500] text-white px-6 py-2 rounded-full hover:bg-[#ff5722] disabled:opacity-50 transition-colors">
                        Submit
                    </button>
                </div>
            </div>

            <div className="relative">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 px-3 py-1.5 text-gray-300 hover:bg-[#1a1a1a] rounded-full transition-colors">
                    <span className="font-medium">{sortBy}</span>
                    <ChevronDown className="w-4 h-4" />
                </button>

                {isDropdownOpen && (
                    <div className="absolute top-full mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-lg overflow-hidden z-10">
                        {sortOptions.map((option) => (
                            <button
                                key={option}
                                onClick={() => {
                                    setSortBy(option);
                                    setIsDropdownOpen(false);
                                }}
                                className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-[#0a0a0a] transition-colors"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
