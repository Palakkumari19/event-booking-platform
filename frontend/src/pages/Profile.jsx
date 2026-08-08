import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#09090b] px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">

        <div className="mb-10">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
            Account
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            Your Profile
          </h1>

          <p className="mt-3 text-zinc-400">
            Manage your Evently account information.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60">

          {/* Profile header */}
          <div className="border-b border-white/10 p-8">
            <div className="flex items-center gap-5">

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20 text-2xl font-semibold text-indigo-300">
                {user.first_name?.charAt(0)?.toUpperCase()}
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  {user.first_name} {user.last_name}
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  {user.role}
                </p>
              </div>

            </div>
          </div>

          {/* Account information */}
          <div className="p-8">

            <h3 className="mb-6 text-lg font-semibold">
              Account Information
            </h3>

            <div className="grid gap-6 sm:grid-cols-2">

              <div>
                <p className="text-sm text-zinc-500">
                  First name
                </p>

                <p className="mt-2 text-base text-white">
                  {user.first_name}
                </p>
              </div>

              <div>
                <p className="text-sm text-zinc-500">
                  Last name
                </p>

                <p className="mt-2 text-base text-white">
                  {user.last_name}
                </p>
              </div>

              <div>
                <p className="text-sm text-zinc-500">
                  Email
                </p>

                <p className="mt-2 text-base text-white">
                  {user.email}
                </p>
              </div>

              <div>
                <p className="text-sm text-zinc-500">
                  Account type
                </p>

                <p className="mt-2 text-base text-white">
                  {user.role}
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}