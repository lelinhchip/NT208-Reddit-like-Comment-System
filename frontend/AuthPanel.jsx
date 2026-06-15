import { useState } from "react";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "../api/userApi";

function AuthPanel({ onAuthChange }) {
  const [mode, setMode] = useState("login");
  const [user, setUser] = useState(getCurrentUser());
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      const result =
        mode === "login"
          ? await loginUser({ username, password })
          : await registerUser({ username, email, password });

      setUser(result.user);
      setUsername("");
      setEmail("");
      setPassword("");
      setError("");
      onAuthChange?.(result.user);
    } catch (error) {
      setError(error.message || "Khong the xac thuc user.");
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    onAuthChange?.(null);
  };

  if (user) {
    return (
      <div className="auth-panel">
        <span>Dang nhap: {user.username}</span>
        <button onClick={handleLogout}>Dang xuat</button>
      </div>
    );
  }

  return (
    <div className="auth-panel">
      <div className="auth-tabs">
        <button onClick={() => setMode("login")} disabled={mode === "login"}>
          Dang nhap
        </button>
        <button onClick={() => setMode("register")} disabled={mode === "register"}>
          Dang ky
        </button>
      </div>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
      />
      {mode === "register" && (
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      )}
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <button onClick={handleSubmit}>
        {mode === "login" ? "Dang nhap" : "Dang ky"}
      </button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default AuthPanel;
