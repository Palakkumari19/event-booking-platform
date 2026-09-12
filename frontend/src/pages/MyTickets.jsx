import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMyTickets } from "../api/tickets";

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await getMyTickets();
        setTickets(data);
      } catch (err) {
        console.error("Failed to load tickets:", err);
        setError("Unable to load your tickets.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const getStatusClasses = (status) => {
    if (status === "ACTIVE") {
      return "bg-[#9ED3DC] text-[#171717]";
    }

    if (status === "USED") {
      return "bg-[#FEFD99] text-[#171717]";
    }

    return "bg-[#FCB7C7] text-[#7d3049]";
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#fffdf7] px-6 py-12 text-[#171717]">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-10">

          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#CA6180]" />

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/45">
              EVENTLY / TICKETS
            </p>
          </div>

          <h1 className="mt-4 text-5xl font-black tracking-[-0.05em] md:text-6xl">
            My tickets.
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-black/50">
            Your confirmed events, seats and QR
            tickets — all in one place.
          </p>

        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-64 items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-black/10 border-t-[#CA6180]" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-[#CA6180]/25 bg-[#FCB7C7]/30 p-5 text-sm font-medium text-[#7d3049]">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && tickets.length === 0 && (
          <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white">

            <div className="bg-[#9ED3DC] p-8 sm:p-12">

              <p className="text-xs font-black uppercase tracking-[0.2em] text-black/45">
                Your ticket wallet
              </p>

              <h2 className="mt-3 text-3xl font-black">
                No tickets yet.
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-black/55">
                Once you complete a booking,
                your ticket and QR code will appear here.
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

        {/* Tickets */}
        {!loading && !error && tickets.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">

            {tickets.map((ticket, index) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="group overflow-hidden rounded-[1.75rem] border border-black/10 bg-white shadow-[0_12px_40px_rgba(23,23,23,0.04)] transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(23,23,23,0.09)]"
              >

                {/* Ticket top */}
                <div
                  className={`relative overflow-hidden p-7 ${
                    index % 3 === 0
                      ? "bg-[#9ED3DC]"
                      : index % 3 === 1
                        ? "bg-[#FEFD99]"
                        : "bg-[#FCB7C7]"
                  }`}
                >

                  <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/25 transition duration-500 group-hover:scale-110" />

                  <div className="relative flex items-start justify-between gap-4">

                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-black/45">
                        EVENTLY / TICKET
                      </p>

                      <h2 className="mt-3 max-w-sm text-2xl font-black leading-tight tracking-[-0.03em]">
                        {ticket.event}
                      </h2>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${getStatusClasses(
                        ticket.status
                      )}`}
                    >
                      {ticket.status}
                    </span>

                  </div>

                </div>

                {/* Ticket details */}
                <div className="p-7">

                  <div className="grid gap-5">

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-black/35">
                        Ticket number
                      </p>

                      <p className="mt-1.5 font-black tracking-wide">
                        {ticket.ticket_number}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-black/35">
                        Venue
                      </p>

                      <p className="mt-1.5 font-semibold">
                        {ticket.venue}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-black/35">
                        Seat
                      </p>

                      <p className="mt-1.5 font-bold">
                        {ticket.seat}
                      </p>
                    </div>

                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-5">

                    <span className="text-sm font-bold text-[#CA6180]">
                      View ticket
                    </span>

                    <span className="text-lg transition-transform group-hover:translate-x-1">
                      →
                    </span>

                  </div>

                </div>

              </Link>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}

export default MyTickets;