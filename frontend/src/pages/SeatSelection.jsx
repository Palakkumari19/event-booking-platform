import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getEventSeats } from "../api/bookings";
import { useAuth } from "../context/AuthContext";

function SeatSelection() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuth();

  const [sections, setSections] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        if (err.response?.status === 401) {
          setError("Please sign in to select a seat.");
        } else {
          setError("Unable to load seats. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchSeats();
    }
  }, [eventId]);

  const handleSeatClick = (seat, section) => {
    if (seat.status !== "AVAILABLE") {
      return;
    }

    setSelectedSeat({
      ...seat,
      section: section.section,
    });
  };

  const handleContinue = () => {
    if (!selectedSeat) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    /*
     * We will connect this to the seat-hold API
     * in the next step.
     */

    console.log("SELECTED SEAT:", selectedSeat);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">

          <div className="flex min-h-96 items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-400" />
          </div>

        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#09090b] px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">

          <Link
            to={`/events/${eventId}`}
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            ← Back to event
          </Link>

          <div className="mt-10 rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
            {error}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] px-6 py-12 text-white">

      <div className="mx-auto max-w-7xl">

        {/* Back */}

        <Link
          to={`/events/${eventId}`}
          className="text-sm text-zinc-400 transition hover:text-white"
        >
          ← Back to event
        </Link>


        {/* Header */}

        <div className="mt-10">

          <p className="text-sm font-medium uppercase tracking-[0.25em] text-indigo-400">
            Seat Selection
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Choose your seat
          </h1>

          <p className="mt-4 text-zinc-400">
            Select an available seat to continue.
          </p>

        </div>


        {/* Main layout */}

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_360px]">


          {/* Seat map */}

          <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-8">

            {/* Stage */}

            <div className="mx-auto max-w-2xl rounded-xl border border-white/10 bg-zinc-800 py-4 text-center text-sm font-medium tracking-[0.3em] text-zinc-400">
              STAGE
            </div>


            {/* Sections */}

            <div className="mt-12 space-y-12">

              {sections.map((sectionGroup) => {

                const section = sectionGroup.section;
                const seats = sectionGroup.seats || [];

                return (
                  <div key={section.id}>

                    {/* Section heading */}

                    <div className="mb-5">

                      <div className="flex items-center justify-between">

                        <div>

                          <h2 className="text-xl font-semibold text-white">
                            {section.name}
                          </h2>

                          <p className="mt-1 text-sm text-zinc-500">
                            ₹{section.price} per seat
                          </p>

                        </div>

                        <span className="text-sm text-zinc-500">
                          {seats.length} seats
                        </span>

                      </div>

                    </div>


                    {/* Seats */}

                    {seats.length === 0 ? (

                      <div className="rounded-xl border border-white/5 bg-zinc-950/50 px-5 py-4 text-sm text-zinc-600">
                        No seats available in this section.
                      </div>

                    ) : (

                      <div className="grid grid-cols-5 gap-3 sm:grid-cols-8 md:grid-cols-10">

                        {seats.map((seat) => {

                          const isAvailable =
                            seat.status === "AVAILABLE";

                          const isSelected =
                            selectedSeat?.id === seat.id;

                          const isBooked =
                            seat.status === "BOOKED";

                          return (
                            <button
                              key={seat.id}
                              type="button"
                              disabled={!isAvailable}
                              onClick={() =>
                                handleSeatClick(
                                  seat,
                                  sectionGroup
                                )
                              }
                              className={`
                                flex
                                aspect-square
                                items-center
                                justify-center
                                rounded-lg
                                border
                                text-sm
                                font-medium
                                transition

                                ${
                                  isSelected
                                    ? "border-indigo-400 bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                    : isBooked
                                    ? "cursor-not-allowed border-transparent bg-zinc-950 text-zinc-700"
                                    : "border-white/10 bg-zinc-800 text-zinc-300 hover:border-indigo-400 hover:bg-indigo-500/10 hover:text-white"
                                }
                              `}
                            >
                              {seat.seat_number}
                            </button>
                          );
                        })}

                      </div>

                    )}

                  </div>
                );
              })}

            </div>


            {/* Legend */}

            <div className="mt-12 flex flex-wrap gap-6 border-t border-white/10 pt-6">

              <div className="flex items-center gap-2 text-sm text-zinc-400">

                <span className="h-4 w-4 rounded bg-zinc-800" />

                Available

              </div>


              <div className="flex items-center gap-2 text-sm text-zinc-400">

                <span className="h-4 w-4 rounded bg-indigo-500" />

                Selected

              </div>


              <div className="flex items-center gap-2 text-sm text-zinc-400">

                <span className="h-4 w-4 rounded bg-zinc-950" />

                Booked

              </div>

            </div>

          </div>


          {/* Booking summary */}

          <aside className="h-fit rounded-3xl border border-white/10 bg-zinc-900/60 p-7">

            <p className="text-sm font-medium uppercase tracking-[0.25em] text-indigo-400">
              Your Selection
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              Booking Summary
            </h2>


            {selectedSeat ? (

              <div className="mt-8">

                {/* Selected seat */}

                <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-5">

                  <p className="text-sm text-zinc-400">
                    Selected seat
                  </p>

                  <p className="mt-2 text-3xl font-bold text-white">
                    {selectedSeat.row}
                    {selectedSeat.seat_number}
                  </p>

                </div>


                {/* Details */}

                <div className="mt-7 space-y-5">

                  <div>

                    <p className="text-sm text-zinc-500">
                      Section
                    </p>

                    <p className="mt-1 font-medium text-white">
                      {selectedSeat.section.name}
                    </p>

                  </div>


                  <div className="grid grid-cols-2 gap-5">

                    <div>

                      <p className="text-sm text-zinc-500">
                        Row
                      </p>

                      <p className="mt-1 font-medium text-white">
                        {selectedSeat.row}
                      </p>

                    </div>


                    <div>

                      <p className="text-sm text-zinc-500">
                        Seat
                      </p>

                      <p className="mt-1 font-medium text-white">
                        {selectedSeat.seat_number}
                      </p>

                    </div>

                  </div>


                  <div>

                    <p className="text-sm text-zinc-500">
                      Price
                    </p>

                    <p className="mt-1 text-xl font-semibold text-white">
                      ₹{selectedSeat.section.price}
                    </p>

                  </div>

                </div>


                {/* Continue */}

                <button
                  type="button"
                  onClick={handleContinue}
                  className="mt-8 w-full rounded-xl bg-white px-5 py-3.5 font-medium text-black transition hover:bg-zinc-200"
                >
                  Continue to Checkout →
                </button>

              </div>

            ) : (

              <div className="mt-8 rounded-2xl border border-dashed border-white/15 px-6 py-10 text-center">

                <p className="text-zinc-400">
                  Select a seat from the map
                </p>

                <p className="mt-1 text-sm text-zinc-600">
                  Available seats can be selected.
                </p>

              </div>

            )}

          </aside>

        </div>

      </div>

    </div>
  );
}

export default SeatSelection;