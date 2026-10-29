import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";
import "./Auth.css";

const initialForm = {
  name: "",
  username: "",
  email: "",
  password: "",
  phone: "",
  farmName: "",
  address: "",
  district: "",
};

export default function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState("consumer");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (role === "farmer" && !form.farmName.trim()) {
      setError("Please enter your farm name.");
      return;
    }

    setLoading(true);

    try {
      const data = await registerUser({
        ...form,
        role,
      });

      navigate(
        data.user.role === "farmer"
          ? "/farmer/dashboard"
          : "/consumer"
      );
    } catch (err) {
      setError(err.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card register-card" onSubmit={handleSubmit}>
        <div className="auth-logo">GoviMart</div>

        <h1>Create an Account</h1>
        <p>Join the GoviMart community.</p>

        {error && <div className="auth-error">{error}</div>}

        <label htmlFor="role">Register as</label>
        <select
          id="role"
          value={role}
          onChange={(event) => setRole(event.target.value)}
        >
          <option value="consumer">Consumer</option>
          <option value="farmer">Farmer</option>
        </select>

        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          name="name"
          value={form.name}
          onChange={updateField}
          minLength={2}
          maxLength={100}
          autoComplete="name"
          required
        />

        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          value={form.username}
          onChange={updateField}
          minLength={3}
          maxLength={30}
          pattern="[A-Za-z0-9_]+"
          title="Use letters, numbers, and underscores only."
          autoComplete="username"
          required
        />

        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={updateField}
          autoComplete="email"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={updateField}
          minLength={8}
          autoComplete="new-password"
          required
        />

        <label htmlFor="phone">Phone Number</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={updateField}
          autoComplete="tel"
        />

        {role === "farmer" && (
          <>
            <label htmlFor="farmName">Farm Name</label>
            <input
              id="farmName"
              name="farmName"
              value={form.farmName}
              onChange={updateField}
              required
            />
          </>
        )}

        <label htmlFor="district">District</label>
        <input
          id="district"
          name="district"
          value={form.district}
          onChange={updateField}
          placeholder="e.g. Matara"
          autoComplete="address-level2"
          required
        />

        <label htmlFor="address">Address</label>
        <textarea
          id="address"
          name="address"
          value={form.address}
          onChange={updateField}
          rows={3}
          autoComplete="street-address"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to={`/login/${role}`}>Login here</Link>
        </p>

        <p className="auth-footer">
          <Link to="/">← Back to home</Link>
        </p>
      </form>
    </div>
  );
}