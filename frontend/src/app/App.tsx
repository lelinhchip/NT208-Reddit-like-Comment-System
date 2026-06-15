import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { RegistrationScreen } from './components/RegistrationScreen';
import { PostListScreen } from './components/PostListScreen';
import { PostDetailScreen } from './components/PostDetailScreen';
import { CreatePostScreen } from './components/CreatePostScreen';
import { getCurrentUser, isAuthenticated, logoutUser } from '../api/userApi';

type Screen = 'login' | 'register' | 'postList' | 'postDetail' | 'createPost' | 'editPost';

export default function App() {
    const [currentScreen, setCurrentScreen] = useState<Screen>(isAuthenticated() ? 'postList' : 'login');
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(getCurrentUser());

    const goToPost = (postId: string | number) => {
        setSelectedPostId(String(postId));
        setCurrentScreen('postDetail');
    };

    const handleAuthSuccess = () => {
        setCurrentUser(getCurrentUser());
        setCurrentScreen('postList');
    };

    const handleLogout = () => {
        logoutUser();
        setCurrentUser(null);
        setSelectedPostId(null);
        setCurrentScreen('login');
    };

    return (
        <div className="size-full min-h-screen bg-[#0a0a0a]">
            {currentScreen === 'login' && (
                <LoginScreen
                    onLogin={handleAuthSuccess}
                    onCreateAccountClick={() => setCurrentScreen('register')}
                />
            )}

            {currentScreen === 'register' && (
                <RegistrationScreen
                    onSignUp={handleAuthSuccess}
                    onLoginClick={() => setCurrentScreen('login')}
                />
            )}

            {currentScreen === 'postList' && (
                <PostListScreen
                    user={currentUser}
                    onLogout={handleLogout}
                    onPostClick={goToPost}
                    // SỬA Ở ĐÂY: Nhận postId để phân biệt Sửa hay Tạo mới
                    onCreatePostClick={(postId?: string | number) => {
                        if (postId) {
                            setSelectedPostId(String(postId));
                            setCurrentScreen('editPost');
                        } else {
                            setSelectedPostId(null);
                            setCurrentScreen('createPost');
                        }
                    }}
                />
            )}

            {(currentScreen === 'createPost' || currentScreen === 'editPost') && (
                <CreatePostScreen
                    editPostId={currentScreen === 'editPost' ? selectedPostId : null}
                    onPost={(postId?: string | number) => {
                        if (postId) {
                            goToPost(postId);
                        } else {
                            setCurrentScreen('postList');
                        }
                    }}
                    onCancel={() => {
                        // Trở về đúng màn hình trước đó
                        if (currentScreen === 'editPost' && selectedPostId) {
                            // Nếu bấm edit từ list thì quay về list là tốt nhất, 
                            // nếu bạn muốn quay về detail thì đổi thành 'postDetail'
                            setCurrentScreen('postList');
                        } else {
                            setCurrentScreen('postList');
                        }
                    }}
                />
            )}

            {currentScreen === 'postDetail' && selectedPostId && (
                <PostDetailScreen
                    postId={selectedPostId}
                    user={currentUser}
                    onBack={() => setCurrentScreen('postList')}
                    onLogout={handleLogout}
                    onEditPost={() => setCurrentScreen('editPost')}
                />
            )}
        </div>
    );
}