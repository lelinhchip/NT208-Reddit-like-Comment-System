import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function CommentInput() {
  const [sortBy, setSortBy] = useState('Best');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const sortOptions = ['Best', 'Top', 'New'];

  return (
    <div className="mb-6">
      {/* Comment Input */}
      <div className="bg-white border border-border rounded-lg p-4 mb-3">
        <textarea
          placeholder="Write a comment..."
          className="w-full min-h-[80px] resize-none border-none outline-none bg-transparent placeholder:text-muted-foreground"
        />
        <div className="flex justify-end mt-2">
          <button className="bg-primary text-primary-foreground px-6 py-2 rounded-full hover:opacity-90 transition-opacity">
            Submit
          </button>
        </div>
      </div>

      {/* Sorting Options */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted rounded-full transition-colors"
        >
          <span className="font-medium">{sortBy}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full mt-1 bg-white border border-border rounded-lg shadow-lg overflow-hidden z-10">
            {sortOptions.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setSortBy(option);
                  setIsDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-muted transition-colors"
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
