import Link from "next/link";

export default function HomePage() {
  const features = [
    {
      title: "Smart website crawl",
      body: "Analyzes homepage and key sections (products, about, contact) to capture what matters for marketing.",
    },
    {
      title: "AI strategy output",
      body: "Generates positioning, campaign angles, social ideas, ad copy, and homepage recommendations in minutes.",
    },
    {
      title: "Team-ready workflow",
      body: "Save project insights, share drafts, and move faster from research to publish-ready content.",
    },
  ];

  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "For freelancers and new stores testing AI-driven marketing.",
      bullets: ["10 website analyses / month", "Core content pack", "Email support"],
      cta: "Start Starter",
      highlighted: false,
    },
    {
      name: "Growth",
      price: "$79",
      period: "/month",
      description: "For growing businesses that publish content every week.",
      bullets: ["40 website analyses / month", "Advanced social templates", "Priority support"],
      cta: "Choose Growth",
      highlighted: true,
    },
    {
      name: "Scale",
      price: "$199",
      period: "/month",
      description: "For agencies and teams managing multiple brands.",
      bullets: ["150 website analyses / month", "Multi-workspace access", "Dedicated onboarding"],
      cta: "Talk to sales",
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-violet-50/40 text-zinc-900 dark:from-zinc-950 dark:via-zinc-950 dark:to-violet-950/30 dark:text-zinc-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-sm font-semibold tracking-tight">AI Marketing Discovery</span>
        <div className="flex gap-3 text-sm">
          <Link href="/login" className="rounded-lg px-3 py-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white shadow-md shadow-violet-600/25 hover:bg-violet-500"
          >
            Get started
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:pt-20">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-widest text-violet-600 dark:text-violet-400">Commercial Platform</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl md:leading-tight">
            Build better marketing campaigns from any website URL.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            This is your public home page before sign-in. Show visitors how your AI platform works, what value they get,
            and let them choose a plan before creating an account.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="inline-flex rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500"
            >
              Start free
            </Link>
            <Link
              href="/register"
              className="inline-flex rounded-xl border border-violet-200 bg-violet-50 px-6 py-3 text-sm font-semibold text-violet-700 hover:bg-violet-100 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200 dark:hover:bg-violet-500/15"
            >
              View plans
            </Link>
            <Link
              href="/login"
              className="inline-flex rounded-xl border border-zinc-200 bg-white/80 px-6 py-3 text-sm font-semibold text-zinc-800 backdrop-blur hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Sign in
            </Link>
          </div>
        </div>
        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {features.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-zinc-200/80 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{card.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{card.body}</p>
            </div>
          ))}
        </div>
        <section className="mt-20">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-widest text-violet-600 dark:text-violet-400">Pricing plans</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Choose the plan that fits your business</h2>
            <p className="mt-3 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
              Visitors can review your offers before they sign in, then create an account and continue with the selected plan.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-2xl border p-6 shadow-sm ${
                  plan.highlighted
                    ? "border-violet-400 bg-violet-50/70 shadow-violet-400/15 dark:border-violet-400/60 dark:bg-violet-500/10"
                    : "border-zinc-200/80 bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/60"
                }`}
              >
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-3 flex items-end gap-1">
                  <span className="text-3xl font-semibold">{plan.price}</span>
                  <span className="pb-1 text-sm text-zinc-500 dark:text-zinc-400">{plan.period}</span>
                </p>
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{plan.description}</p>
                <ul className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                  {plan.bullets.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold ${
                    plan.highlighted
                      ? "bg-violet-600 text-white hover:bg-violet-500"
                      : "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
