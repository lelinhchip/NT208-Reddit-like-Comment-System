import { useState } from 'react';
import { loginUser } from '../../api/userApi';

interface LoginScreenProps {
    onLogin: () => void;
    onCreateAccountClick: () => void;
}

export function LoginScreen({ onLogin, onCreateAccountClick }: LoginScreenProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            setError('Vui lòng nhập username và password');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await loginUser({ username: username.trim(), password });
            onLogin();
        } catch (err: any) {
            setError(err?.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <h1 className="text-center text-white mb-12 text-4xl font-bold">ThreadHub</h1>

                <div className="space-y-4 mb-6">
                    {error && <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 py-2 px-3 rounded-lg">{error}</div>}

                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-[#FF4500] focus:outline-none transition-colors"
                    />

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        placeholder="Password"
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-[#FF4500] focus:outline-none transition-colors"
                    />
                </div>

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-[#FF4500] hover:bg-[#ff5722] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg px-4 py-3 font-medium transition-colors mb-4"
                >
                    {loading ? 'Đang đăng nhập...' : 'Log In'}
                </button>

                <div className="text-center text-sm">
                    <span className="text-gray-400">Chưa có tài khoản? </span>
                    <button onClick={onCreateAccountClick} className="text-[#FF4500] hover:text-[#ff5722] transition-colors font-medium">
                        Create an account
                    </button>
                </div>
            </div>
        </div>
    );
}
