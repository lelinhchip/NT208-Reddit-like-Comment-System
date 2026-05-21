interface RegistrationScreenProps {
  onSignUp: () => void;
  onLoginClick: () => void;
}

export function RegistrationScreen({ onSignUp, onLoginClick }: RegistrationScreenProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-white mb-3 text-4xl">Join ThreadHub</h1>
          <p className="text-gray-400">Create an account to start posting and commenting.</p>
        </div>

        {/* Registration Form */}
        <div className="space-y-4 mb-6">
          {/* Email Input */}
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-[#4a4a4a] focus:outline-none transition-colors"
            />
          </div>

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

          {/* Confirm Password Input */}
          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-[#4a4a4a] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Sign Up Button */}
        <button
          onClick={onSignUp}
          className="w-full bg-[#FF4500] hover:bg-[#ff5722] text-white rounded-lg px-4 py-3 font-medium transition-colors mb-6"
        >
          Sign Up
        </button>

        {/* Footer Link */}
        <div className="text-center">
          <span className="text-gray-400">Already have an account? </span>
          <button
            onClick={onLoginClick}
            className="text-[#FF4500] hover:text-[#ff5722] transition-colors font-medium"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}
