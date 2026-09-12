import { useEffect, useState } from "react";

import EventCard from "../components/EventCard";
import { getEvents } from "../api/events";

function Events() {
  const [events, setEvents] = useState([]);

  const [search, setSearch] = useState("");
  const [venue, setVenue] = useState("");
  const [upcoming, setUpcoming] = useState(false);
  const [ordering, setOrdering] = useState("start_time");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvents = async (filters = {}) => {
    try {
      setLoading(true);
      setError("");

      const data = await getEvents(filters);

      setEvents(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSearch = () => {
    fetchEvents({
      search,
      venue,
      upcoming,
      ordering,
    });
  };

  const handleClearFilters = () => {
    setSearch("");
    setVenue("");
    setUpcoming(false);
    setOrdering("start_time");

    fetchEvents();
  };

  const handleUpcomingChange = (event) => {
    const checked = event.target.checked;

    setUpcoming(checked);

    fetchEvents({
      search,
      venue,
      upcoming: checked,
      ordering,
    });
  };

  const handleOrderingChange = (event) => {
    const value = event.target.value;

    setOrdering(value);

    fetchEvents({
      search,
      venue,
      upcoming,
      ordering: value,
    });
  };

  const hasFilters =
    search ||
    venue ||
    upcoming ||
    ordering !== "start_time";

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#fffdf7] text-[#171717]">

      <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">

        {/* Header */}
        <section className="mb-10">

          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#CA6180]" />

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#171717]/55">
              EVENTLY / EXPLORE
            </p>
          </div>

          <div className="mt-5 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

            <div>
              <h1 className="max-w-3xl text-5xl font-black tracking-[-0.05em] sm:text-6xl lg:text-7xl">
                Find something
                <br />
                worth{" "}
                <span className="text-[#CA6180]">
                  going to.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-[#171717]/55">
                Concerts, festivals, campus events and
                experiences happening around you.
              </p>
            </div>

            <div className="hidden border-l border-black/10 pl-6 text-right lg:block">
              <p className="text-4xl font-black">
                {events.length.toString().padStart(2, "0")}
              </p>

              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#171717]/40">
                Events
              </p>
            </div>

          </div>

        </section>

        {/* Search */}
        <section className="mb-12 rounded-[1.5rem] border border-black/10 bg-white p-3 shadow-[0_12px_40px_rgba(23,23,23,0.05)]">

          <div className="flex flex-col gap-3 lg:flex-row">

            {/* Search input */}
            <div className="relative flex-1">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#171717]/35"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6.04 6.04a7.5 7.5 0 0 0 10.61 10.61Z"
                />
              </svg>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="Search events..."
                className="w-full rounded-xl border border-black/10 bg-[#fffdf7] py-3.5 pl-12 pr-4 text-sm text-[#171717] outline-none transition placeholder:text-[#171717]/35 focus:border-[#9ED3DC] focus:ring-2 focus:ring-[#9ED3DC]/20"
              />

            </div>

            <button
              type="button"
              onClick={handleSearch}
              className="rounded-xl bg-[#171717] px-7 py-3.5 text-sm font-semibold text-[#fffdf7] transition hover:-translate-y-0.5 hover:bg-[#CA6180]"
            >
              Search
            </button>

          </div>

          {/* Filters */}
          <div className="mt-3 flex flex-col gap-3 border-t border-black/5 pt-3 md:flex-row md:items-center">

            <div className="flex-1">

              <input
                type="text"
                value={venue}
                onChange={(event) =>
                  setVenue(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="Filter by venue..."
                className="w-full rounded-xl border border-black/10 bg-[#fffdf7] px-4 py-3 text-sm text-[#171717] outline-none transition placeholder:text-[#171717]/35 focus:border-[#9ED3DC] focus:ring-2 focus:ring-[#9ED3DC]/20"
              />

            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#171717]/60 transition hover:bg-[#FEFD99]/30">

              <input
                type="checkbox"
                checked={upcoming}
                onChange={handleUpcomingChange}
                className="h-4 w-4 rounded border-black/20 bg-white text-[#CA6180] focus:ring-[#CA6180]"
              />

              <span>
                Upcoming only
              </span>

            </label>

            <select
              value={ordering}
              onChange={handleOrderingChange}
              className="rounded-xl border border-black/10 bg-[#fffdf7] px-4 py-3 text-sm font-medium text-[#171717] outline-none transition focus:border-[#9ED3DC] focus:ring-2 focus:ring-[#9ED3DC]/20"
            >
              <option value="start_time">
                Earliest first
              </option>

              <option value="-start_time">
                Latest first
              </option>

              <option value="title">
                Title A–Z
              </option>

              <option value="-title">
                Title Z–A
              </option>
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="rounded-xl px-3 py-3 text-sm font-medium text-[#171717]/45 transition hover:bg-[#FCB7C7]/30 hover:text-[#CA6180]"
              >
                Clear
              </button>
            )}

          </div>

        </section>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-72 items-center justify-center">

            <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#171717]/10 border-t-[#CA6180]" />

          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-[#CA6180]/20 bg-[#FCB7C7]/20 p-6">

            <p className="font-semibold text-[#171717]">
              Something went wrong.
            </p>

            <p className="mt-1 text-sm text-[#171717]/55">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                fetchEvents({
                  search,
                  venue,
                  upcoming,
                  ordering,
                })
              }
              className="mt-4 rounded-full bg-[#171717] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#CA6180]"
            >
              Try again
            </button>

          </div>
        )}

        {/* Empty */}
        {!loading && !error && events.length === 0 && (
          <div className="rounded-[2rem] border border-black/10 bg-[#FEFD99] p-12 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#171717] text-xl text-[#FEFD99]">
              ?
            </div>

            <h2 className="mt-5 text-2xl font-bold">
              Nothing here yet.
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#171717]/55">
              Try changing your search or filters.
              There might be something good waiting.
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-6 rounded-full border-2 border-[#171717] px-6 py-3 text-sm font-semibold transition hover:bg-[#171717] hover:text-white"
              >
                Clear filters
              </button>
            )}

          </div>
        )}

        {/* Results */}
        {!loading && !error && events.length > 0 && (
          <section>

            <div className="mb-6 flex items-end justify-between">

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#171717]/40">
                  What's happening
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight">
                  Upcoming events
                </h2>
              </div>

              <p className="text-sm font-medium text-[#171717]/45">
                {events.length}{" "}
                {events.length === 1
                  ? "event"
                  : "events"}
              </p>

            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                />
              ))}
            </div>

          </section>
        )}

      </div>
    </main>
  );
}

export default Events;