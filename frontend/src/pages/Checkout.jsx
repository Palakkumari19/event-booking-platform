import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createBooking } from "../api/bookings";
import {
  createPaymentLink,
  checkPaymentStatus,
} from "../api/payments";


function Checkout() {

  const navigate = useNavigate();

  const [selectedSeat, setSelectedSeat] =
    useState(null);

  const [bookingId, setBookingId] =
    useState(null);

  const [paymentLink, setPaymentLink] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [paymentCreated, setPaymentCreated] =
    useState(false);

  const [paymentStatus, setPaymentStatus] =
    useState("PENDING");

  const [error, setError] =
    useState("");

  const [timeLeft, setTimeLeft] =
    useState(null);


  // ---------------------------------------
  // Load checkout information
  // ---------------------------------------

  useEffect(() => {

    const storedSeat =
      sessionStorage.getItem(
        "checkout_seat"
      );

    const storedBookingId =
      sessionStorage.getItem(
        "checkout_booking_id"
      );

    const expiresIn =
      sessionStorage.getItem(
        "checkout_hold_expires_in"
      );

    if (storedSeat) {

      try {

        setSelectedSeat(
          JSON.parse(storedSeat)
        );

      } catch (err) {

        console.error(
          "Failed to parse selected seat",
          err
        );

      }

    }

    if (storedBookingId) {
      setBookingId(
        storedBookingId
      );
    }

    if (expiresIn) {
      setTimeLeft(
        Number(expiresIn)
      );
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

      setTimeLeft(
        (previous) =>
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
      localStorage.getItem(
        "access_token"
      );

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

      let currentBookingId =
        bookingId;


      if (!currentBookingId) {

        const booking =
          await createBooking(
            eventId,
            seatId,
            accessToken
          );

        currentBookingId =
          booking.id;

        setBookingId(
          currentBookingId
        );

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


      /*
       * Open Razorpay payment link.
       *
       * We open it in a new tab so the
       * checkout page remains available.
       */

      window.open(
        payment.payment_link,
        "_blank"
      );

    } catch (err) {
        console.error("CHECKOUT ERROR:", err);
        console.log("STATUS:", err.response?.status);
        console.log("RESPONSE DATA:", err.response?.data);
        console.log("REQUEST DATA:", err.config?.data);

        const message =
            err.response?.data?.detail ||
            err.response?.data?.non_field_errors?.[0] ||
            "Unable to start payment.";

        setError(message);
    } finally {

      setProcessing(false);

    }
  };


  // ---------------------------------------
  // Check payment
  // ---------------------------------------

  const handleCheckPayment =
    async () => {

      const accessToken =
        localStorage.getItem(
          "access_token"
        );

      if (!accessToken || !bookingId) {
        return;
      }

      try {

        setPaymentStatus(
          "CHECKING"
        );

        const result =
          await checkPaymentStatus(
            bookingId,
            accessToken
          );


        if (result.paid) {

          setPaymentStatus(
            "SUCCESS"
          );

          /*
           * PaymentService already:
           *
           * - marks payment SUCCESS
           * - confirms booking
           * - creates ticket
           */

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

            navigate(
              "/my-tickets"
            );

          }, 1000);

        } else {

          setPaymentStatus(
            "PENDING"
          );

        }

      } catch (err) {

        console.error(
          "Payment status check failed:",
          err
        );

        setPaymentStatus(
          "ERROR"
        );

      }

    };


  // ---------------------------------------
  // Loading
  // ---------------------------------------

  if (loading) {

    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">

        <div className="h-9 w-9 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-400" />

      </div>
    );

  }


  // ---------------------------------------
  // No seat
  // ---------------------------------------

  if (!selectedSeat) {

    return (
      <div className="min-h-screen bg-[#09090b] px-6 py-16 text-white">

        <div className="mx-auto max-w-2xl">

          <div className="rounded-3xl border border-white/10 bg-zinc-900 p-8">

            <h1 className="text-3xl font-bold">
              No seat selected
            </h1>

            <p className="mt-3 text-zinc-400">
              Please select a seat before continuing.
            </p>

            <Link
              to="/events"
              className="mt-8 inline-block rounded-xl bg-white px-6 py-3 font-medium text-black"
            >
              Browse Events
            </Link>

          </div>

        </div>

      </div>
    );

  }


  // ---------------------------------------
  // Checkout UI
  // ---------------------------------------

  return (
    <div className="min-h-screen bg-[#09090b] px-6 py-12 text-white">

      <div className="mx-auto max-w-4xl">

        <Link
          to={`/events/${sessionStorage.getItem(
            "checkout_event_id"
          )}/seats`}
          className="text-sm text-zinc-400 transition hover:text-white"
        >
          ← Back to seats
        </Link>


        <div className="mt-10">

          <p className="text-sm font-medium uppercase tracking-[0.25em] text-indigo-400">
            Checkout
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Complete your booking
          </h1>

          <p className="mt-4 text-zinc-400">
            Review your seat and proceed to payment.
          </p>

        </div>


        {error && (

          <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>

        )}


        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_320px]">


          {/* -------------------------------- */}
          {/* Booking summary */}
          {/* -------------------------------- */}

          <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-8">

            <h2 className="text-xl font-semibold">
              Booking Summary
            </h2>


            <div className="mt-8 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-6">

              <p className="text-sm text-zinc-400">
                Seat
              </p>

              <p className="mt-2 text-4xl font-bold">
                {selectedSeat.row}
                {selectedSeat.seat_number}
              </p>

              <p className="mt-3 text-zinc-300">
                {selectedSeat.section.name}
              </p>

            </div>


            <div className="mt-8 space-y-5">

              <div className="flex justify-between">

                <span className="text-zinc-500">
                  Section
                </span>

                <span className="font-medium">
                  {selectedSeat.section.name}
                </span>

              </div>


              <div className="flex justify-between">

                <span className="text-zinc-500">
                  Row
                </span>

                <span className="font-medium">
                  {selectedSeat.row}
                </span>

              </div>


              <div className="flex justify-between">

                <span className="text-zinc-500">
                  Seat
                </span>

                <span className="font-medium">
                  {selectedSeat.seat_number}
                </span>

              </div>


              <div className="border-t border-white/10 pt-5 flex justify-between">

                <span className="text-zinc-400">
                  Total
                </span>

                <span className="text-2xl font-bold">
                  ₹{selectedSeat.section.price}
                </span>

              </div>

            </div>

          </div>


          {/* -------------------------------- */}
          {/* Payment */}
          {/* -------------------------------- */}

          <div className="h-fit rounded-3xl border border-white/10 bg-zinc-900/70 p-7">

            {timeLeft !== null && (

              <div className={`rounded-xl p-4 text-center ${
                timeLeft > 60
                  ? "bg-indigo-500/10 text-indigo-300"
                  : "bg-red-500/10 text-red-300"
              }`}>

                <p className="text-sm">
                  Seat reserved for
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {Math.floor(timeLeft / 60)}:
                  {String(
                    timeLeft % 60
                  ).padStart(2, "0")}
                </p>

              </div>

            )}


            {!paymentCreated ? (

              <button
                type="button"
                onClick={handlePayment}
                disabled={
                  processing ||
                  timeLeft === 0
                }
                className="mt-6 w-full rounded-xl bg-white px-5 py-4 font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {processing
                  ? "Preparing payment..."
                  : "Proceed to Payment →"}

              </button>

            ) : (

              <div className="mt-6">

                <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300">

                  Payment link created successfully.

                </div>


                <a
                  href={paymentLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 block w-full rounded-xl bg-white px-5 py-4 text-center font-medium text-black transition hover:bg-zinc-200"
                >
                  Open Payment Page →
                </a>


                <button
                  type="button"
                  onClick={
                    handleCheckPayment
                  }
                  disabled={
                    paymentStatus ===
                    "CHECKING"
                  }
                  className="mt-3 w-full rounded-xl border border-white/10 px-5 py-4 font-medium text-white transition hover:bg-white/5"
                >

                  {paymentStatus ===
                  "CHECKING"
                    ? "Checking..."
                    : "I've completed payment"}

                </button>


                {paymentStatus ===
                  "PENDING" && (

                  <p className="mt-4 text-center text-xs text-zinc-500">
                    After completing payment,
                    click the button above to
                    verify your payment.
                  </p>

                )}


                {paymentStatus ===
                  "SUCCESS" && (

                  <div className="mt-4 rounded-xl bg-green-500/10 p-4 text-center text-sm text-green-300">
                    Payment successful! Your
                    ticket is being generated...
                  </div>

                )}

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default Checkout;