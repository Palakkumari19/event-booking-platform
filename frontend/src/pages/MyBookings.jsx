import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  cancelBooking,
  getMyBookings,
} from "../api/bookings";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getMyBookings();
        setBookings(data);
      } catch (err) {
        console.error("Failed to load bookings:", err);
        setError("Unable to load your bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking? If you have already paid, a refund will be initiated."
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(bookingId);
      setError("");

      const updatedBooking = await cancelBooking(
        bookingId
      );

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                ...updatedBooking,
                status:
                  updatedBooking?.status ||
                  "CANCELLED",
              }
            : booking
        )
      );
    } catch (err) {
      console.error(
        "Failed to cancel booking:",
        err
      );

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to cancel this booking.";

      setError(message);
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return "—";
    }

    return new Date(dateString).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-400/10 text-emerald-300";

      case "PENDING":
        return "bg-yellow-400/10 text-yellow-300";

      case "CANCELLED":
        return "bg-red-400/10 text-red-300";

      default:
        return "bg-zinc-400/10 text-zinc-300";
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
            Your bookings
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
            My Bookings
          </h1>

          <p className="mt-4 text-zinc-400">
            Manage your event bookings and reservations.
          </p>
        </div>

        {/* Error */}
        {!loading && error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex min-h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-400" />
          </div>
        )}

        {/* Empty */}
        {!loading && bookings.length === 0 && !error && (
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-12 text-center">
            <p className="text-xl font-medium text-zinc-200">
              No bookings yet.
            </p>

            <p className="mt-2 text-zinc-500">
              Your event bookings will appear here.
            </p>

            <Link
              to="/events"
              className="mt-6 inline-flex rounded-xl bg-white px-6 py-3 font-medium text-black transition hover:bg-zinc-200"
            >
              Explore Events
            </Link>
          </div>
        )}

        {/* Bookings */}
        {!loading && bookings.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">

            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-2xl border border-white/10 bg-zinc-900 p-6 transition hover:border-white/20"
              >

                {/* Top section */}
                <div className="flex items-start justify-between gap-4">

                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-indigo-400">
                      Booking #{booking.id}
                    </p>

                    <h2 className="mt-2 text-xl font-semibold text-white">
                      {booking.event?.title ||
                        "Event"}
                    </h2>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>

                </div>

                {/* Booking information */}
                <div className="mt-6 space-y-4">

                  <div>
                    <p className="text-sm text-zinc-500">
                      Venue
                    </p>

                    <p className="mt-1 text-zinc-200">
                      {booking.venue}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">

                    <div>
                      <p className="text-sm text-zinc-500">
                        Seat
                      </p>

                      <p className="mt-1 font-medium text-zinc-200">
                        {booking.seat}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-zinc-500">
                        Price
                      </p>

                      <p className="mt-1 font-medium text-zinc-200">
                        ₹{booking.price}
                      </p>
                    </div>

                  </div>

                  <div>
                    <p className="text-sm text-zinc-500">
                      Booked on
                    </p>

                    <p className="mt-1 text-zinc-200">
                      {formatDate(
                        booking.booked_at
                      )}
                    </p>
                  </div>

                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-5">

                  {booking.status ===
                    "CONFIRMED" && (
                    <Link
                      to="/tickets"
                      className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
                    >
                      View Ticket
                    </Link>
                  )}

                  {booking.status ===
                    "PENDING" && (
                    <Link
                      to="/checkout"
                      className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
                    >
                      Continue Payment
                    </Link>
                  )}

                  {booking.status !==
                    "CANCELLED" && (
                    <button
                      type="button"
                      onClick={() =>
                        handleCancel(
                          booking.id
                        )
                      }
                      disabled={
                        cancellingId ===
                        booking.id
                      }
                      className="rounded-xl border border-red-500/30 px-5 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {cancellingId ===
                      booking.id
                        ? "Cancelling..."
                        : "Cancel Booking"}
                    </button>
                  )}

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default MyBookings;