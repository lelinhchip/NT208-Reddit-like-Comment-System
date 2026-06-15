import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { RegistrationScreen } from './components/RegistrationScreen';
import { PostListScreen } from './components/PostListScreen';
import { PostDetailScreen } from './components/PostDetailScreen';
import { CreatePostScreen } from './components/CreatePostScreen';
import { getCurrentUser, isAuthenticated, logoutUser } from '../api/userApi';

type Screen = 'login' | 'register' | 'postList' | 'postDetail' | 'createPost' | 'editPost';

export default function App() {
    // SỬA Ở ĐÂY: Mặc định ai cũng có thể xem trang chủ danh sách bài viết
    const [currentScreen, setCurrentScreen] = useState<Screen>('postList');
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
        setCurrentScreen('postList'); // Đăng xuất xong vẫn cho ở lại trang danh sách (Guest)
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
                    onLoginClick={() => setCurrentScreen('login')} // Thêm prop onLoginClick
                    onPostClick={goToPost}
                    onCreatePostClick={(postId?: string | number) => {
                        // SỬA Ở ĐÂY: Kiểm tra đăng nhập trước khi cho bấm "+" hoặc Edit
                        if (!isAuthenticated()) {
                            alert('Vui lòng đăng nhập để thực hiện chức năng này!');
                            setCurrentScreen('login');
                            return;
                        }

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
                        setCurrentScreen('postList');
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