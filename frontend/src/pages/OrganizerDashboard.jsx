import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getOrganizerEvents } from "../api/events";

function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getOrganizerEvents();

        setEvents(data);
      } catch (err) {
        console.error(
          "Failed to load organizer events:",
          err
        );

        setError(
          "Unable to load your events."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const publishedEvents = events.filter(
    (event) => event.status === "PUBLISHED"
  ).length;

  const totalBookings = events.reduce(
    (total, event) =>
      total + Number(event.booking_count || 0),
    0
  );

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#fffdf7] px-6 py-10 md:py-14">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#CA6180]">
              Organizer / Dashboard
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-black md:text-5xl">
              Manage your events.
            </h1>

            <p className="mt-3 max-w-xl text-base leading-7 text-black/55">
              Create events, manage ticket sales and keep track
              of your attendees.
            </p>
          </div>

          <Link
            to="/organizer/events/create"
            className="rounded-full bg-black px-6 py-3 text-sm font-black text-white transition hover:bg-[#CA6180]"
          >
            + Create Event
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">

          <div className="rounded-3xl border border-black/10 bg-[#9ED3DC] p-6">
            <p className="text-xs font-black uppercase tracking-wider text-black/50">
              Total Events
            </p>

            <p className="mt-3 text-4xl font-black text-black">
              {events.length}
            </p>
          </div>

          <div className="rounded-3xl border border-black/10 bg-[#FEFD99] p-6">
            <p className="text-xs font-black uppercase tracking-wider text-black/50">
              Published
            </p>

            <p className="mt-3 text-4xl font-black text-black">
              {publishedEvents}
            </p>
          </div>

          <div className="rounded-3xl border border-black/10 bg-[#FCB7C7] p-6">
            <p className="text-xs font-black uppercase tracking-wider text-black/50">
              Total Bookings
            </p>

            <p className="mt-3 text-4xl font-black text-black">
              {totalBookings}
            </p>
          </div>

        </div>

        {/* Events */}
        <div className="mt-12">

          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-black/35">
                Your events
              </p>

              <h2 className="mt-1 text-2xl font-black text-black">
                Events
              </h2>
            </div>

            <span className="text-sm font-medium text-black/40">
              {events.length} event
              {events.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading && (
            <div className="rounded-3xl border border-black/10 bg-white p-10 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-[#CA6180]" />

              <p className="mt-4 text-sm font-medium text-black/45">
                Loading your events...
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-3xl border border-[#CA6180]/20 bg-[#FCB7C7]/30 p-6">
              <p className="font-bold text-[#7d3049]">
                {error}
              </p>
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="rounded-3xl border border-dashed border-black/15 bg-white p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FEFD99] text-2xl">
                +
              </div>

              <h3 className="mt-5 text-xl font-black text-black">
                No events yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-black/45">
                Create your first event and start managing
                registrations.
              </p>

              <Link
                to="/organizer/events/create"
                className="mt-6 inline-flex rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-[#CA6180]"
              >
                Create your first event →
              </Link>
            </div>
          )}

          {!loading && !error && events.length > 0 && (
            <div className="space-y-4">
              {events.map((event) => (
                <article
                  key={event.id}
                  className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_12px_35px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(0,0,0,0.07)]"
                >
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-black text-black">
                          {event.title}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            event.status === "PUBLISHED"
                              ? "bg-[#9ED3DC] text-black"
                              : event.status === "DRAFT"
                                ? "bg-[#FEFD99] text-black"
                                : event.status === "CANCELLED"
                                  ? "bg-[#FCB7C7] text-[#7d3049]"
                                  : "bg-black text-white"
                          }`}
                        >
                          {event.status}
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-medium text-black/45">
                        📍 {event.venue}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-black/45">
                        <span>
                          {new Date(
                            event.start_time
                          ).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>

                        <span>
                          {event.booking_count} booking
                          {event.booking_count !== 1
                            ? "s"
                            : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link
                        to={`/organizer/events/${event.id}`}
                        className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-bold text-black transition hover:border-black hover:bg-black hover:text-white"
                      >
                        Manage
                      </Link>

                      <Link
                        to={`/organizer/events/${event.id}/bookings`}
                        className="rounded-full bg-black px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#CA6180]"
                      >
                        Bookings
                      </Link>
                    </div>

                  </div>
                </article>
              ))}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}

export default OrganizerDashboard;