import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const initial =
    user.first_name?.charAt(0)?.toUpperCase() || "?";

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#fffdf7] px-6 py-12 text-[#171717]">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-10">

          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#CA6180]" />

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/45">
              EVENTLY / ACCOUNT
            </p>
          </div>

          <h1 className="mt-4 text-5xl font-black tracking-[-0.05em] md:text-6xl">
            Your profile.
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-black/50">
            Your Evently account information.
          </p>

        </div>

        {/* Profile card */}
        <section className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_20px_60px_rgba(23,23,23,0.05)]">

          {/* Profile header */}
          <div className="relative overflow-hidden bg-[#9ED3DC] p-8 sm:p-10">

            <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#FEFD99]" />

            <div className="absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-[#FCB7C7]" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">

              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#171717] text-3xl font-black text-[#fffdf7]">
                {initial}
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/45">
                  Evently member
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-tight">
                  {user.first_name}{" "}
                  {user.last_name}
                </h2>

                <p className="mt-1 text-sm font-medium text-black/50">
                  {user.role}
                </p>
              </div>

            </div>

          </div>

          {/* Information */}
          <div className="p-8 sm:p-10">

            <div className="flex items-end justify-between border-b border-black/10 pb-5">

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#CA6180]">
                  Account details
                </p>

                <h3 className="mt-2 text-2xl font-black">
                  Your information
                </h3>
              </div>

            </div>

            <div className="mt-7 grid gap-x-10 gap-y-8 sm:grid-cols-2">

              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-black/35">
                  First name
                </p>

                <p className="mt-2 font-semibold">
                  {user.first_name}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-black/35">
                  Last name
                </p>

                <p className="mt-2 font-semibold">
                  {user.last_name}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-black/35">
                  Email
                </p>

                <p className="mt-2 break-all font-semibold">
                  {user.email}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-black/35">
                  Account type
                </p>

                <p className="mt-2 font-semibold">
                  {user.role}
                </p>
              </div>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}