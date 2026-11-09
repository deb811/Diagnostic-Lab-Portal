
import { useState } from "react";
import { Activity, LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./index.css";

function StaffLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  function handleLogin() {
    if (username === "admin" && password === "admin123") {
      sessionStorage.setItem("staffLoggedIn", "true");
      navigate("/admin");
    } else {
      setError("Invalid username or password.");
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="logo">
          <Activity size={32} />
        </div>

        <h1>Staff Login</h1>

        <p className="subtitle">
          Diagnostic Lab Staff Portal
        </p>

        <label>Username</label>

        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label>Password</label>

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="error-message">{error}</p>
        )}

        <button onClick={handleLogin}>
          <LockKeyhole size={18} />
          Login
        </button>

        <p className="hint">
          Demo username: admin
        </p>

        <p className="hint">
          Demo password: admin123
        </p>

      </div>
    </div>
  );
}

export default StaffLogin;
