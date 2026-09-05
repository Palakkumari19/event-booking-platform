import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getTicket } from "../api/tickets";

function TicketDetails() {
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const data = await getTicket(id);
        setTicket(data);
      } catch (err) {
        console.error("Failed to load ticket:", err);
        setError("Unable to load this ticket.");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-400" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-[#09090b] px-6 py-12 text-white">
        <div className="mx-auto max-w-3xl">

          <Link
            to="/tickets"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            ← Back to tickets
          </Link>

          <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
            {error || "Ticket not found."}
          </div>

        </div>
      </div>
    );
  }

  const startDate = new Date(ticket.event.start_time);

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
    <div className="min-h-screen bg-[#09090b] px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">

        {/* Back */}
        <Link
          to="/tickets"
          className="text-sm text-zinc-400 transition hover:text-white"
        >
          ← Back to tickets
        </Link>

        {/* Header */}
        <div className="mt-10">
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
            Your ticket
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
            {ticket.event.title}
          </h1>

          <p className="mt-4 text-zinc-400">
            Present this ticket at the event entrance.
          </p>
        </div>

        {/* Ticket */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-zinc-900">

          {/* Top */}
          <div className="border-b border-white/10 bg-gradient-to-br from-indigo-950 via-zinc-900 to-zinc-950 p-8 md:p-10">

            <div className="flex flex-col justify-between gap-8 md:flex-row">

              <div>
                <p className="text-sm text-zinc-500">
                  Ticket number
                </p>

                <p className="mt-2 text-xl font-semibold text-white">
                  {ticket.ticket_number}
                </p>
              </div>

              <span
                className={`self-start rounded-full px-4 py-2 text-sm font-medium ${
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

          </div>

          {/* Body */}
          <div className="grid gap-10 p-8 md:grid-cols-[1fr_240px] md:p-10">

            {/* Details */}
            <div>

              <div className="grid gap-7 sm:grid-cols-2">

                <div>
                  <p className="text-sm text-zinc-500">
                    Event
                  </p>

                  <p className="mt-2 font-medium text-white">
                    {ticket.event.title}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-zinc-500">
                    Venue
                  </p>

                  <p className="mt-2 font-medium text-white">
                    {ticket.event.venue}
                  </p>
                </div>

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
                    Section
                  </p>

                  <p className="mt-2 font-medium text-white">
                    {ticket.seat.section}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-zinc-500">
                    Seat
                  </p>

                  <p className="mt-2 font-medium text-white">
                    {ticket.seat.row}
                    {ticket.seat.seat_number}
                  </p>
                </div>

              </div>

              <div className="mt-10 border-t border-white/10 pt-6">
                <p className="text-sm text-zinc-500">
                  Issued
                </p>

                <p className="mt-2 text-sm text-zinc-300">
                  {new Date(ticket.issued_at).toLocaleString("en-IN")}
                </p>
              </div>

            </div>

            {/* QR */}
            <div className="flex flex-col items-center justify-start">

              <div className="rounded-2xl bg-white p-4">

                {ticket.qr_code ? (
                  <img
                    src={ticket.qr_code}
                    alt={`QR code for ${ticket.ticket_number}`}
                    className="h-48 w-48 object-contain"
                  />
                ) : (
                  <div className="flex h-48 w-48 items-center justify-center text-center text-sm text-zinc-500">
                    QR code unavailable
                  </div>
                )}

              </div>

              <p className="mt-4 text-center text-xs text-zinc-500">
                Scan this QR code at the entrance
              </p>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default TicketDetails;