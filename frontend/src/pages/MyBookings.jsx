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
        return "bg-[#9ED3DC] text-[#171717]";

      case "PENDING":
        return "bg-[#FEFD99] text-[#171717]";

      case "CANCELLED":
        return "bg-[#FCB7C7] text-[#7d3049]";

      default:
        return "bg-black/10 text-black/50";
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#fffdf7] px-6 py-12 text-[#171717]">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-10">

          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#CA6180]" />

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/45">
              EVENTLY / BOOKINGS
            </p>
          </div>

          <h1 className="mt-4 text-5xl font-black tracking-[-0.05em] md:text-6xl">
            My bookings.
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-black/50">
            Keep track of your reservations,
            payments and upcoming experiences.
          </p>

        </div>

        {/* Error */}
        {!loading && error && (
          <div className="mb-6 rounded-2xl border border-[#CA6180]/25 bg-[#FCB7C7]/30 p-5 text-sm font-medium text-[#7d3049]">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex min-h-64 items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-black/10 border-t-[#CA6180]" />
          </div>
        )}

        {/* Empty */}
        {!loading && bookings.length === 0 && !error && (
          <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white">

            <div className="bg-[#FEFD99] p-8 sm:p-12">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-black/45">
                Nothing booked yet
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Your next plan starts here.
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-black/55">
                Explore upcoming events and find
                something worth going to.
              </p>

              <Link
                to="/events"
                className="mt-7 inline-flex rounded-full bg-[#171717] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#CA6180]"
              >
                Explore events →
              </Link>
            </div>

          </div>
        )}

        {/* Bookings */}
        {!loading && bookings.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">

            {bookings.map((booking, index) => (
              <article
                key={booking.id}
                className="overflow-hidden rounded-[1.75rem] border border-black/10 bg-white shadow-[0_12px_40px_rgba(23,23,23,0.04)] transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(23,23,23,0.08)]"
              >

                {/* Colour header */}
                <div
                  className={`p-6 ${
                    index % 3 === 0
                      ? "bg-[#9ED3DC]"
                      : index % 3 === 1
                        ? "bg-[#FCB7C7]"
                        : "bg-[#FEFD99]"
                  }`}
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-black/45">
                        Booking #{booking.id}
                      </p>

                      <h2 className="mt-2 text-2xl font-black leading-tight tracking-[-0.03em]">
                        {booking.event?.title ||
                          "Event"}
                      </h2>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${getStatusClasses(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>

                  </div>

                </div>

                {/* Details */}
                <div className="p-6">

                  <div className="space-y-5">

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-black/35">
                        Venue
                      </p>

                      <p className="mt-1.5 font-semibold">
                        {booking.venue}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-5">

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-black/35">
                          Seat
                        </p>

                        <p className="mt-1.5 font-bold">
                          {booking.seat}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-black/35">
                          Price
                        </p>

                        <p className="mt-1.5 font-bold">
                          ₹{booking.price}
                        </p>
                      </div>

                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-black/35">
                        Booked on
                      </p>

                      <p className="mt-1.5 text-sm font-medium text-black/60">
                        {formatDate(
                          booking.booked_at
                        )}
                      </p>
                    </div>

                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-wrap gap-3 border-t border-black/10 pt-5">

                    {booking.status ===
                      "CONFIRMED" && (
                      <Link
                        to="/tickets"
                        className="rounded-full bg-[#171717] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#CA6180]"
                      >
                        View ticket →
                      </Link>
                    )}

                    {booking.status ===
                      "PENDING" && (
                      <Link
                        to="/checkout"
                        className="rounded-full bg-[#171717] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#CA6180]"
                      >
                        Continue payment →
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
                        className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold text-black/55 transition hover:border-[#CA6180]/30 hover:bg-[#FCB7C7]/25 hover:text-[#7d3049] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {cancellingId ===
                        booking.id
                          ? "Cancelling..."
                          : "Cancel booking"}
                      </button>
                    )}

                  </div>

                </div>
              </article>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}

export default MyBookings;