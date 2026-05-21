import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { PostListScreen } from './components/PostListScreen';
import { PostDetailScreen } from './components/PostDetailScreen';
import { isAuthenticated } from '../api/userApi'; // Import hàm check token

type Screen = 'login' | 'postList' | 'postDetail';

export default function App() {
    // Nếu đã có token thì vào thẳng PostList, chưa có thì Login
    const [currentScreen, setCurrentScreen] = useState<Screen>(isAuthenticated() ? 'postList' : 'login');
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

    const handlePostClick = (id: string) => {
        setSelectedPostId(id);
        setCurrentScreen('postDetail');
    };

    return (
        <div className="size-full">
            {currentScreen === 'login' && (
                <LoginScreen onLogin={() => setCurrentScreen('postList')} />
            )}

            {currentScreen === 'postList' && (
                <PostListScreen onPostClick={handlePostClick} />
            )}

            {currentScreen === 'postDetail' && selectedPostId && (
                <PostDetailScreen
                    postId={selectedPostId}
                    onBack={() => setCurrentScreen('postList')}
                />
            )}
        </div>
    );
}