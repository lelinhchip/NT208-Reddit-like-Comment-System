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
        if (!username || !password) {
            setError('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await loginUser({ username, password });
            onLogin(); // Thành công thì gọi callback để chuyển trang
        } catch (err: any) {
            setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <h1 className="text-center text-white mb-12 text-4xl font-bold">🤖 ThreadHub</h1>

                <div className="space-y-4 mb-6">
                    {error && <div className="text-red-500 text-sm text-center bg-red-500/10 py-2 rounded">{error}</div>}

                    <div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-[#4a4a4a] focus:outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-[#4a4a4a] focus:outline-none transition-colors"
                        />
                    </div>
                </div>

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className={`w-full bg-[#FF4500] hover:bg-[#ff5722] text-white rounded-lg px-4 py-3 font-medium transition-colors mb-4 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Đang xử lý...' : 'Log In'}
                </button>

                <div className="flex justify-between text-sm">
                    <button className="text-gray-400 hover:text-white transition-colors">Forgot Password?</button>
                    <button
                        onClick={onCreateAccountClick}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        Create an account
                    </button>
                </div>
            </div>
        </div>
    );
}