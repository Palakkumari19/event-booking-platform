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
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#fffdf7]">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-black/10 border-t-[#CA6180]" />
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-[#fffdf7] px-6 py-20">
        <div className="mx-auto max-w-7xl">

          <div className="rounded-[2rem] border border-[#CA6180]/20 bg-[#FCB7C7]/20 p-8">

            <p className="text-xs font-bold uppercase tracking-widest text-[#CA6180]">
              EVENTLY / ERROR
            </p>

            <h1 className="mt-3 text-3xl font-black">
              Event not found.
            </h1>

            <p className="mt-2 text-[#171717]/55">
              {error || "We couldn't find this event."}
            </p>

            <Link
              to="/events"
              className="mt-6 inline-flex rounded-full bg-[#171717] px-6 py-3 text-sm font-semibold text-white"
            >
              ← Back to events
            </Link>

          </div>

        </div>
      </main>
    );
  }

  const now = new Date();

  const bookingStart = new Date(event.booking_start);
  const bookingEnd = new Date(event.booking_end);

  const bookingNotStarted = now < bookingStart;
  const bookingClosed = now > bookingEnd;
  const bookingOpen =
    !bookingNotStarted && !bookingClosed;

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

  const bookingStartDate =
    bookingStart.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const bookingStartTime =
    bookingStart.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });

  const bookingEndDate =
    bookingEnd.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const bookingEndTime =
    bookingEnd.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#fffdf7] text-[#171717]">

      <div className="mx-auto max-w-7xl px-6 py-10 lg:py-14">

        {/* Back */}
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#171717]/50 transition hover:text-[#CA6180]"
        >
          ← Back to events
        </Link>

        {/* Hero */}
        <section className="mt-8 overflow-hidden rounded-[2rem] bg-[#CA6180]">

          <div className="relative min-h-[440px] overflow-hidden p-8 sm:p-12 lg:p-14">

            {/* Decorative shapes */}
            <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-[#FEFD99]" />

            <div className="absolute -bottom-36 -left-20 h-80 w-80 rounded-full bg-[#9ED3DC]" />

            <div className="relative flex min-h-[340px] flex-col justify-between">

              <div className="flex items-center justify-between">

                <span className="text-xs font-bold uppercase tracking-[0.2em]">
                  EVENTLY / EVENT
                </span>

                <span className="rounded-full border border-black/20 px-4 py-1.5 text-xs font-semibold">
                  Upcoming
                </span>

              </div>

              <div className="max-w-4xl">

                <p className="text-sm font-bold uppercase tracking-[0.15em] text-black/50">
                  {date}
                </p>

                <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.9] tracking-[-0.05em] sm:text-6xl lg:text-8xl">
                  {event.title}
                </h1>

                <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium">

                  <span>
                    📍 {event.venue.name}
                  </span>

                  <span>
                    {time}
                  </span>

                </div>

              </div>

            </div>
          </div>

          {/* Event information */}
          <div className="grid border-t border-black/15 bg-[#fffdf7] md:grid-cols-3">

            <div className="border-b border-black/10 p-7 md:border-b-0 md:border-r">
              <p className="text-xs font-bold uppercase tracking-widest text-[#171717]/40">
                Date
              </p>

              <p className="mt-3 text-lg font-bold">
                {date}
              </p>
            </div>

            <div className="border-b border-black/10 p-7 md:border-b-0 md:border-r">
              <p className="text-xs font-bold uppercase tracking-widest text-[#171717]/40">
                Time
              </p>

              <p className="mt-3 text-lg font-bold">
                {time}
              </p>
            </div>

            <div className="p-7">
              <p className="text-xs font-bold uppercase tracking-widest text-[#171717]/40">
                Venue
              </p>

              <p className="mt-3 text-lg font-bold">
                {event.venue.name}
              </p>

              <p className="mt-1 text-sm text-[#171717]/45">
                {event.venue.city}
              </p>
            </div>

          </div>

        </section>

        {/* Description */}
        {event.description && (
          <section className="mt-12 grid gap-8 md:grid-cols-[0.7fr_1.3fr]">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#CA6180]">
                About
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight">
                What to expect
              </h2>
            </div>

            <p className="max-w-3xl text-lg leading-8 text-[#171717]/60">
              {event.description}
            </p>

          </section>
        )}

        {/* Booking window */}
        <section className="mt-12 rounded-[2rem] border border-black/10 bg-white p-7 shadow-[0_12px_40px_rgba(23,23,23,0.04)]">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#CA6180]">
                Booking window
              </p>

              {bookingOpen && (
                <h2 className="mt-2 text-2xl font-black">
                  Booking is open.
                </h2>
              )}

              {bookingNotStarted && (
                <h2 className="mt-2 text-2xl font-black">
                  Booking opens soon.
                </h2>
              )}

              {bookingClosed && (
                <h2 className="mt-2 text-2xl font-black">
                  Booking has closed.
                </h2>
              )}

              <p className="mt-3 text-sm leading-6 text-[#171717]/50">
                Opens {bookingStartDate} at {bookingStartTime}
                {" · "}
                Closes {bookingEndDate} at {bookingEndTime}
              </p>

            </div>

            <div
              className={`w-fit rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-widest ${
                bookingOpen
                  ? "bg-[#9ED3DC]"
                  : bookingNotStarted
                    ? "bg-[#FEFD99]"
                    : "bg-[#FCB7C7]"
              }`}
            >
              {bookingOpen
                ? "Open"
                : bookingNotStarted
                  ? "Not open"
                  : "Closed"}
            </div>

          </div>

        </section>

        {/* Tickets */}
        <section className="mt-16">

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#CA6180]">
                Tickets
              </p>

              <h2 className="mt-2 text-4xl font-black tracking-[-0.04em]">
                Pick your experience.
              </h2>

              <p className="mt-3 text-[#171717]/50">
                Choose a ticket category and continue to
                seat selection.
              </p>

            </div>

          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {event.sections?.map((section, index) => {

              const backgrounds = [
                "bg-[#9ED3DC]",
                "bg-[#FEFD99]",
                "bg-[#FCB7C7]",
              ];

              const background =
                backgrounds[index % backgrounds.length];

              return (
                <div
                  key={section.id}
                  className={`group rounded-[1.5rem] ${background} p-6 transition hover:-translate-y-1`}
                >

                  <div className="flex items-start justify-between">

                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-black/45">
                        Section {String(index + 1).padStart(2, "0")}
                      </p>

                      <h3 className="mt-4 text-2xl font-black">
                        {section.name}
                      </h3>
                    </div>

                    <span className="rounded-full bg-black px-3 py-1.5 text-sm font-bold text-white">
                      ₹{section.price}
                    </span>

                  </div>

                  <div className="mt-12 border-t border-black/15 pt-4">

                    <p className="text-sm font-medium text-black/55">
                      Ticket category
                    </p>

                  </div>

                </div>
              );
            })}

          </div>

          {/* CTA */}
          <div className="mt-10 flex justify-end">

            {bookingOpen && (
              <Link
                to={`/events/${event.id}/seats`}
                className="group inline-flex items-center gap-4 rounded-full bg-[#171717] px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#CA6180]"
              >
                Choose your seats

                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            )}

            {bookingNotStarted && (
              <div className="rounded-full bg-[#FEFD99] px-7 py-3.5 text-sm font-bold">
                Booking opens soon
              </div>
            )}

            {bookingClosed && (
              <div className="rounded-full bg-[#FCB7C7] px-7 py-3.5 text-sm font-bold">
                Booking closed
              </div>
            )}

          </div>

        </section>

      </div>
    </main>
  );
}

export default EventDetails;