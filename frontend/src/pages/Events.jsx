import { useEffect, useState } from "react";

import EventCard from "../components/EventCard";
import { getEvents } from "../api/events";

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents();

        setEvents(data);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load events. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">

      {/* Header */}
      <div className="mb-10">

        <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
          Explore
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-white md:text-5xl">
          Upcoming Events
        </h1>

        <p className="mt-4 max-w-2xl text-zinc-400">
          Find concerts, festivals and experiences
          worth remembering.
        </p>

      </div>

      {/* Loading */}
      {loading && (
        <div className="flex min-h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-400" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && events.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-12 text-center">
          <p className="text-lg text-zinc-300">
            No upcoming events found.
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            Check back soon for new experiences.
          </p>
        </div>
      )}

      {/* Events */}
      {!loading && !error && events.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
            />
          ))}

        </div>
      )}

    </div>
  );
}

export default Events;