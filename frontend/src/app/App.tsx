import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { RegistrationScreen } from './components/RegistrationScreen';
import { PostListScreen } from './components/PostListScreen';
import { PostDetailScreen } from './components/PostDetailScreen';
import { CreatePostScreen } from './components/CreatePostScreen';
import { isAuthenticated } from '../api/userApi'; // Import hàm check token

type Screen = 'login' | 'register' | 'postList' | 'postDetail' | 'createPost';

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
                <LoginScreen onLogin={() => setCurrentScreen('postList')}
                onCreateAccountClick={() => setCurrentScreen('register')}
                />
            )}

            {currentScreen === 'register' && (
                <RegistrationScreen
                    onSignUp={() => setCurrentScreen('postList')}
                    onLoginClick={() => setCurrentScreen('login')}
                />
            )}

            {currentScreen === 'postList' && (
                <PostListScreen
                    onPostClick={() => setCurrentScreen('postDetail')}
                    onCreatePostClick={() => setCurrentScreen('createPost')}
                />
            )}

            {currentScreen === 'createPost' && (
                <CreatePostScreen
                    onPost={() => setCurrentScreen('postList')}
                    onCancel={() => setCurrentScreen('postList')}
                />
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