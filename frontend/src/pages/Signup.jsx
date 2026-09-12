import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../api/auth";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "ATTENDEE",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.first_name.trim()) {
      setError("Please enter your first name.");
      return;
    }

    if (!formData.last_name.trim()) {
      setError("Please enter your last name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!formData.password) {
      setError("Please enter a password.");
      return;
    }

    try {
      setLoading(true);

      await registerUser(formData);

      setSuccess("Account created successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      console.error("Signup error:", err);

      const data = err.response?.data;

      if (data) {
        const messages = Object.entries(data)
          .map(([field, value]) => {
            const message = Array.isArray(value)
              ? value.join(" ")
              : value;

            return `${field}: ${message}`;
          })
          .join("\n");

        setError(messages);
      } else {
        setError(
          "Unable to create your account. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#fffdf7] px-6 py-12 text-[#171717]">

      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">

        {/* Intro */}
        <div className="hidden lg:block">

          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#CA6180]">
            EVENTLY / JOIN
          </p>

          <h1 className="mt-5 text-6xl font-black leading-[0.9] tracking-[-0.06em]">
            Come for
            <br />
            the event.
            <br />
            Stay for
            <br />
            <span className="text-[#CA6180]">
              the memories.
            </span>
          </h1>

          <p className="mt-7 max-w-sm text-base leading-7 text-black/50">
            Create your Evently account and start
            discovering concerts, festivals and
            experiences worth showing up for.
          </p>

        </div>

        {/* Form */}
        <div>

          <div className="mb-8 lg:hidden">

            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#CA6180]">
              EVENTLY / JOIN
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight">
              Create your account.
            </h1>

          </div>

          <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_20px_60px_rgba(23,23,23,0.06)]">

            {/* Form heading */}
            <div className="bg-[#FEFD99] p-7 sm:p-9">

              <p className="text-xs font-black uppercase tracking-[0.2em] text-black/45">
                Get started
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Your next event is waiting.
              </h2>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-7 sm:p-9"
            >

              {/* Names */}
              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black/50">
                    First name
                  </label>

                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Palak"
                    className="w-full rounded-xl border border-black/10 bg-[#fffdf7] px-4 py-3.5 text-sm text-[#171717] outline-none transition placeholder:text-black/25 focus:border-[#9ED3DC] focus:ring-2 focus:ring-[#9ED3DC]/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black/50">
                    Last name
                  </label>

                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Kumari"
                    className="w-full rounded-xl border border-black/10 bg-[#fffdf7] px-4 py-3.5 text-sm text-[#171717] outline-none transition placeholder:text-black/25 focus:border-[#9ED3DC] focus:ring-2 focus:ring-[#9ED3DC]/20"
                  />
                </div>

              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black/50">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-black/10 bg-[#fffdf7] px-4 py-3.5 text-sm text-[#171717] outline-none transition placeholder:text-black/25 focus:border-[#9ED3DC] focus:ring-2 focus:ring-[#9ED3DC]/20"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black/50">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="w-full rounded-xl border border-black/10 bg-[#fffdf7] px-4 py-3.5 text-sm text-[#171717] outline-none transition placeholder:text-black/25 focus:border-[#9ED3DC] focus:ring-2 focus:ring-[#9ED3DC]/20"
                />

                <p className="mt-2 text-xs text-black/35">
                  Use a strong password with letters,
                  numbers and symbols.
                </p>
              </div>

              {/* Account type */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black/50">
                  Account type
                </label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-black/10 bg-[#fffdf7] px-4 py-3.5 text-sm text-[#171717] outline-none transition focus:border-[#9ED3DC] focus:ring-2 focus:ring-[#9ED3DC]/20"
                >
                  <option value="ATTENDEE">
                    Attendee
                  </option>

                  <option value="ORGANIZER">
                    Organizer
                  </option>
                </select>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-[#CA6180]/25 bg-[#FCB7C7]/30 px-4 py-3">
                  <p className="whitespace-pre-line text-sm font-medium text-[#7d3049]">
                    {error}
                  </p>
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="rounded-xl border border-[#9ED3DC] bg-[#9ED3DC]/40 px-4 py-3">
                  <p className="text-sm font-semibold">
                    {success}
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#171717] py-3.5 text-sm font-bold text-white transition hover:bg-[#CA6180] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Creating account..."
                  : "Create account →"}
              </button>

            </form>

            {/* Login */}
            <div className="border-t border-black/10 px-7 py-5 text-center sm:px-9">

              <p className="text-sm text-black/45">
                Already have an account?{" "}

                <Link
                  to="/login"
                  className="font-bold text-[#CA6180] transition hover:text-[#171717]"
                >
                  Sign in
                </Link>
              </p>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}

export default Signup;