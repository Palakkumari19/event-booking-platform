import { Link } from "react-router-dom";

function EventCard({ event }) {
  const startDate = new Date(event.start_time);

  const date = startDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const time = startDate.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

  // Give each event card a different palette color
  // so the events page feels more like a designed
  // event catalogue rather than a generic dashboard.
  const palette = [
    {
      bg: "bg-[#9ED3DC]",
      accent: "bg-[#FEFD99]",
    },
    {
      bg: "bg-[#FCB7C7]",
      accent: "bg-[#9ED3DC]",
    },
    {
      bg: "bg-[#FEFD99]",
      accent: "bg-[#CA6180]",
    },
    {
      bg: "bg-[#CA6180]",
      accent: "bg-[#FEFD99]",
    },
  ];

  const colors = palette[event.id % palette.length];

  return (
    <article className="group overflow-hidden rounded-[1.5rem] border border-black/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(23,23,23,0.10)]">

      {/* Visual */}
      <div
        className={`relative h-64 overflow-hidden ${colors.bg} p-5`}
      >

        {/* Small label */}
        <div className="relative z-10 flex items-center justify-between">

          <span className="rounded-full border border-black/20 bg-white/30 px-3 py-1 text-[11px] font-bold uppercase tracking-widest backdrop-blur">
            Upcoming
          </span>

          <span className="text-xs font-bold tracking-widest">
            #{String(event.id).padStart(2, "0")}
          </span>

        </div>

        {/* Decorative shapes */}
        <div
          className={`absolute -right-12 -top-16 h-44 w-44 rounded-full ${colors.accent} transition duration-500 group-hover:scale-110`}
        />

        <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-black/10 transition duration-500 group-hover:translate-x-3" />

        {/* Event symbol */}
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/45">
              EVENTLY / LIVE
            </p>

            <div className="mt-2 text-6xl leading-none transition duration-300 group-hover:scale-105">
              ✦
            </div>
          </div>

          <div className="rounded-full bg-[#171717] px-4 py-2 text-xs font-bold text-white">
            {date}
          </div>

        </div>

      </div>

      {/* Content */}
      <div className="p-6">

        <div className="min-h-[88px]">

          <h3 className="text-2xl font-black leading-tight tracking-[-0.03em] text-[#171717]">
            {event.title}
          </h3>

          <p className="mt-3 text-sm font-medium text-[#171717]/50">
            📍 {event.venue}
          </p>

        </div>

        <div className="mt-5 flex items-end justify-between border-t border-black/10 pt-5">

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#171717]/35">
              Starts
            </p>

            <p className="mt-1 text-sm font-semibold text-[#171717]/70">
              {time}
            </p>
          </div>

          <Link
            to={`/events/${event.id}`}
            className="group/button inline-flex items-center gap-3 rounded-full bg-[#171717] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#CA6180]"
          >
            View event

            <span className="transition-transform group-hover/button:translate-x-1">
              →
            </span>
          </Link>

        </div>

      </div>

    </article>
  );
}

export default EventCard;