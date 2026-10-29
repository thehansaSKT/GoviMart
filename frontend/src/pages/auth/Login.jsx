import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { loginUser } from "../../services/authService";
import "./Auth.css";

export default function Login() {
  const { role } = useParams();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!["farmer", "consumer"].includes(role)) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Invalid account type</h1>
          <Link to="/">Choose an account type</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(username, password, role);

      if (data.user.role !== role) {
        setError("Please log in using the correct account type.");
        return;
      }

      navigate(role === "farmer" ? "/farmer/dashboard" : "/consumer");
    } catch (err) {
      setError(err.message || "Unable to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-logo">GoviMart</div>

        <h1>{role === "farmer" ? "Farmer Login" : "Consumer Login"}</h1>
        <p>Welcome back! Log in to your account.</p>

        {error && <div className="auth-error">{error}</div>}

        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register now</Link>
        </p>

        <p className="auth-footer">
          <Link to="/">← Back to account selection</Link>
        </p>
      </form>
    </div>
  );
}