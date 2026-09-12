import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import {
  getNotifications,
  markNotificationRead,
} from "../api/notifications";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const notificationRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const fetchNotifications = async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    try {
      setLoadingNotifications(true);

      const data = await getNotifications();

      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.is_read) {
        await markNotificationRead(notification.id);

        setNotifications((currentNotifications) =>
          currentNotifications.map((item) =>
            item.id === notification.id
              ? { ...item, is_read: true }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#fffdf7]/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-black tracking-[-0.05em] text-[#171717] transition-opacity hover:opacity-70"
        >
          EVENT<span className="text-[#CA6180]">LY</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex">

          <Link
            to="/events"
            className="text-sm font-medium text-[#171717]/60 transition hover:text-[#CA6180]"
          >
            Explore
          </Link>

          {isAuthenticated && (
            <>
              {user?.role === "ORGANIZER" && (
                <Link
                  to="/organizer"
                  className="text-sm font-medium text-[#171717]/60 transition hover:text-[#CA6180]"
                >
                  Organizer
                </Link>
              )}

              <Link
                to="/my-bookings"
                className="text-sm font-medium text-[#171717]/60 transition hover:text-[#CA6180]"
              >
                My Bookings
              </Link>

              <Link
                to="/tickets"
                className="text-sm font-medium text-[#171717]/60 transition hover:text-[#CA6180]"
              >
                My Tickets
              </Link>
            </>
          )}

        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">

          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="hidden text-sm font-medium text-[#171717]/60 transition hover:text-[#CA6180] sm:block"
              >
                Log in
              </Link>

              <Link
                to="/signup"
                className="rounded-full bg-[#171717] px-5 py-2.5 text-sm font-semibold text-[#fffdf7] transition hover:-translate-y-0.5 hover:bg-[#CA6180]"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              {/* Notifications */}
              <div
                ref={notificationRef}
                className="relative"
              >
                <button
                  type="button"
                  onClick={() =>
                    setShowNotifications((current) => !current)
                  }
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-transparent text-[#171717]/70 transition hover:border-black/20 hover:bg-[#9ED3DC]/20 hover:text-[#171717]"
                  aria-label="Notifications"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9a6 6 0 1 0-12 0v.75a8.967 8.967 0 0 1-2.31 6.022c1.733.64 3.56 1.1 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                    />
                  </svg>

                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#CA6180] px-1 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-black/10 bg-[#fffdf7] shadow-[0_20px_60px_rgba(23,23,23,0.15)]">

                    <div className="flex items-center justify-between border-b border-black/10 px-4 py-4">

                      <div>
                        <h3 className="text-sm font-bold text-[#171717]">
                          Notifications
                        </h3>

                        <p className="mt-0.5 text-xs text-[#171717]/45">
                          {unreadCount > 0
                            ? `${unreadCount} unread`
                            : "You're all caught up"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={fetchNotifications}
                        className="text-xs font-medium text-[#171717]/45 transition hover:text-[#CA6180]"
                      >
                        Refresh
                      </button>

                    </div>

                    <div className="max-h-96 overflow-y-auto">

                      {loadingNotifications ? (
                        <div className="px-4 py-8 text-center text-sm text-[#171717]/45">
                          Loading notifications...
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">

                          <div className="mb-2 text-2xl">
                            ♡
                          </div>

                          <p className="text-sm text-[#171717]/55">
                            No notifications yet.
                          </p>

                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <button
                            key={notification.id}
                            type="button"
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                            className={`w-full border-b border-black/5 px-4 py-4 text-left transition hover:bg-[#9ED3DC]/10 ${
                              notification.is_read
                                ? "bg-transparent"
                                : "bg-[#FEFD99]/25"
                            }`}
                          >
                            <div className="flex gap-3">

                              <div
                                className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                                  notification.is_read
                                    ? "bg-black/15"
                                    : "bg-[#CA6180]"
                                }`}
                              />

                              <div className="min-w-0">

                                <p
                                  className={`text-sm ${
                                    notification.is_read
                                      ? "font-medium text-[#171717]/55"
                                      : "font-bold text-[#171717]"
                                  }`}
                                >
                                  {notification.title}
                                </p>

                                <p className="mt-1 text-xs leading-5 text-[#171717]/50">
                                  {notification.message}
                                </p>

                                <p className="mt-2 text-[10px] text-[#171717]/35">
                                  {new Date(
                                    notification.created_at
                                  ).toLocaleString()}
                                </p>

                              </div>
                            </div>
                          </button>
                        ))
                      )}

                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <Link
                to="/profile"
                className="flex items-center gap-3 rounded-full border border-black/10 px-3 py-1.5 transition hover:border-black/20 hover:bg-[#9ED3DC]/10"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9ED3DC] text-sm font-bold text-[#171717]">
                  {user?.first_name
                    ?.charAt(0)
                    ?.toUpperCase()}
                </div>

                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-[#171717]">
                    {user?.first_name}
                  </p>

                  <p className="text-[10px] font-medium uppercase tracking-wider text-[#171717]/40">
                    {user?.role}
                  </p>
                </div>
              </Link>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="hidden text-sm font-medium text-[#171717]/55 transition hover:text-[#CA6180] sm:block"
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