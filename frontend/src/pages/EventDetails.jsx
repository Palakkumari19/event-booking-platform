import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getEvent } from "../api/events";

function EventDetails() {
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await getEvent(eventId);
        setEvent(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load this event.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-400" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
          {error || "Event not found."}
        </div>
      </div>
    );
  }

  const startDate = new Date(event.start_time);

  const date = startDate.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const time = startDate.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">

      {/* Back */}
      <Link
        to="/events"
        className="text-sm text-zinc-400 transition hover:text-white"
      >
        ← Back to events
      </Link>

      {/* Hero */}
      <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-zinc-900">

        <div className="relative flex min-h-[360px] items-end overflow-hidden bg-gradient-to-br from-indigo-950 via-zinc-900 to-zinc-950 p-8 md:p-12">

          <div className="absolute right-12 top-10 text-[120px] opacity-20">
            🎵
          </div>

          <div className="relative">

            <span className="inline-flex rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-xs font-medium text-indigo-300">
              Upcoming Event
            </span>

            <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-white md:text-6xl">
              {event.title}
            </h1>

            <p className="mt-5 text-lg text-zinc-300">
              📍 {event.venue.name}
            </p>

          </div>

        </div>

        {/* Details */}
        <div className="grid gap-6 border-t border-white/10 p-8 md:grid-cols-3">

          <div>
            <p className="text-sm text-zinc-500">
              Date
            </p>

            <p className="mt-2 font-medium text-white">
              {date}
            </p>
          </div>

          <div>
            <p className="text-sm text-zinc-500">
              Time
            </p>

            <p className="mt-2 font-medium text-white">
              {time}
            </p>
          </div>

          <div>
            <p className="text-sm text-zinc-500">
              Venue
            </p>

            <p className="mt-2 font-medium text-white">
              {event.venue.name}
            </p>
          </div>

        </div>

      </section>

      {/* Seat / Section information */}
      <section className="mt-12">

        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
            Tickets
          </p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            Choose your experience
          </h2>

          <p className="mt-3 text-zinc-400">
            Select a ticket category and continue to seat selection.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {event.sections?.map((section) => (
            <div
              key={section.id}
              className="rounded-2xl border border-white/10 bg-zinc-900 p-6 transition hover:border-white/20"
            >

              <div className="flex items-start justify-between">

                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {section.name}
                  </h3>

                  <p className="mt-2 text-sm text-zinc-500">
                    Ticket category
                  </p>
                </div>

                <span className="rounded-lg bg-white/5 px-3 py-2 text-sm text-zinc-300">
                  ₹{section.price}
                </span>

              </div>

            </div>
          ))}

        </div>

        {/* CTA */}
        <div className="mt-10 flex justify-end">

          <Link
            to={`/events/${event.id}/seats`}
            className="rounded-xl bg-indigo-500 px-7 py-3 font-medium text-white transition hover:bg-indigo-400"
          >
            Choose Seats →
          </Link>

        </div>

      </section>

    </div>
  );
}

export default EventDetails;