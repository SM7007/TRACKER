import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthShell from "../components/AuthShell.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(username, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Could not create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Start tracking"
      title="Create account"
      subtitle="One tracker, all your courses"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-ink2-muted mb-1.5">
            Username
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-raised border border-rule rounded-lg px-3.5 py-2.5 text-ink2-text placeholder:text-ink2-faint focus:border-amber outline-none transition"
            placeholder="ada_lovelace"
            autoComplete="username"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-ink2-muted mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-raised border border-rule rounded-lg px-3.5 py-2.5 text-ink2-text placeholder:text-ink2-faint focus:border-amber outline-none transition"
            placeholder="At least 6 characters"
            autoComplete="new-password"
            required
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber text-on-accent font-semibold rounded-lg py-2.5 hover:bg-amber-soft transition disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-sm text-ink2-muted text-center mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-amber hover:text-amber-soft">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
