import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  getEventSeats,
  holdSeat,
} from "../api/bookings";

function SeatSelection() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [sections, setSections] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);

  const [loading, setLoading] = useState(true);
  const [holding, setHolding] = useState(false);

  const [error, setError] = useState("");
  const [holdError, setHoldError] = useState("");

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getEventSeats(eventId);

        console.log("SEATS FROM BACKEND:", data);

        setSections(data);
      } catch (err) {
        console.error("Failed to load seats:", err);

        setError(
          "Unable to load seats. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchSeats();
    }
  }, [eventId]);

  // ---------------------------------------
  // Select seat
  // ---------------------------------------

  const handleSeatClick = (seat, section) => {
    if (seat.status !== "AVAILABLE") {
      return;
    }

    setHoldError("");

    setSelectedSeat({
      ...seat,
      section: section.section,
    });
  };

  // ---------------------------------------
  // Hold seat + continue
  // ---------------------------------------

  const handleContinue = async () => {
    if (!selectedSeat) {
      return;
    }

    const accessToken =
      localStorage.getItem("access_token");

    if (!accessToken) {
      navigate("/login");
      return;
    }

    try {
      setHolding(true);
      setHoldError("");

      const data = await holdSeat(
        eventId,
        selectedSeat.id,
        accessToken
      );

      console.log(
        "SEAT HOLD RESPONSE:",
        data
      );

      sessionStorage.removeItem(
        "checkout_booking_id"
      );

      sessionStorage.setItem(
        "checkout_event_id",
        eventId
      );

      sessionStorage.setItem(
        "checkout_seat_id",
        selectedSeat.id
      );

      sessionStorage.setItem(
        "checkout_seat",
        JSON.stringify(selectedSeat)
      );

      sessionStorage.setItem(
        "checkout_hold_expires_in",
        data.expires_in
      );

      navigate("/checkout");
    } catch (err) {
      console.error(
        "Seat hold failed:",
        err
      );

      const message =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        "Unable to hold this seat.";

      setHoldError(message);

      try {
        const updatedSeats =
          await getEventSeats(eventId);

        setSections(updatedSeats);
      } catch (refreshError) {
        console.error(refreshError);
      }
    } finally {
      setHolding(false);
    }
  };

  // ---------------------------------------
  // Loading
  // ---------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffdf7] px-6 py-16 text-[#171717]">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-black/10 border-t-[#CA6180]" />
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------
  // General error
  // ---------------------------------------

  if (error) {
    return (
      <div className="min-h-screen bg-[#fffdf7] px-6 py-16 text-[#171717]">
        <div className="mx-auto max-w-7xl">
          <Link
            to={`/events/${eventId}`}
            className="text-sm text-black/50 transition hover:text-black"
          >
            ← Back to event
          </Link>

          <div className="mt-10 rounded-3xl border border-[#CA6180]/30 bg-[#FCB7C7]/30 p-6 text-[#7d3049]">
            {error}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------
  // Main
  // ---------------------------------------

  return (
    <div className="min-h-screen bg-[#fffdf7] px-5 py-10 text-[#171717] sm:px-6 lg:py-12">
      <div className="mx-auto max-w-7xl">

        {/* Back */}
        <Link
          to={`/events/${eventId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-black/50 transition hover:text-black"
        >
          ← Back to event
        </Link>

        {/* Header */}
        <div className="mt-10 max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#CA6180]" />

            <p className="text-xs font-bold uppercase tracking-[0.28em] text-black/45">
              EVENTLY / SEAT SELECTION
            </p>
          </div>

          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-5xl md:text-6xl">
            Pick your seat.
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-black/50">
            Choose exactly where you want to be.
            Available seats can be selected and held
            for a few minutes while you complete checkout.
          </p>
        </div>

        {/* Hold Error */}
        {holdError && (
          <div className="mt-8 rounded-2xl border border-[#CA6180]/30 bg-[#FCB7C7]/35 px-5 py-4 text-sm font-medium text-[#7d3049]">
            {holdError}
          </div>
        )}

        {/* Main layout */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_350px]">

          {/* --------------------------------------- */}
          {/* Seat map */}
          {/* --------------------------------------- */}

          <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.04)] sm:p-8">

            {/* Map heading */}
            <div className="flex flex-col gap-4 border-b border-black/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#CA6180]">
                  Seating map
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight">
                  Find your place.
                </h2>
              </div>

              <p className="text-sm text-black/40">
                Select one seat
              </p>
            </div>

            {/* Stage */}
            <div className="mt-8">
              <div className="relative mx-auto max-w-2xl">
                <div className="absolute -inset-x-4 top-1/2 h-12 -translate-y-1/2 rounded-full bg-[#9ED3DC]/30 blur-2xl" />

                <div className="relative rounded-[1.25rem] border border-black/10 bg-[#9ED3DC] px-6 py-5 text-center shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.35em]">
                    Stage
                  </p>

                  <p className="mt-1 text-[11px] font-medium text-black/50">
                    Front of venue
                  </p>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="mt-12 space-y-12">

              {sections.map((sectionGroup) => {
                const section =
                  sectionGroup.section;

                const seats =
                  sectionGroup.seats || [];

                return (
                  <div key={section.id}>

                    {/* Section heading */}
                    <div className="mb-6 flex items-end justify-between border-b border-black/10 pb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`h-3 w-3 rounded-full ${
                              section.name
                                ?.toLowerCase()
                                .includes("vip")
                                ? "bg-[#CA6180]"
                                : section.name
                                    ?.toLowerCase()
                                    .includes("gold")
                                  ? "bg-[#FEFD99]"
                                  : "bg-[#9ED3DC]"
                            }`}
                          />

                          <h2 className="text-xl font-black">
                            {section.name}
                          </h2>
                        </div>

                        <p className="mt-1 text-sm text-black/45">
                          ₹{section.price} per seat
                        </p>
                      </div>

                      <span className="text-xs font-bold uppercase tracking-wider text-black/35">
                        {seats.length} seats
                      </span>
                    </div>

                    {/* Seats */}
                    {seats.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-black/15 bg-[#fffdf7] px-5 py-5 text-sm text-black/40">
                        No seats available in this section.
                      </div>
                    ) : (
                      <div className="overflow-x-auto pb-2">
                        <div className="min-w-[520px] space-y-3">

                          {[
                            ...new Set(
                              seats.map(
                                (seat) => seat.row
                              )
                            ),
                          ].map((row) => {
                            const rowSeats =
                              seats.filter(
                                (seat) =>
                                  seat.row === row
                              );

                            return (
                              <div
                                key={row}
                                className="flex items-center gap-3"
                              >

                                {/* Row label */}
                                <div className="flex w-7 shrink-0 items-center justify-center">
                                  <span className="text-xs font-bold uppercase text-black/30">
                                    {row}
                                  </span>
                                </div>

                                {/* Seats */}
                                <div className="grid flex-1 grid-cols-10 gap-2">
                                  {rowSeats.map(
                                    (seat) => {
                                      const isAvailable =
                                        seat.status ===
                                        "AVAILABLE";

                                      const isSelected =
                                        selectedSeat?.id ===
                                        seat.id;

                                      const isBooked =
                                        seat.status ===
                                        "BOOKED";

                                      const isHeld =
                                        seat.status ===
                                        "HELD";

                                      return (
                                        <button
                                          key={seat.id}
                                          type="button"
                                          disabled={
                                            !isAvailable ||
                                            holding
                                          }
                                          onClick={() =>
                                            handleSeatClick(
                                              seat,
                                              sectionGroup
                                            )
                                          }
                                          aria-label={`Seat ${seat.row}${seat.seat_number}`}
                                          className={`
                                            flex
                                            aspect-square
                                            items-center
                                            justify-center
                                            rounded-lg
                                            border
                                            text-xs
                                            font-bold
                                            transition
                                            duration-200
                                            ${
                                              isSelected
                                                ? "border-[#CA6180] bg-[#CA6180] text-white shadow-[0_6px_16px_rgba(202,97,128,0.28)]"
                                                : isBooked
                                                  ? "cursor-not-allowed border-black/5 bg-black/10 text-black/20"
                                                  : isHeld
                                                    ? "cursor-not-allowed border-[#FEFD99] bg-[#FEFD99] text-black/35"
                                                    : "border-black/10 bg-[#fffdf7] text-black/60 hover:-translate-y-0.5 hover:border-[#9ED3DC] hover:bg-[#9ED3DC]/45 hover:text-black"
                                            }
                                          `}
                                        >
                                          {seat.seat_number}
                                        </button>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            );
                          })}

                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

            </div>

            {/* Legend */}
            <div className="mt-12 flex flex-wrap gap-x-7 gap-y-4 border-t border-black/10 pt-6">

              <div className="flex items-center gap-2 text-xs font-medium text-black/50">
                <span className="h-4 w-4 rounded-md border border-black/10 bg-[#fffdf7]" />
                Available
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-black/50">
                <span className="h-4 w-4 rounded-md bg-[#CA6180]" />
                Selected
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-black/50">
                <span className="h-4 w-4 rounded-md bg-[#FEFD99]" />
                Held
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-black/50">
                <span className="h-4 w-4 rounded-md bg-black/10" />
                Booked
              </div>
            </div>
          </section>

          {/* --------------------------------------- */}
          {/* Booking summary */}
          {/* --------------------------------------- */}

          <aside className="h-fit lg:sticky lg:top-6">

            <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.05)]">

              {/* Summary header */}
              <div className="bg-[#FEFD99] px-7 py-6">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-black/50">
                  Your selection
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight">
                  Booking summary
                </h2>
              </div>

              <div className="p-7">

                {selectedSeat ? (
                  <div>

                    {/* Seat highlight */}
                    <div className="relative overflow-hidden rounded-2xl bg-[#9ED3DC] p-6">
                      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/25" />

                      <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-black/50">
                        Selected seat
                      </p>

                      <p className="relative mt-2 text-4xl font-black tracking-tight">
                        {selectedSeat.row}
                        {selectedSeat.seat_number}
                      </p>
                    </div>

                    {/* Details */}
                    <div className="mt-7 space-y-5">

                      <div className="flex items-start justify-between gap-4 border-b border-black/10 pb-5">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-black/35">
                            Section
                          </p>

                          <p className="mt-1 font-bold">
                            {selectedSeat.section.name}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-bold uppercase tracking-wider text-black/35">
                            Seat
                          </p>

                          <p className="mt-1 font-bold">
                            {selectedSeat.row}
                            {selectedSeat.seat_number}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-black/35">
                            Price
                          </p>

                          <p className="mt-1 text-sm text-black/45">
                            1 ticket
                          </p>
                        </div>

                        <p className="text-2xl font-black">
                          ₹{selectedSeat.section.price}
                        </p>
                      </div>
                    </div>

                    {/* Continue */}
                    <button
                      type="button"
                      onClick={handleContinue}
                      disabled={holding}
                      className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#CA6180] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {holding
                        ? "Holding seat..."
                        : "Continue to checkout →"}
                    </button>

                    <p className="mt-4 text-center text-xs leading-5 text-black/35">
                      Your seat will be temporarily held
                      while you complete checkout.
                    </p>
                  </div>
                ) : (
                  <div>

                    {/* Empty state */}
                    <div className="rounded-2xl border border-dashed border-black/15 bg-[#fffdf7] px-6 py-10 text-center">

                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FCB7C7] text-2xl">
                        ♡
                      </div>

                      <p className="mt-5 font-bold">
                        Nothing selected yet.
                      </p>

                      <p className="mt-2 text-sm leading-6 text-black/40">
                        Choose an available seat from
                        the map to continue.
                      </p>
                    </div>

                    {/* Small reminder */}
                    <div className="mt-6 rounded-2xl bg-[#fffdf7] p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/35">
                        How it works
                      </p>

                      <div className="mt-4 space-y-3 text-sm text-black/55">
                        <div className="flex gap-3">
                          <span className="font-black text-[#CA6180]">
                            01
                          </span>
                          <span>
                            Pick an available seat.
                          </span>
                        </div>

                        <div className="flex gap-3">
                          <span className="font-black text-[#CA6180]">
                            02
                          </span>
                          <span>
                            Hold it temporarily.
                          </span>
                        </div>

                        <div className="flex gap-3">
                          <span className="font-black text-[#CA6180]">
                            03
                          </span>
                          <span>
                            Complete your payment.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

export default SeatSelection;