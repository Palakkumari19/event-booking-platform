import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const currentUser = await login(
        formData.email,
        formData.password
      );

      if (currentUser.role === "ORGANIZER") {
        navigate("/organizer");
      } else {
        navigate("/events");
      }
    } catch (err) {
      console.error(err);

      const responseData = err.response?.data;

      if (typeof responseData === "string") {
        setError(responseData);
      } else if (responseData?.detail) {
        setError(responseData.detail);
      } else if (responseData?.non_field_errors?.[0]) {
        setError(responseData.non_field_errors[0]);
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#fffdf7] px-6 py-12">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] md:grid-cols-2">

        {/* Left visual panel */}
        <section className="relative hidden min-h-[560px] overflow-hidden bg-[#9ED3DC] p-10 md:block">
          <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#FEFD99]" />
          <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#FCB7C7]" />

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <p className="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-black/60">
                EVENTLY
              </p>

              <h1 className="max-w-md text-5xl font-black leading-[0.95] tracking-tight text-black">
                Your next
                <br />
                event is
                <br />
                waiting.
              </h1>

              <p className="mt-6 max-w-sm text-base leading-7 text-black/70">
                Discover campus events, grab your seat, and keep
                every ticket in one place.
              </p>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white/70 p-5 backdrop-blur-sm">
              <p className="text-sm font-bold text-black">
                🎟️ One account. Every event.
              </p>
              <p className="mt-1 text-sm text-black/60">
                Book seats, manage bookings, and access your tickets.
              </p>
            </div>
          </div>
        </section>

        {/* Login form */}
        <section className="flex items-center p-7 sm:p-10 md:p-12">
          <div className="w-full max-w-md mx-auto">

            <div className="mb-8">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#CA6180]">
                Welcome back
              </p>

              <h2 className="text-4xl font-black tracking-tight text-black">
                Log in
              </h2>

              <p className="mt-2 text-sm leading-6 text-black/55">
                Sign in to continue exploring events.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-[#CA6180]/30 bg-[#FCB7C7]/40 px-4 py-3 text-sm font-medium text-[#7d3049]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-black"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-black/15 bg-[#fffdf7] px-4 py-3.5 text-sm text-black outline-none transition placeholder:text-black/30 focus:border-[#CA6180] focus:ring-4 focus:ring-[#FCB7C7]/40"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-bold text-black"
                >
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-black/15 bg-[#fffdf7] px-4 py-3.5 text-sm text-black outline-none transition placeholder:text-black/30 focus:border-[#CA6180] focus:ring-4 focus:ring-[#FCB7C7]/40"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-black px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#CA6180] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in →"}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-black/10" />
              <span className="text-xs font-medium text-black/35">
                OR
              </span>
              <div className="h-px flex-1 bg-black/10" />
            </div>

            <p className="text-center text-sm text-black/55">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-bold text-[#CA6180] transition hover:text-black"
              >
                Create one
              </Link>
            </p>

          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;