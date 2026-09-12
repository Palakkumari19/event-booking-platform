import { useEffect, useRef, useState } from "react";

import { Html5Qrcode } from "html5-qrcode";

import { validateTicket } from "../api/tickets";

export default function TicketValidation() {
  const [ticketNumber, setTicketNumber] = useState("");
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const scannerRef = useRef(null);

  const stopScanner = async () => {
    if (!scannerRef.current) {
      setScanning(false);
      return;
    }

    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
    } catch (err) {
      console.error("Failed to stop QR scanner:", err);
    }

    try {
      await scannerRef.current.clear();
    } catch (err) {
      console.error("Failed to clear QR scanner:", err);
    }

    scannerRef.current = null;
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current
              ?.clear()
              .catch(() => {});
          });
      }
    };
  }, []);

  const validateTicketNumber = async (number) => {
    if (!number.trim()) {
      setError("Please enter a ticket number.");
      setTicket(null);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setTicket(null);

      const data = await validateTicket(number.trim());

      setTicket(data.ticket);
      setTicketNumber("");
    } catch (err) {
      console.error("Ticket validation failed:", err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.ticket_number?.[0] ||
        "Unable to validate ticket.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await validateTicketNumber(ticketNumber);
  };

  const handleStartScanner = async () => {
    setError("");
    setTicket(null);

    try {
      const scanner = new Html5Qrcode("qr-reader");

      scannerRef.current = scanner;
      setScanning(true);

      await scanner.start(
        {
          facingMode: "environment",
        },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
        },
        async (decodedText) => {
          await stopScanner();

          let scannedTicketNumber = decodedText;

          try {
            const qrData = JSON.parse(decodedText);

            if (qrData.ticket_number) {
              scannedTicketNumber = qrData.ticket_number;
            }
          } catch {
            // QR contains plain text.
            // Use the scanned text directly.
          }

          setTicketNumber(scannedTicketNumber);

          await validateTicketNumber(scannedTicketNumber);
        },
        () => {
          // Ignore normal scan failures.
        }
      );
    } catch (err) {
      console.error("Failed to start QR scanner:", err);

      setScanning(false);
      scannerRef.current = null;

      setError(
        "Unable to access the camera. Please allow camera permission or enter the ticket number manually."
      );
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#fffdf7] px-6 py-10 md:py-14">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#CA6180] px-3 py-1 text-xs font-black uppercase tracking-wider text-white">
              Staff Portal
            </span>

            <span className="text-xs font-bold uppercase tracking-wider text-black/35">
              Entry Desk
            </span>
          </div>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-black md:text-5xl">
            Ticket Validation
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-black/55">
            Scan a ticket QR code or enter the ticket number manually
            to approve event entry.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">

          {/* Scanner */}
          <section className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_16px_45px_rgba(0,0,0,0.06)]">

            <div className="border-b border-black/10 bg-[#9ED3DC] p-6">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-black/50">
                    Fast entry
                  </p>

                  <h2 className="mt-1 text-xl font-black text-black">
                    QR Scanner
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-black/60">
                    Scan the attendee's ticket directly.
                  </p>
                </div>

                {!scanning ? (
                  <button
                    type="button"
                    onClick={handleStartScanner}
                    disabled={loading}
                    className="shrink-0 rounded-xl bg-black px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#CA6180] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Open Camera
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopScanner}
                    className="shrink-0 rounded-xl bg-[#CA6180] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black"
                  >
                    Stop Camera
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {scanning ? (
                <div className="overflow-hidden rounded-3xl border-2 border-black/10 bg-black">
                  <div id="qr-reader" className="w-full" />
                </div>
              ) : (
                <div className="flex min-h-[290px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-black/10 bg-[#fffdf7] px-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FEFD99] text-3xl">
                    ▣
                  </div>

                  <p className="mt-5 font-black text-black">
                    Camera ready
                  </p>

                  <p className="mt-2 max-w-xs text-sm leading-6 text-black/45">
                    Open the camera when an attendee is ready to
                    present their ticket.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Manual validation */}
          <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_16px_45px_rgba(0,0,0,0.06)]">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#CA6180]">
              Backup method
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-black">
              Enter ticket
            </h2>

            <p className="mt-2 text-sm leading-6 text-black/50">
              No camera? Enter the ticket number printed on the
              attendee's ticket.
            </p>

            <form onSubmit={handleSubmit} className="mt-7">
              <label
                htmlFor="ticket-number"
                className="text-sm font-bold text-black"
              >
                Ticket Number
              </label>

              <input
                id="ticket-number"
                type="text"
                value={ticketNumber}
                onChange={(event) =>
                  setTicketNumber(event.target.value)
                }
                placeholder="CP-2026-000001"
                className="mt-2 w-full rounded-2xl border border-black/15 bg-[#fffdf7] px-4 py-3.5 font-mono text-sm text-black outline-none transition placeholder:text-black/25 focus:border-[#CA6180] focus:ring-4 focus:ring-[#FCB7C7]/40"
              />

              <button
                type="submit"
                disabled={loading || scanning}
                className="mt-4 w-full rounded-2xl bg-black px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#CA6180] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Validating..." : "Validate Ticket →"}
              </button>
            </form>

            <div className="mt-7 rounded-2xl bg-[#FEFD99] p-4">
              <p className="text-xs font-black uppercase tracking-wider text-black/50">
                Entry rule
              </p>

              <p className="mt-1 text-sm font-semibold leading-6 text-black/70">
                A valid ticket is approved once. Used or cancelled
                tickets cannot be reused.
              </p>
            </div>
          </section>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-[2rem] border border-[#CA6180]/20 bg-[#FCB7C7]/35 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#CA6180] font-black text-white">
                ×
              </div>

              <div>
                <p className="font-black text-[#7d3049]">
                  Ticket Rejected
                </p>

                <p className="mt-1 text-sm leading-6 text-[#7d3049]/80">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success */}
        {ticket && (
          <div className="mt-6 overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.07)]">

            <div className="flex items-center justify-between gap-5 bg-[#FEFD99] p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-xl font-black text-white">
                  ✓
                </div>

                <div>
                  <p className="font-black text-black">
                    Ticket Valid
                  </p>

                  <p className="text-sm font-medium text-black/55">
                    Entry approved
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-black px-4 py-2 text-xs font-black text-white">
                {ticket.status}
              </span>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-2 md:p-8">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-black/40">
                  Ticket Number
                </p>

                <p className="mt-2 font-mono font-black text-black">
                  {ticket.ticket_number}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-black/40">
                  Event
                </p>

                <p className="mt-2 font-bold text-black">
                  {ticket.event?.title}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-black/40">
                  Venue
                </p>

                <p className="mt-2 font-medium text-black/65">
                  {ticket.event?.venue}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-black/40">
                  Seat
                </p>

                <p className="mt-2 font-bold text-black">
                  {ticket.seat?.section} — {ticket.seat?.row}
                  {ticket.seat?.seat_number}
                </p>
              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}