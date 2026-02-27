export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-sky-50 text-neutral-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-semibold text-white">
            D
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">Dad-AI</p>
            <p className="text-sm text-neutral-600">
              Voice-first repair guidance
            </p>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Fix your{" "}
              <span className="text-emerald-500">household appliances</span>{" "}
              with <span className="text-emerald-500">AI</span> guide
            </h1>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="/chat"
                className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                Start Voice Session
              </a>
              <a
                href="#instruction"
                className="rounded-full border border-indigo-200 px-6 py-3 text-sm font-semibold text-indigo-700 transition hover:border-indigo-300 hover:text-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300">
                See how it works
              </a>
            </div>
            <div className="flex items-center gap-4 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                Account required
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-neutral-800">
                Voice Session
              </p>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                Live
              </span>
            </div>
            <div className="mt-5 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                Listening
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                  <div className="h-4 w-4 rounded-full bg-indigo-500"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-800">
                    Mic active
                  </p>
                  <p className="text-xs text-neutral-500">Tap to pause</p>
                </div>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl bg-neutral-100 px-4 py-3 text-sm text-neutral-700">
                I heard: “The dishwasher hums but won’t drain.”
              </div>
              <div className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm text-white">
                Thanks. First, switch off power. Is there standing water at the
                bottom?
              </div>
              <div className="rounded-2xl bg-neutral-100 px-4 py-3 text-sm text-neutral-700">
                Say “yes” or “no” to continue.
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white" id="instruction">
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-semibold tracking-tight">
                How it works
              </h2>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Start a Voice Session",
                  text: "Describe the appliance and what you’re hearing or seeing.",
                },
                {
                  step: "02",
                  title: "Answer Follow-Ups",
                  text: "Dad-AI asks targeted questions to narrow the issue.",
                },
                {
                  step: "03",
                  title: "Fix It Yourself",
                  text: "Get clear, spoken steps using everyday language.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-3xl border border-indigo-100 bg-indigo-50/40 p-6 shadow-sm">
                  <p className="text-sm font-semibold text-indigo-700">
                    {item.step}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-neutral-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">
                Built for voice-first repairs
              </h2>
              <p className="mt-4 text-base text-neutral-600">
                Hands-free guidance keeps you focused on the fix, not the
                screen.
              </p>
            </div>
            <ul className="grid gap-3 text-sm text-neutral-700 md:grid-cols-2">
              <li className="rounded-2xl border border-indigo-100 bg-white px-4 py-3 shadow-sm">
                Spoken, step-by-step repair guidance
              </li>
              <li className="rounded-2xl border border-indigo-100 bg-white px-4 py-3 shadow-sm">
                Designed for common household appliances
              </li>
              <li className="rounded-2xl border border-indigo-100 bg-white px-4 py-3 shadow-sm">
                Plain-language explanations (no jargon)
              </li>
              <li className="rounded-2xl border border-indigo-100 bg-white px-4 py-3 shadow-sm">
                Saves time and money
              </li>
              <li className="rounded-2xl border border-indigo-100 bg-white px-4 py-3 shadow-sm">
                Account required for secure sessions
              </li>
            </ul>
          </div>
        </section>

        <section className="bg-gradient-to-br from-indigo-600 via-slate-900 to-slate-950 text-white">
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
            <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight">
                  Example voice guidance
                </h2>
                <p className="mt-4 text-base text-indigo-100">
                  Clear, spoken steps that keep both hands on the repair.
                </p>
              </div>
              <div className="rounded-3xl bg-white/10 p-6 shadow-sm">
                <div className="space-y-4 text-sm">
                  <div className="rounded-2xl bg-white/15 px-4 py-3 text-white">
                    <p className="text-xs uppercase tracking-wide text-white/60">
                      You say
                    </p>
                    <p className="mt-1">
                      The washer won’t spin after the rinse.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 text-neutral-900">
                    <p className="text-xs uppercase tracking-wide text-neutral-500">
                      Dad-AI says
                    </p>
                    <p className="mt-1">
                      I hear you. Unplug the unit, then check if the lid switch
                      clicks when pressed.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/15 px-4 py-3 text-white">
                    <p className="text-xs uppercase tracking-wide text-white/60">
                      You say
                    </p>
                    <p className="mt-1">It doesn’t click.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="rounded-3xl border border-indigo-100 bg-white p-10 text-center shadow-sm md:p-14">
            <h2 className="text-3xl font-semibold tracking-tight">
              Fix it yourself, with guidance you can trust.
            </h2>
            <p className="mt-4 text-base text-neutral-600">
              Practical help for everyday repairs, ready when you are.
            </p>
            <button className="mt-6 rounded-full bg-indigo-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              Try Dad-AI
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold">Dad-AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
