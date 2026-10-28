import { Link } from "react-router-dom";
import "./Auth.css";

export default function ChooseAccount() {
  return (
    <div className="auth-page">
      <div className="auth-card choose-account-card">
        <h1>Welcome to GoviMart</h1>
        <p>Fresh from farmers to your home.</p>
        <p>Choose your account type to continue.</p>

        <div className="account-options">
          <Link to="/login/farmer" className="account-option">
            <span className="account-icon">🌱</span>
            <h2>Farmer</h2>
            <p>Sell your farm products and manage orders.</p>
            <span className="account-link">Continue as Farmer →</span>
          </Link>

          <Link to="/login/consumer" className="account-option">
            <span className="account-icon">🛒</span>
            <h2>Consumer</h2>
            <p>Discover fresh products and order online.</p>
            <span className="account-link">Continue as Consumer →</span>
          </Link>
        </div>

        <p className="auth-footer">
          New to GoviMart? <Link to="/register">Create an account</Link>
        </p>

        <p className="auth-footer">
          <Link to="/consumer">Browse products as a visitor</Link>
        </p>
      </div>
    </div>
  );
}