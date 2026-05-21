interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* App Title */}
        <h1 className="text-center text-white mb-12 text-4xl">ThreadHub</h1>

        {/* Login Form */}
        <div className="space-y-4 mb-6">
          {/* Username Input */}
          <div>
            <input
              type="text"
              placeholder="Username"
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-[#4a4a4a] focus:outline-none transition-colors"
            />
          </div>

          {/* Password Input */}
          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-[#4a4a4a] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={onLogin}
          className="w-full bg-[#FF4500] hover:bg-[#ff5722] text-white rounded-lg px-4 py-3 font-medium transition-colors mb-4"
        >
          Log In
        </button>

        {/* Links */}
        <div className="flex justify-between text-sm">
          <button className="text-gray-400 hover:text-white transition-colors">
            Forgot Password?
          </button>
          <button className="text-gray-400 hover:text-white transition-colors">
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
}
