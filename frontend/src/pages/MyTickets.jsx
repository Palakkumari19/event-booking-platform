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

  return (
    <div className="min-h-screen bg-[#09090b] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
            Your tickets
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
            My Tickets
          </h1>

          <p className="mt-4 text-zinc-400">
            View your confirmed event tickets and QR codes.
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
        {!loading && !error && tickets.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-12 text-center">
            <p className="text-xl font-medium text-zinc-200">
              No tickets yet.
            </p>

            <p className="mt-2 text-zinc-500">
              Your tickets will appear here after a successful payment.
            </p>

            <Link
              to="/events"
              className="mt-6 inline-flex rounded-xl bg-white px-6 py-3 font-medium text-black transition hover:bg-zinc-200"
            >
              Explore Events
            </Link>
          </div>
        )}

        {/* Tickets */}
        {!loading && !error && tickets.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">

            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="group rounded-2xl border border-white/10 bg-zinc-900 p-6 transition hover:border-indigo-400/40 hover:bg-zinc-900/80"
              >

                <div className="flex items-start justify-between gap-4">

                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-indigo-400">
                      Ticket
                    </p>

                    <h2 className="mt-2 text-xl font-semibold text-white">
                      {ticket.event}
                    </h2>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      ticket.status === "ACTIVE"
                        ? "bg-emerald-400/10 text-emerald-300"
                        : ticket.status === "USED"
                          ? "bg-blue-400/10 text-blue-300"
                          : "bg-red-400/10 text-red-300"
                    }`}
                  >
                    {ticket.status}
                  </span>

                </div>

                <div className="mt-6 space-y-4">

                  <div>
                    <p className="text-sm text-zinc-500">
                      Ticket number
                    </p>

                    <p className="mt-1 font-medium text-zinc-200">
                      {ticket.ticket_number}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-500">
                      Venue
                    </p>

                    <p className="mt-1 text-zinc-200">
                      {ticket.venue}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-500">
                      Seat
                    </p>

                    <p className="mt-1 text-zinc-200">
                      {ticket.seat}
                    </p>
                  </div>

                </div>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <span className="text-sm font-medium text-indigo-400 transition group-hover:text-indigo-300">
                    View ticket →
                  </span>
                </div>

              </Link>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default MyTickets;