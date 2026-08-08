import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/events");
  };

  return (
    <header className="border-b border-white/10 bg-[#09090b]">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link
          to="/events"
          className="text-xl font-bold tracking-tight"
        >
          EVENT
          <span className="text-indigo-400">
            LY
          </span>
        </Link>


        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex">

          <Link
            to="/events"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            Explore
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/my-bookings"
                className="text-sm text-zinc-400 transition hover:text-white"
              >
                My Bookings
              </Link>

              <Link
                to="/my-tickets"
                className="text-sm text-zinc-400 transition hover:text-white"
              >
                My Tickets
              </Link>
            </>
          )}

        </nav>


        {/* Right side */}
        <div className="flex items-center gap-4">

          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="text-sm text-zinc-300 transition hover:text-white"
              >
                Log in
              </Link>

              <Link
                to="/signup"
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-3 rounded-xl border border-white/10 px-3 py-2 transition hover:border-white/20 hover:bg-white/5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-semibold text-indigo-300">
                  {user?.first_name?.charAt(0)?.toUpperCase()}
                </div>

                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium text-white">
                    {user?.first_name}
                  </p>

                  <p className="text-xs text-zinc-500">
                    {user?.role}
                  </p>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="text-sm text-zinc-400 transition hover:text-white"
              >
                Logout
              </button>
            </>
          )}

        </div>

      </div>
    </header>
  );
}