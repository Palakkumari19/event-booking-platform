import { Link } from "react-router-dom";

function Landing() {
  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#fffdf7] text-[#171717]">

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-10 lg:pt-16">

        <div className="grid items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">

          {/* Main statement */}
          <div className="flex min-h-[600px] flex-col justify-between rounded-[2rem] bg-[#9ED3DC] p-8 sm:p-12 lg:p-14">

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.2em]">
                  EVENTLY / 01
                </span>

                <span className="rounded-full border border-black/20 px-3 py-1 text-xs font-medium">
                  Bengaluru
                </span>
              </div>

              <h1 className="mt-24 max-w-3xl text-6xl font-black leading-[0.88] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
                EVENTS
                <br />
                WORTH
                <br />
                SHOWING
                <br />
                <span className="text-[#CA6180]">
                  UP FOR.
                </span>
              </h1>
            </div>

            <div className="mt-16 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

              <p className="max-w-sm text-sm font-medium leading-6 text-black/65">
                Discover concerts, festivals, campus events
                and experiences happening around you.
              </p>

              <Link
                to="/events"
                className="group inline-flex w-fit items-center gap-4 rounded-full bg-[#171717] px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-1"
              >
                Explore events

                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>

            </div>
          </div>

          {/* Right side */}
          <div className="grid gap-6">

            {/* Poster */}
            <div className="relative min-h-[370px] overflow-hidden rounded-[2rem] bg-[#CA6180] p-8 sm:p-10">

              <div className="absolute right-[-70px] top-[-70px] h-64 w-64 rounded-full bg-[#FEFD99]" />

              <div className="absolute bottom-[-100px] left-[-50px] h-72 w-72 rounded-full bg-[#9ED3DC]" />

              <div className="relative flex h-full flex-col justify-between">

                <div className="flex justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">
                    LIVE / CULTURE / MUSIC
                  </span>

                  <span className="text-2xl">
                    ✦
                  </span>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-black/55">
                    30 OCT 2026
                  </p>

                  <h2 className="mt-3 max-w-md text-5xl font-black leading-[0.9] tracking-[-0.05em] sm:text-6xl">
                    COLDPLAY
                    <br />
                    WORLD TOUR
                  </h2>

                  <div className="mt-7 flex items-center justify-between border-t border-black/20 pt-5">

                    <span className="text-sm font-medium">
                      M. Chinnaswamy Stadium
                    </span>

                    <span className="text-sm font-bold">
                      →
                    </span>

                  </div>
                </div>

              </div>
            </div>

            {/* Two small blocks */}
            <div className="grid grid-cols-2 gap-6">

              <div className="flex min-h-[230px] flex-col justify-between rounded-[2rem] bg-[#FEFD99] p-7">

                <span className="text-3xl">
                  01
                </span>

                <div>
                  <h3 className="text-xl font-bold">
                    Pick a seat.
                  </h3>

                  <p className="mt-2 text-sm leading-5 text-black/60">
                    Choose exactly where you want to be.
                  </p>
                </div>

              </div>

              <div className="flex min-h-[230px] flex-col justify-between rounded-[2rem] bg-[#FCB7C7] p-7">

                <span className="text-3xl">
                  02
                </span>

                <div>
                  <h3 className="text-xl font-bold">
                    Get your ticket.
                  </h3>

                  <p className="mt-2 text-sm leading-5 text-black/60">
                    One booking. One QR ticket. Done.
                  </p>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Category strip */}
      <section className="border-y border-black/10 bg-[#171717]">

        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-6 py-5 text-xs font-bold uppercase tracking-[0.18em] text-[#fffdf7]">

          <span className="text-[#9ED3DC]">
            Concerts
          </span>

          <span>•</span>

          <span className="text-[#FEFD99]">
            Festivals
          </span>

          <span>•</span>

          <span className="text-[#FCB7C7]">
            Campus
          </span>

          <span>•</span>

          <span className="text-[#CA6180]">
            Experiences
          </span>

          <span className="ml-auto hidden sm:block text-white/40">
            FIND SOMETHING TO DO →
          </span>

        </div>
      </section>

      {/* Bottom statement */}
      <section className="mx-auto max-w-7xl px-6 py-20">

        <div className="grid gap-10 md:grid-cols-[1fr_2fr]">

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#CA6180]">
            EVENTLY / 02
          </p>

          <div>
            <h2 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Less scrolling.
              <br />
              More{" "}
              <span className="underline decoration-[#9ED3DC] decoration-8 underline-offset-4">
                going out.
              </span>
            </h2>

            <p className="mt-7 max-w-2xl text-base leading-7 text-black/55">
              Find what's happening, choose your seat,
              book your spot and show up. EVENTLY keeps
              the entire experience in one place.
            </p>

            <Link
              to="/events"
              className="mt-8 inline-flex items-center gap-3 rounded-full border-2 border-[#171717] px-6 py-3 text-sm font-semibold transition hover:bg-[#171717] hover:text-white"
            >
              See what's happening
              <span>→</span>
            </Link>
          </div>

        </div>

      </section>

    </main>
  );
}

export default Landing;