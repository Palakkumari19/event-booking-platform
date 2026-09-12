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
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#fffdf7]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-black/10 border-t-[#CA6180]" />
          <p className="text-sm font-medium text-black/50">
            Loading your ticket...
          </p>
        </div>
      </main>
    );
  }

  if (error || !ticket) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-[#fffdf7] px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/tickets"
            className="text-sm font-semibold text-black/50 transition hover:text-[#CA6180]"
          >
            ← Back to tickets
          </Link>

          <div className="mt-8 rounded-3xl border border-[#CA6180]/20 bg-[#FCB7C7]/30 p-6">
            <p className="font-bold text-[#7d3049]">
              Ticket unavailable
            </p>

            <p className="mt-2 text-sm text-[#7d3049]/80">
              {error || "Ticket not found."}
            </p>
          </div>
        </div>
      </main>
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

  const statusStyles = {
    ACTIVE: "bg-[#9ED3DC] text-black",
    USED: "bg-black text-white",
    CANCELLED: "bg-[#FCB7C7] text-[#7d3049]",
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#fffdf7] px-6 py-10 md:py-14">
      <div className="mx-auto max-w-5xl">

        {/* Back */}
        <Link
          to="/tickets"
          className="text-sm font-semibold text-black/50 transition hover:text-[#CA6180]"
        >
          ← Back to tickets
        </Link>

        {/* Header */}
        <div className="mt-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#CA6180]">
                Your ticket
              </p>

              <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight tracking-tight text-black md:text-5xl">
                {ticket.event.title}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-black/55">
                Keep this ticket ready for entry. Your QR code contains
                the information needed for validation.
              </p>
            </div>

            <span
              className={`self-start rounded-full px-4 py-2 text-sm font-bold ${
                statusStyles[ticket.status] ||
                "bg-black/10 text-black"
              }`}
            >
              {ticket.status}
            </span>
          </div>
        </div>

        {/* Ticket */}
        <div className="mt-10 overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.07)]">

          {/* Ticket header */}
          <div className="relative overflow-hidden bg-[#9ED3DC] p-7 md:p-10">
            <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#FEFD99]" />
            <div className="absolute -bottom-24 right-24 h-44 w-44 rounded-full bg-[#FCB7C7]" />

            <div className="relative z-10 flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-black/50">
                  Ticket number
                </p>

                <p className="mt-2 font-mono text-2xl font-black tracking-tight text-black">
                  {ticket.ticket_number}
                </p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-black/45">
                  Status
                </p>
                <p className="mt-1 text-sm font-black text-black">
                  {ticket.status}
                </p>
              </div>
            </div>
          </div>

          {/* Ticket body */}
          <div className="grid gap-10 p-7 md:grid-cols-[1fr_260px] md:p-10">

            {/* Details */}
            <div>
              <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-black/40">
                    Event
                  </p>
                  <p className="mt-2 font-bold text-black">
                    {ticket.event.title}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-black/40">
                    Venue
                  </p>
                  <p className="mt-2 font-bold text-black">
                    {ticket.event.venue}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-black/40">
                    Date
                  </p>
                  <p className="mt-2 font-bold text-black">
                    {date}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-black/40">
                    Time
                  </p>
                  <p className="mt-2 font-bold text-black">
                    {time}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-black/40">
                    Section
                  </p>
                  <p className="mt-2 font-bold text-black">
                    {ticket.seat.section}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-black/40">
                    Seat
                  </p>
                  <p className="mt-2 font-bold text-black">
                    {ticket.seat.row}
                    {ticket.seat.seat_number}
                  </p>
                </div>

              </div>

              <div className="mt-10 border-t border-black/10 pt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-black/40">
                  Issued
                </p>

                <p className="mt-2 text-sm font-medium text-black/60">
                  {new Date(ticket.issued_at).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* QR */}
            <div className="flex flex-col items-center rounded-3xl bg-[#fffdf7] p-5">
              <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                {ticket.qr_code ? (
                  <img
                    src={ticket.qr_code}
                    alt={`QR code for ${ticket.ticket_number}`}
                    className="h-48 w-48 object-contain"
                  />
                ) : (
                  <div className="flex h-48 w-48 items-center justify-center text-center text-sm font-medium text-black/40">
                    QR code unavailable
                  </div>
                )}
              </div>

              <p className="mt-4 text-center text-xs font-medium leading-5 text-black/45">
                Present this QR code at the event entrance.
              </p>
            </div>
          </div>

          {/* Bottom strip */}
          <div className="border-t border-black/10 bg-[#FEFD99] px-7 py-4 md:px-10">
            <p className="text-center text-xs font-bold text-black/65">
              Please arrive early and keep your ticket accessible.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default TicketDetails;