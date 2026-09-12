import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createBooking } from "../api/bookings";
import {
  createPaymentLink,
  checkPaymentStatus,
} from "../api/payments";

function Checkout() {
  const navigate = useNavigate();

  const [selectedSeat, setSelectedSeat] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [paymentLink, setPaymentLink] = useState("");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentCreated, setPaymentCreated] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("PENDING");

  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);

  // ---------------------------------------
  // Load checkout information
  // ---------------------------------------

  useEffect(() => {
    const storedSeat = sessionStorage.getItem(
      "checkout_seat"
    );

    const storedBookingId = sessionStorage.getItem(
      "checkout_booking_id"
    );

    const expiresIn = sessionStorage.getItem(
      "checkout_hold_expires_in"
    );

    if (storedSeat) {
      try {
        setSelectedSeat(JSON.parse(storedSeat));
      } catch (err) {
        console.error(
          "Failed to parse selected seat",
          err
        );
      }
    }

    if (storedBookingId) {
      setBookingId(storedBookingId);
    }

    if (expiresIn) {
      setTimeLeft(Number(expiresIn));
    }

    setLoading(false);
  }, []);

  // ---------------------------------------
  // Countdown
  // ---------------------------------------

  useEffect(() => {
    if (
      timeLeft === null ||
      timeLeft <= 0
    ) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) =>
        previous > 0
          ? previous - 1
          : 0
      );
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [timeLeft]);

  // ---------------------------------------
  // Create booking + payment
  // ---------------------------------------

  const handlePayment = async () => {
    const accessToken =
      localStorage.getItem("access_token");

    const eventId =
      sessionStorage.getItem(
        "checkout_event_id"
      );

    const seatId =
      sessionStorage.getItem(
        "checkout_seat_id"
      );

    if (!accessToken) {
      navigate("/login");
      return;
    }

    if (!eventId || !seatId) {
      setError(
        "Your seat selection has expired. Please select a seat again."
      );
      return;
    }

    try {
      setProcessing(true);
      setError("");

      // -----------------------------------
      // Step 1: Create pending booking
      // -----------------------------------

      let currentBookingId = bookingId;

      if (!currentBookingId) {
        const booking = await createBooking(
          eventId,
          seatId,
          accessToken
        );

        currentBookingId = booking.id;

        setBookingId(currentBookingId);

        sessionStorage.setItem(
          "checkout_booking_id",
          currentBookingId
        );
      }

      // -----------------------------------
      // Step 2: Create payment link
      // -----------------------------------

      const payment =
        await createPaymentLink(
          currentBookingId,
          accessToken
        );

      setPaymentLink(
        payment.payment_link
      );

      setPaymentCreated(true);

      window.open(
        payment.payment_link,
        "_blank"
      );
    } catch (err) {
      console.error(
        "CHECKOUT ERROR:",
        err
      );

      console.log(
        "STATUS:",
        err.response?.status
      );

      console.log(
        "RESPONSE DATA:",
        err.response?.data
      );

      console.log(
        "REQUEST DATA:",
        err.config?.data
      );

      const message =
        err.response?.data?.detail ||
        err.response?.data
          ?.non_field_errors?.[0] ||
        "Unable to start payment.";

      setError(message);
    } finally {
      setProcessing(false);
    }
  };

  // ---------------------------------------
  // Check payment
  // ---------------------------------------

  const handleCheckPayment = async () => {
    const accessToken =
      localStorage.getItem(
        "access_token"
      );

    if (!accessToken || !bookingId) {
      return;
    }

    try {
      setPaymentStatus("CHECKING");

      const result =
        await checkPaymentStatus(
          bookingId,
          accessToken
        );

      if (result.paid) {
        setPaymentStatus("SUCCESS");

        sessionStorage.removeItem(
          "checkout_event_id"
        );

        sessionStorage.removeItem(
          "checkout_seat_id"
        );

        sessionStorage.removeItem(
          "checkout_seat"
        );

        sessionStorage.removeItem(
          "checkout_hold_expires_in"
        );

        sessionStorage.removeItem(
          "checkout_booking_id"
        );

        setTimeout(() => {
          navigate("/tickets");
        }, 1000);
      } else {
        setPaymentStatus("PENDING");
      }
    } catch (err) {
      console.error(
        "Payment status check failed:",
        err
      );

      setPaymentStatus("ERROR");
    }
  };

  // ---------------------------------------
  // Format timer
  // ---------------------------------------

  const formattedTime =
    timeLeft !== null
      ? `${Math.floor(timeLeft / 60)}:${String(
          timeLeft % 60
        ).padStart(2, "0")}`
      : null;

  // ---------------------------------------
  // Loading
  // ---------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffdf7] flex items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-black/10 border-t-[#CA6180]" />
      </div>
    );
  }

  // ---------------------------------------
  // No seat
  // ---------------------------------------

  if (!selectedSeat) {
    return (
      <div className="min-h-screen bg-[#fffdf7] px-6 py-16 text-[#171717]">
        <div className="mx-auto max-w-2xl">

          <Link
            to="/events"
            className="text-sm font-medium text-black/45 transition hover:text-black"
          >
            ← Browse events
          </Link>

          <div className="mt-10 overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.05)]">

            <div className="bg-[#FCB7C7] p-8">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-black/45">
                EVENTLY / CHECKOUT
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-tight">
                No seat selected.
              </h1>
            </div>

            <div className="p-8">
              <p className="text-black/50">
                Please select a seat before
                continuing to checkout.
              </p>

              <Link
                to="/events"
                className="mt-8 inline-flex rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition hover:bg-[#CA6180]"
              >
                Browse Events →
              </Link>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------
  // Checkout UI
  // ---------------------------------------

  return (
    <div className="min-h-screen bg-[#fffdf7] px-5 py-10 text-[#171717] sm:px-6 lg:py-12">

      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <Link
          to={`/events/${sessionStorage.getItem(
            "checkout_event_id"
          )}/seats`}
          className="inline-flex items-center gap-2 text-sm font-medium text-black/45 transition hover:text-black"
        >
          ← Back to seats
        </Link>

        {/* Header */}
        <div className="mt-10 max-w-3xl">

          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#CA6180]" />

            <p className="text-xs font-black uppercase tracking-[0.28em] text-black/40">
              EVENTLY / CHECKOUT
            </p>
          </div>

          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
            Almost there.
          </h1>

          <p className="mt-4 text-base leading-7 text-black/50">
            Review your selection, complete payment,
            and your ticket is yours.
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="mt-8 rounded-2xl border border-[#CA6180]/30 bg-[#FCB7C7]/35 px-5 py-4 text-sm font-medium text-[#7d3049]">
            {error}
          </div>
        )}

        {/* Main */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">

          {/* -------------------------------- */}
          {/* Booking Summary */}
          {/* -------------------------------- */}

          <section className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.04)]">

            {/* Top visual */}
            <div className="relative overflow-hidden bg-[#CA6180] px-7 py-8 sm:px-9">

              <div className="absolute -right-12 -top-20 h-52 w-52 rounded-full bg-[#FEFD99]" />

              <div className="absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-[#9ED3DC]" />

              <div className="relative">

                <p className="text-xs font-black uppercase tracking-[0.25em] text-black/45">
                  Your booking
                </p>

                <h2 className="mt-3 max-w-xl text-3xl font-black tracking-[-0.03em] sm:text-4xl">
                  One seat.
                  <br />
                  One ticket.
                </h2>

              </div>
            </div>

            <div className="p-7 sm:p-9">

              {/* Seat card */}
              <div className="relative overflow-hidden rounded-[1.5rem] bg-[#9ED3DC] p-7">

                <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/25" />

                <p className="relative text-xs font-black uppercase tracking-[0.2em] text-black/45">
                  Selected seat
                </p>

                <div className="relative mt-3 flex items-end justify-between gap-4">

                  <div>
                    <p className="text-5xl font-black tracking-[-0.04em]">
                      {selectedSeat.row}
                      {selectedSeat.seat_number}
                    </p>

                    <p className="mt-2 font-bold text-black/55">
                      {selectedSeat.section.name}
                    </p>
                  </div>

                  <div className="rounded-full bg-black px-4 py-2 text-xs font-bold text-white">
                    1 ticket
                  </div>

                </div>

              </div>

              {/* Details */}
              <div className="mt-8">

                <p className="text-xs font-black uppercase tracking-[0.2em] text-black/35">
                  Booking details
                </p>

                <div className="mt-5 divide-y divide-black/10">

                  <div className="flex items-center justify-between py-4">
                    <span className="text-sm text-black/45">
                      Section
                    </span>

                    <span className="text-sm font-bold">
                      {selectedSeat.section.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <span className="text-sm text-black/45">
                      Row
                    </span>

                    <span className="text-sm font-bold">
                      {selectedSeat.row}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <span className="text-sm text-black/45">
                      Seat
                    </span>

                    <span className="text-sm font-bold">
                      {selectedSeat.seat_number}
                    </span>
                  </div>

                </div>

              </div>

              {/* Total */}
              <div className="mt-6 flex items-end justify-between rounded-2xl bg-[#fffdf7] p-5">

                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-black/35">
                    Total
                  </p>

                  <p className="mt-1 text-sm text-black/40">
                    Including your selected seat
                  </p>
                </div>

                <p className="text-2xl font-black">
                  ₹{selectedSeat.section.price}
                </p>

              </div>

            </div>
          </section>

          {/* -------------------------------- */}
          {/* Payment */}
          {/* -------------------------------- */}

          <aside className="h-fit lg:sticky lg:top-6">

            <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.05)]">

              {/* Payment heading */}
              <div className="border-b border-black/10 px-7 py-6">

                <p className="text-xs font-black uppercase tracking-[0.25em] text-[#CA6180]">
                  Payment
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight">
                  Secure your ticket.
                </h2>

              </div>

              <div className="p-7">

                {/* Timer */}
                {timeLeft !== null && (
                  <div
                    className={`rounded-2xl p-5 ${
                      timeLeft > 60
                        ? "bg-[#FEFD99]"
                        : "bg-[#FCB7C7]"
                    }`}
                  >

                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-black/45">
                          Seat hold
                        </p>

                        <p className="mt-1 text-sm font-medium text-black/60">
                          Complete checkout before
                          your hold expires.
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-black tabular-nums">
                          {formattedTime}
                        </p>
                      </div>

                    </div>

                  </div>
                )}

                {/* Payment initial state */}
                {!paymentCreated ? (
                  <div>

                    <div className="mt-7 rounded-2xl border border-black/10 bg-[#fffdf7] p-5">

                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9ED3DC] text-lg">
                          ₹
                        </div>

                        <div>
                          <p className="text-sm font-bold">
                            Online payment
                          </p>

                          <p className="text-xs text-black/40">
                            Secure payment via Razorpay
                          </p>
                        </div>
                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={handlePayment}
                      disabled={
                        processing ||
                        timeLeft === 0
                      }
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#CA6180] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {processing
                        ? "Preparing payment..."
                        : "Proceed to payment →"}
                    </button>

                    <p className="mt-4 text-center text-xs leading-5 text-black/35">
                      Your seat is temporarily
                      reserved while you complete
                      payment.
                    </p>

                  </div>
                ) : (
                  <div>

                    {/* Success message */}
                    <div className="rounded-2xl bg-[#9ED3DC] p-5">

                      <div className="flex items-start gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-sm text-white">
                          ✓
                        </div>

                        <div>
                          <p className="font-bold">
                            Payment link ready
                          </p>

                          <p className="mt-1 text-sm leading-5 text-black/55">
                            Complete payment in the
                            Razorpay page that opened.
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* Open payment */}
                    <a
                      href={paymentLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 flex w-full items-center justify-center rounded-xl bg-black px-5 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#CA6180]"
                    >
                      Open payment page →
                    </a>

                    {/* Verify */}
                    <button
                      type="button"
                      onClick={
                        handleCheckPayment
                      }
                      disabled={
                        paymentStatus ===
                        "CHECKING"
                      }
                      className="mt-3 w-full rounded-xl border border-black/10 bg-white px-5 py-4 text-sm font-bold text-black transition hover:bg-[#fffdf7] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {paymentStatus ===
                      "CHECKING"
                        ? "Checking payment..."
                        : "I've completed payment"}
                    </button>

                    {/* Pending */}
                    {paymentStatus ===
                      "PENDING" && (
                      <div className="mt-5 rounded-2xl bg-[#FEFD99]/60 p-4">

                        <p className="text-xs font-bold leading-5 text-black/55">
                          After completing payment,
                          click "I've completed
                          payment" to verify your
                          transaction.
                        </p>

                      </div>
                    )}

                    {/* Success */}
                    {paymentStatus ===
                      "SUCCESS" && (
                      <div className="mt-5 rounded-2xl bg-[#9ED3DC] p-5 text-center">

                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-black text-lg text-white">
                          ✓
                        </div>

                        <p className="mt-3 font-black">
                          Payment successful!
                        </p>

                        <p className="mt-1 text-sm text-black/50">
                          Your ticket is being
                          generated...
                        </p>

                      </div>
                    )}

                    {/* Error */}
                    {paymentStatus ===
                      "ERROR" && (
                      <div className="mt-5 rounded-2xl bg-[#FCB7C7] p-4 text-sm font-medium text-black/60">
                        We couldn't verify the
                        payment yet. Please try
                        again.
                      </div>
                    )}

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

export default Checkout;