import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  getOrganizerEvent,
  updateOrganizerEvent,
  publishOrganizerEvent,
  cancelOrganizerEvent,
} from "../api/events";

import { getVenues, getVenueSections } from "../api/venues";


function formatDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}


function toISOString(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}


function ManageEvent() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [venues, setVenues] = useState([]);
  const [venueSections, setVenueSections] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    venue: "",
    start_time: "",
    end_time: "",
    booking_start: "",
    booking_end: "",
  });

  const [sections, setSections] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");


  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [eventData, venueData] = await Promise.all([
          getOrganizerEvent(eventId),
          getVenues(),
        ]);

        setEvent(eventData);
        setVenues(venueData);

        setFormData({
          title: eventData.title || "",
          description: eventData.description || "",
          venue: eventData.venue?.id || "",
          start_time: formatDateTimeLocal(eventData.start_time),
          end_time: formatDateTimeLocal(eventData.end_time),
          booking_start: formatDateTimeLocal(eventData.booking_start),
          booking_end: formatDateTimeLocal(eventData.booking_end),
        });

        setSections(
          (eventData.sections || []).map((section) => ({
            section: section.id,
            name: section.name,
            price: section.price,
          }))
        );

        if (eventData.venue?.id) {
          const sectionData = await getVenueSections(
            eventData.venue.id
          );

          setVenueSections(sectionData);
        }
      } catch (err) {
        console.error("Failed to load event:", err);

        setError(
          err.response?.data?.detail ||
            "Unable to load this event."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [eventId]);


  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };


  const handleVenueChange = async (e) => {
    const venueId = e.target.value;

    setFormData((current) => ({
      ...current,
      venue: venueId,
    }));

    setMessage("");
    setError("");

    if (!venueId) {
      setVenueSections([]);
      return;
    }

    try {
      const data = await getVenueSections(venueId);
      setVenueSections(data);

      /*
       * If the organizer changes the venue, reset the ticket
       * sections so they can choose prices for sections belonging
       * to the new venue.
       */
      setSections([]);
    } catch (err) {
      console.error("Failed to load venue sections:", err);

      setError("Unable to load ticket sections for this venue.");
    }
  };


  const handlePriceChange = (sectionId, price) => {
    setSections((current) =>
      current.map((section) =>
        section.section === sectionId
          ? {
              ...section,
              price,
            }
          : section
      )
    );

    setMessage("");
    setError("");
  };


  const handleAddSection = (section) => {
    const alreadyAdded = sections.some(
      (item) => item.section === section.id
    );

    if (alreadyAdded) {
      return;
    }

    setSections((current) => [
      ...current,
      {
        section: section.id,
        name: section.name,
        price: "",
      },
    ]);

    setMessage("");
    setError("");
  };


  const handleRemoveSection = (sectionId) => {
    setSections((current) =>
      current.filter(
        (section) => section.section !== sectionId
      )
    );

    setMessage("");
    setError("");
  };


  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      if (!formData.title.trim()) {
        setError("Event name is required.");
        return;
      }

      if (!formData.venue) {
        setError("Please select a venue.");
        return;
      }

      if (!formData.start_time || !formData.end_time) {
        setError("Event start and end times are required.");
        return;
      }

      if (
        !formData.booking_start ||
        !formData.booking_end
      ) {
        setError("Booking start and end times are required.");
        return;
      }

      if (sections.length === 0) {
        setError("Add at least one ticket section.");
        return;
      }

      const invalidPrice = sections.some(
        (section) =>
          !section.price ||
          Number(section.price) <= 0
      );

      if (invalidPrice) {
        setError(
          "Every ticket section must have a price greater than zero."
        );
        return;
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        venue: Number(formData.venue),
        start_time: toISOString(formData.start_time),
        end_time: toISOString(formData.end_time),
        booking_start: toISOString(formData.booking_start),
        booking_end: toISOString(formData.booking_end),
        sections: sections.map((section) => ({
          section: Number(section.section),
          price: String(section.price),
        })),
      };

      const updatedEvent = await updateOrganizerEvent(
        eventId,
        payload
      );

      setEvent((current) => ({
        ...current,
        ...updatedEvent,
      }));

      setMessage("Event changes saved successfully.");
    } catch (err) {
      console.error("Failed to save event:", err);

      const data = err.response?.data;

      if (typeof data === "object" && data !== null) {
        const firstError = Object.values(data)[0];

        if (Array.isArray(firstError)) {
          setError(firstError[0]);
        } else if (typeof firstError === "string") {
          setError(firstError);
        } else {
          setError("Unable to save event changes.");
        }
      } else {
        setError("Unable to save event changes.");
      }
    } finally {
      setSaving(false);
    }
  };


  const handlePublish = async () => {
    const confirmed = window.confirm(
      "Publish this event? Attendees will be able to see it and book tickets."
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setMessage("");
      setError("");

      const updatedEvent = await publishOrganizerEvent(
        event.id
      );

      setEvent((current) => ({
        ...current,
        status: updatedEvent.status,
      }));

      setMessage("Event published successfully.");
    } catch (err) {
      console.error("Failed to publish event:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to publish the event."
      );
    } finally {
      setActionLoading(false);
    }
  };


  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this event?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setMessage("");
      setError("");

      const updatedEvent = await cancelOrganizerEvent(
        event.id
      );

      setEvent((current) => ({
        ...current,
        status: updatedEvent.status,
      }));

      setMessage("Event cancelled successfully.");
    } catch (err) {
      console.error("Failed to cancel event:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to cancel the event."
      );
    } finally {
      setActionLoading(false);
    }
  };


  if (loading) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-[#fffdf7] px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-black/10 bg-white p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-[#CA6180]" />

            <p className="mt-4 text-sm font-medium text-black/45">
              Loading event...
            </p>
          </div>
        </div>
      </main>
    );
  }


  if (!event) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-[#fffdf7] px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-[#CA6180]/20 bg-[#FCB7C7]/30 p-8">
            <p className="font-bold text-[#7d3049]">
              {error || "Event not found."}
            </p>

            <Link
              to="/organizer"
              className="mt-5 inline-flex rounded-full bg-black px-5 py-3 text-sm font-bold text-white"
            >
              ← Back to dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }


  const isCancelled = event.status === "CANCELLED";
  const isCompleted = event.status === "COMPLETED";
  const isDraft = event.status === "DRAFT";


  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#fffdf7] px-6 py-10 md:py-14">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            to="/organizer"
            className="text-sm font-bold text-black/45 transition hover:text-black"
          >
            ← Back to dashboard
          </Link>

          <div className="mt-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#CA6180]">
                Organizer / Manage Event
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-black tracking-tight text-black md:text-5xl">
                  {event.title}
                </h1>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ${
                    event.status === "PUBLISHED"
                      ? "bg-[#9ED3DC] text-black"
                      : event.status === "DRAFT"
                        ? "bg-[#FEFD99] text-black"
                        : event.status === "CANCELLED"
                          ? "bg-[#FCB7C7] text-[#7d3049]"
                          : "bg-black text-white"
                  }`}
                >
                  {event.status}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/organizer")}
              className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:border-black hover:bg-black hover:text-white"
            >
              Dashboard
            </button>
          </div>
        </div>


        {/* Messages */}
        {error && (
          <div className="mb-6 rounded-3xl border border-[#CA6180]/20 bg-[#FCB7C7]/30 p-5">
            <p className="font-bold text-[#7d3049]">
              {error}
            </p>
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-3xl border border-[#9ED3DC] bg-[#9ED3DC]/30 p-5">
            <p className="font-bold text-black">
              {message}
            </p>
          </div>
        )}


        <form onSubmit={handleSave}>

          {/* Event Details */}
          <section className="rounded-3xl border border-black/10 bg-white p-6 md:p-8">
            <div className="mb-7">
              <p className="text-xs font-black tracking-[0.16em] text-black/30">
                01
              </p>

              <h2 className="mt-2 text-2xl font-black text-black">
                Event details
              </h2>
            </div>


            <div className="space-y-6">

              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Event Name
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={isCancelled || isCompleted}
                  className="w-full rounded-2xl border border-black/10 bg-[#fffdf7] px-4 py-3 text-sm font-medium outline-none transition focus:border-black disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>


              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  disabled={isCancelled || isCompleted}
                  className="w-full resize-none rounded-2xl border border-black/10 bg-[#fffdf7] px-4 py-3 text-sm font-medium outline-none transition focus:border-black disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>


              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Venue
                </label>

                <select
                  name="venue"
                  value={formData.venue}
                  onChange={handleVenueChange}
                  disabled={isCancelled || isCompleted}
                  className="w-full rounded-2xl border border-black/10 bg-[#fffdf7] px-4 py-3 text-sm font-medium outline-none transition focus:border-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    Select a venue
                  </option>

                  {venues.map((venue) => (
                    <option
                      key={venue.id}
                      value={venue.id}
                    >
                      {venue.name} — {venue.city}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </section>


          {/* Schedule */}
          <section className="mt-5 rounded-3xl border border-black/10 bg-white p-6 md:p-8">
            <div className="mb-7">
              <p className="text-xs font-black tracking-[0.16em] text-black/30">
                02
              </p>

              <h2 className="mt-2 text-2xl font-black text-black">
                Schedule
              </h2>
            </div>


            <div className="grid gap-6 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Event Starts
                </label>

                <input
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  disabled={isCancelled || isCompleted}
                  className="w-full rounded-2xl border border-black/10 bg-[#fffdf7] px-4 py-3 text-sm font-medium outline-none transition focus:border-black disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>


              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Event Ends
                </label>

                <input
                  type="datetime-local"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  disabled={isCancelled || isCompleted}
                  className="w-full rounded-2xl border border-black/10 bg-[#fffdf7] px-4 py-3 text-sm font-medium outline-none transition focus:border-black disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>


              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Booking Opens
                </label>

                <input
                  type="datetime-local"
                  name="booking_start"
                  value={formData.booking_start}
                  onChange={handleChange}
                  disabled={isCancelled || isCompleted}
                  className="w-full rounded-2xl border border-black/10 bg-[#fffdf7] px-4 py-3 text-sm font-medium outline-none transition focus:border-black disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>


              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Booking Closes
                </label>

                <input
                  type="datetime-local"
                  name="booking_end"
                  value={formData.booking_end}
                  onChange={handleChange}
                  disabled={isCancelled || isCompleted}
                  className="w-full rounded-2xl border border-black/10 bg-[#fffdf7] px-4 py-3 text-sm font-medium outline-none transition focus:border-black disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

            </div>
          </section>


          {/* Ticket Pricing */}
          <section className="mt-5 rounded-3xl border border-black/10 bg-white p-6 md:p-8">
            <div className="mb-7">
              <p className="text-xs font-black tracking-[0.16em] text-black/30">
                03
              </p>

              <h2 className="mt-2 text-2xl font-black text-black">
                Ticket pricing
              </h2>
            </div>


            {sections.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/15 bg-[#fffdf7] p-8 text-center">
                <p className="text-sm font-bold text-black/45">
                  No ticket sections added yet.
                </p>

                {!isCancelled && !isCompleted && (
                  <p className="mt-2 text-xs text-black/35">
                    Select a section below to add ticket pricing.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {sections.map((section) => (
                  <div
                    key={section.section}
                    className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-[#fffdf7] p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-black text-black">
                        {section.name}
                      </p>

                      <p className="mt-1 text-xs font-medium text-black/40">
                        Ticket section
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-black/40">
                          ₹
                        </span>

                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          value={section.price}
                          onChange={(e) =>
                            handlePriceChange(
                              section.section,
                              e.target.value
                            )
                          }
                          disabled={
                            isCancelled || isCompleted
                          }
                          className="w-36 rounded-xl border border-black/10 bg-white py-2.5 pl-8 pr-3 text-sm font-bold outline-none focus:border-black disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>

                      {!isCancelled && !isCompleted && (
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveSection(
                              section.section
                            )
                          }
                          className="rounded-full border border-[#CA6180]/25 px-4 py-2.5 text-xs font-bold text-[#7d3049] transition hover:bg-[#FCB7C7]"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}


            {!isCancelled &&
              !isCompleted &&
              venueSections.length > 0 && (
                <div className="mt-6">
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-black/35">
                    Add ticket section
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {venueSections
                      .filter(
                        (venueSection) =>
                          !sections.some(
                            (section) =>
                              section.section ===
                              venueSection.id
                          )
                      )
                      .map((venueSection) => (
                        <button
                          key={venueSection.id}
                          type="button"
                          onClick={() =>
                            handleAddSection(
                              venueSection
                            )
                          }
                          className="rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs font-bold text-black transition hover:border-black hover:bg-black hover:text-white"
                        >
                          + {venueSection.name}
                        </button>
                      ))}
                  </div>
                </div>
              )}
          </section>


          {/* Save */}
          {!isCancelled && !isCompleted && (
            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-black px-6 py-3 text-sm font-black text-white transition hover:bg-[#CA6180] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes →"}
              </button>
            </div>
          )}

        </form>


        {/* Event Actions */}
        <section className="mt-5 rounded-3xl border border-black/10 bg-white p-6 md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-black/35">
            Event actions
          </p>

          <div className="mt-5 flex flex-wrap gap-3">

            {/* PUBLISH — only shown for drafts */}
            {isDraft && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={actionLoading}
                className="rounded-full bg-[#9ED3DC] px-5 py-3 text-sm font-black text-black transition hover:bg-[#CA6180] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading
                  ? "Publishing..."
                  : "Publish Event →"}
              </button>
            )}


            {/* CANCEL */}
            {!isCancelled && !isCompleted && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={actionLoading}
                className="rounded-full border border-[#CA6180]/30 px-5 py-3 text-sm font-bold text-[#7d3049] transition hover:bg-[#FCB7C7] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading
                  ? "Processing..."
                  : "Cancel Event"}
              </button>
            )}

          </div>
        </section>

      </div>
    </main>
  );
}


export default ManageEvent;