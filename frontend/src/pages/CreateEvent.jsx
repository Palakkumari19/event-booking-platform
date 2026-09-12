import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createOrganizerEvent } from "../api/events";
import apiClient from "../api/client";

function CreateEvent() {
  const navigate = useNavigate();

  const [venues, setVenues] = useState([]);
  const [sections, setSections] = useState([]);

  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingSections, setLoadingSections] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    venue: "",
    start_time: "",
    end_time: "",
    booking_start: "",
    booking_end: "",
  });

  const [sectionPrices, setSectionPrices] = useState({});

  // ---------------------------------------
  // Load venues
  // ---------------------------------------
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoadingVenues(true);

        const response = await apiClient.get("/venues/");
        setVenues(response.data);
      } catch (err) {
        console.error("Failed to load venues:", err);
        setError("Unable to load venues.");
      } finally {
        setLoadingVenues(false);
      }
    };

    fetchVenues();
  }, []);

  // ---------------------------------------
  // Load sections when venue changes
  // ---------------------------------------
  useEffect(() => {
    if (!formData.venue) {
      setSections([]);
      setSectionPrices({});
      return;
    }

    const fetchSections = async () => {
      try {
        setLoadingSections(true);
        setError("");

        const response = await apiClient.get(
          `/venues/${formData.venue}/sections/`
        );

        setSections(response.data);

        const initialPrices = {};

        response.data.forEach((section) => {
          initialPrices[section.id] = "";
        });

        setSectionPrices(initialPrices);
      } catch (err) {
        console.error(
          "Failed to load venue sections:",
          err
        );

        setSections([]);
        setSectionPrices({});
        setError("Unable to load venue sections.");
      } finally {
        setLoadingSections(false);
      }
    };

    fetchSections();
  }, [formData.venue]);

  // ---------------------------------------
  // Form changes
  // ---------------------------------------
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // ---------------------------------------
  // Section price changes
  // ---------------------------------------
  const handlePriceChange = (sectionId, value) => {
    setSectionPrices((current) => ({
      ...current,
      [sectionId]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // ---------------------------------------
  // API error helper
  // ---------------------------------------
  const getErrorMessage = (err) => {
    const data = err?.response?.data;

    if (!data) {
      return "Unable to create event. Please try again.";
    }

    if (typeof data === "string") {
      return data;
    }

    if (data.detail) {
      return data.detail;
    }

    if (data.sections) {
      if (Array.isArray(data.sections)) {
        return data.sections.join(" ");
      }

      return String(data.sections);
    }

    const firstField = Object.keys(data)[0];

    if (firstField) {
      const value = data[firstField];

      if (Array.isArray(value)) {
        return value.join(" ");
      }

      return String(value);
    }

    return "Unable to create event. Please check your details.";
  };

  // ---------------------------------------
  // Submit
  // ---------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.title.trim()) {
      setError("Please enter an event title.");
      return;
    }

    if (!formData.venue) {
      setError("Please select a venue.");
      return;
    }

    if (!formData.start_time || !formData.end_time) {
      setError("Please enter the event start and end time.");
      return;
    }

    if (
      !formData.booking_start ||
      !formData.booking_end
    ) {
      setError(
        "Please enter the booking start and end time."
      );
      return;
    }

    const selectedSections = sections
      .filter(
        (section) =>
          sectionPrices[section.id] !== undefined &&
          sectionPrices[section.id] !== ""
      )
      .map((section) => ({
        section: section.id,
        price: sectionPrices[section.id],
      }));

    if (selectedSections.length === 0) {
      setError(
        "Please add a price for at least one ticket section."
      );
      return;
    }

    const invalidPrice = selectedSections.some(
      (section) =>
        Number(section.price) <= 0 ||
        Number.isNaN(Number(section.price))
    );

    if (invalidPrice) {
      setError(
        "Ticket prices must be greater than zero."
      );
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        venue: Number(formData.venue),
        start_time: new Date(
          formData.start_time
        ).toISOString(),
        end_time: new Date(
          formData.end_time
        ).toISOString(),
        booking_start: new Date(
          formData.booking_start
        ).toISOString(),
        booking_end: new Date(
          formData.booking_end
        ).toISOString(),
        sections: selectedSections,
      };

      const createdEvent =
        await createOrganizerEvent(payload);

      navigate(
        `/organizer/events/${createdEvent.id}`
      );
    } catch (err) {
      console.error(
        "Failed to create event:",
        err
      );

      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#fffdf7] px-6 py-10 md:py-14">
      <div className="mx-auto max-w-5xl">

        {/* Back */}
        <Link
          to="/organizer"
          className="text-sm font-semibold text-black/50 transition hover:text-[#CA6180]"
        >
          ← Back to dashboard
        </Link>

        {/* Header */}
        <div className="mt-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#CA6180]">
            Organizer / New Event
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-black md:text-5xl">
            Create an event.
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-black/55">
            Set up your event details, choose your venue and
            decide how much each ticket section costs.
          </p>
        </div>

        {error && (
          <div className="mt-8 rounded-3xl border border-[#CA6180]/20 bg-[#FCB7C7]/35 p-5">
            <p className="font-bold text-[#7d3049]">
              {error}
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6"
        >

          {/* Basic details */}
          <section className="rounded-[2rem] border border-black/10 bg-white p-7 shadow-[0_12px_35px_rgba(0,0,0,0.04)] md:p-8">
            <div className="mb-7">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-black/35">
                01
              </p>

              <h2 className="mt-1 text-2xl font-black text-black">
                Event details
              </h2>
            </div>

            <div className="space-y-6">

              <div>
                <label
                  htmlFor="title"
                  className="text-sm font-bold text-black"
                >
                  Event Name
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Tech Fest 2026"
                  className="mt-2 w-full rounded-2xl border border-black/15 bg-[#fffdf7] px-4 py-3.5 text-sm text-black outline-none transition placeholder:text-black/25 focus:border-[#CA6180] focus:ring-4 focus:ring-[#FCB7C7]/40"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="text-sm font-bold text-black"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell attendees what this event is about..."
                  className="mt-2 w-full resize-none rounded-2xl border border-black/15 bg-[#fffdf7] px-4 py-3.5 text-sm leading-6 text-black outline-none transition placeholder:text-black/25 focus:border-[#CA6180] focus:ring-4 focus:ring-[#FCB7C7]/40"
                />
              </div>

              <div>
                <label
                  htmlFor="venue"
                  className="text-sm font-bold text-black"
                >
                  Venue
                </label>

                <select
                  id="venue"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  disabled={loadingVenues}
                  className="mt-2 w-full rounded-2xl border border-black/15 bg-[#fffdf7] px-4 py-3.5 text-sm text-black outline-none transition focus:border-[#CA6180] focus:ring-4 focus:ring-[#FCB7C7]/40 disabled:opacity-50"
                >
                  <option value="">
                    {loadingVenues
                      ? "Loading venues..."
                      : "Select a venue"}
                  </option>

                  {venues.map((venue) => (
                    <option
                      key={venue.id}
                      value={venue.id}
                    >
                      {venue.name}
                      {venue.city
                        ? ` — ${venue.city}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </section>

          {/* Schedule */}
          <section className="rounded-[2rem] border border-black/10 bg-white p-7 shadow-[0_12px_35px_rgba(0,0,0,0.04)] md:p-8">
            <div className="mb-7">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-black/35">
                02
              </p>

              <h2 className="mt-1 text-2xl font-black text-black">
                Schedule
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">

              <div>
                <label
                  htmlFor="start_time"
                  className="text-sm font-bold text-black"
                >
                  Event Starts
                </label>

                <input
                  id="start_time"
                  name="start_time"
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-black/15 bg-[#fffdf7] px-4 py-3.5 text-sm text-black outline-none transition focus:border-[#CA6180] focus:ring-4 focus:ring-[#FCB7C7]/40"
                />
              </div>

              <div>
                <label
                  htmlFor="end_time"
                  className="text-sm font-bold text-black"
                >
                  Event Ends
                </label>

                <input
                  id="end_time"
                  name="end_time"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-black/15 bg-[#fffdf7] px-4 py-3.5 text-sm text-black outline-none transition focus:border-[#CA6180] focus:ring-4 focus:ring-[#FCB7C7]/40"
                />
              </div>

              <div>
                <label
                  htmlFor="booking_start"
                  className="text-sm font-bold text-black"
                >
                  Booking Opens
                </label>

                <input
                  id="booking_start"
                  name="booking_start"
                  type="datetime-local"
                  value={formData.booking_start}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-black/15 bg-[#fffdf7] px-4 py-3.5 text-sm text-black outline-none transition focus:border-[#CA6180] focus:ring-4 focus:ring-[#FCB7C7]/40"
                />
              </div>

              <div>
                <label
                  htmlFor="booking_end"
                  className="text-sm font-bold text-black"
                >
                  Booking Closes
                </label>

                <input
                  id="booking_end"
                  name="booking_end"
                  type="datetime-local"
                  value={formData.booking_end}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-black/15 bg-[#fffdf7] px-4 py-3.5 text-sm text-black outline-none transition focus:border-[#CA6180] focus:ring-4 focus:ring-[#FCB7C7]/40"
                />
              </div>

            </div>
          </section>

          {/* Ticket sections */}
          <section className="rounded-[2rem] border border-black/10 bg-white p-7 shadow-[0_12px_35px_rgba(0,0,0,0.04)] md:p-8">
            <div className="mb-7">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-black/35">
                03
              </p>

              <h2 className="mt-1 text-2xl font-black text-black">
                Ticket pricing
              </h2>

              <p className="mt-2 text-sm text-black/45">
                Select the sections you want to sell and set
                their prices.
              </p>
            </div>

            {!formData.venue ? (
              <div className="rounded-2xl bg-[#FEFD99] p-5">
                <p className="text-sm font-semibold text-black/70">
                  Select a venue first to see its ticket sections.
                </p>
              </div>
            ) : loadingSections ? (
              <div className="rounded-2xl bg-[#fffdf7] p-6 text-center">
                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-black/10 border-t-[#CA6180]" />

                <p className="mt-3 text-sm text-black/45">
                  Loading sections...
                </p>
              </div>
            ) : sections.length === 0 ? (
              <div className="rounded-2xl bg-[#FCB7C7]/30 p-5">
                <p className="text-sm font-semibold text-[#7d3049]">
                  This venue has no sections available.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-[#fffdf7] p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-black text-black">
                        {section.name}
                      </p>

                      {section.capacity && (
                        <p className="mt-1 text-xs font-medium text-black/40">
                          Capacity: {section.capacity}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-black/45">
                        ₹
                      </span>

                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={
                          sectionPrices[section.id] || ""
                        }
                        onChange={(event) =>
                          handlePriceChange(
                            section.id,
                            event.target.value
                          )
                        }
                        placeholder="Price"
                        className="w-32 rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm font-bold text-black outline-none transition placeholder:text-black/25 focus:border-[#CA6180] focus:ring-4 focus:ring-[#FCB7C7]/40"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <Link
              to="/organizer"
              className="rounded-full border border-black/10 bg-white px-6 py-3 text-center text-sm font-bold text-black transition hover:border-black/20 hover:bg-black/5"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting || loadingSections}
              className="rounded-full bg-black px-7 py-3 text-sm font-black text-white transition hover:bg-[#CA6180] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Creating..."
                : "Create Event →"}
            </button>

          </div>

        </form>
      </div>
    </main>
  );
}

export default CreateEvent;