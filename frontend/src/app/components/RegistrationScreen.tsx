import { useState } from 'react';
import { registerUser } from '../../api/userApi';

interface RegistrationScreenProps {
    onSignUp: () => void;
    onLoginClick: () => void;
}

export function RegistrationScreen({ onSignUp, onLoginClick }: RegistrationScreenProps) {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        if (!email.trim() || !username.trim() || !password.trim()) {
            setError('Vui lòng nhập đầy đủ email, username và password');
            return;
        }

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await registerUser({ email: email.trim(), username: username.trim(), password });
            onSignUp();
        } catch (err: any) {
            setError(err?.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-white mb-3 text-4xl font-bold">Join ThreadHub</h1>
                    <p className="text-gray-400">Create an account to start posting and commenting.</p>
                </div>

                <div className="space-y-4 mb-6">
                    {error && <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 py-2 px-3 rounded-lg">{error}</div>}

                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-[#FF4500] focus:outline-none transition-colors"
                    />

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
                        placeholder="Password"
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-[#FF4500] focus:outline-none transition-colors"
                    />

                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
                        placeholder="Confirm Password"
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-[#FF4500] focus:outline-none transition-colors"
                    />
                </div>

                <button
                    onClick={handleSignUp}
                    disabled={loading}
                    className="w-full bg-[#FF4500] hover:bg-[#ff5722] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg px-4 py-3 font-medium transition-colors mb-6"
                >
                    {loading ? 'Đang tạo tài khoản...' : 'Sign Up'}
                </button>

                <div className="text-center">
                    <span className="text-gray-400">Already have an account? </span>
                    <button onClick={onLoginClick} className="text-[#FF4500] hover:text-[#ff5722] transition-colors font-medium">
                        Log In
                    </button>
                </div>
            </div>
        </div>
    );
}
