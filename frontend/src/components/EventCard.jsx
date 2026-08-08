import { Link } from "react-router-dom";

function EventCard({ event }) {
  const startDate = new Date(event.start_time);

  const date = startDate.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );

  const time = startDate.toLocaleTimeString(
    "en-IN",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  );

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 transition duration-300 hover:-translate-y-1 hover:border-white/20">

      {/* Event image placeholder */}
      <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-zinc-900 to-zinc-950">

        <span className="text-6xl transition duration-300 group-hover:scale-110">
          🎵
        </span>

        <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-medium text-zinc-300 backdrop-blur">
          Upcoming
        </div>

      </div>

      {/* Content */}
      <div className="p-5">

        <h3 className="text-xl font-semibold text-white">
          {event.title}
        </h3>

        <p className="mt-2 text-sm text-zinc-400">
          📍 {event.venue}
        </p>

        <div className="mt-4 flex items-center justify-between text-sm">

          <div>
            <p className="text-zinc-500">
              {date}
            </p>

            <p className="mt-1 text-zinc-300">
              {time}
            </p>
          </div>

          <Link
            to={`/events/${event.id}`}
            className="rounded-lg bg-white px-4 py-2 font-medium text-zinc-950 transition hover:bg-zinc-200"
          >
            View Event
          </Link>

        </div>

      </div>

    </article>
  );
}

export default EventCard;