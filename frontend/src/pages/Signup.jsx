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
        <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center px-6 py-12">

            <div className="w-full max-w-xl">

                {/* Heading */}
                <div className="text-center mb-10">

                    <p className="text-sm font-semibold tracking-[0.2em] uppercase text-indigo-400 mb-4">
                        Join Evently
                    </p>

                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                        Create your account
                    </h1>

                    <p className="text-zinc-400 mt-4 text-lg">
                        Join Evently and start booking experiences.
                    </p>

                </div>

                {/* Form Card */}
                <div className="bg-[#151518] border border-zinc-800 rounded-2xl p-8 md:p-10">

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* First + Last name */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    First name
                                </label>

                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="Palak"
                                    className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 outline-none focus:border-indigo-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Last name
                                </label>

                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Kumari"
                                    className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 outline-none focus:border-indigo-500 transition"
                                />
                            </div>

                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 outline-none focus:border-indigo-500 transition"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a strong password"
                                className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 outline-none focus:border-indigo-500 transition"
                            />

                            <p className="text-xs text-zinc-500 mt-2">
                                Use a strong password with letters, numbers and symbols.
                            </p>
                        </div>

                        {/* Account type */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Account type
                            </label>

                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-3.5 text-white outline-none focus:border-indigo-500 transition"
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
                            <div className="bg-red-950/50 border border-red-900 rounded-xl px-4 py-3">
                                <p className="text-red-400 text-sm whitespace-pre-line">
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Success */}
                        {success && (
                            <div className="bg-emerald-950/50 border border-emerald-900 rounded-xl px-4 py-3">
                                <p className="text-emerald-400 text-sm">
                                    {success}
                                </p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black font-semibold rounded-xl py-3.5 hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? "Creating account..."
                                : "Create account"}
                        </button>

                    </form>

                    {/* Login link */}
                    <div className="text-center mt-7">

                        <p className="text-zinc-500 text-sm">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="text-indigo-400 hover:text-indigo-300 font-medium"
                            >
                                Sign in
                            </Link>
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Signup;