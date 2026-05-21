import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { PostListScreen } from './components/PostListScreen';
import { PostDetailScreen } from './components/PostDetailScreen';

type Screen = 'login' | 'postList' | 'postDetail';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');

  return (
    <div className="size-full">
      {currentScreen === 'login' && (
        <LoginScreen onLogin={() => setCurrentScreen('postList')} />
      )}

      {currentScreen === 'postList' && (
        <PostListScreen onPostClick={() => setCurrentScreen('postDetail')} />
      )}

      {currentScreen === 'postDetail' && (
        <PostDetailScreen onBack={() => setCurrentScreen('postList')} />
      )}
    </div>
  );
}