import Link from "next/link";
import { APP_NAME } from "@/lib/brand";
import { NavIcon } from "@/components/ui/design-system";

const stats = [
  { value: "2 min", label: "Average analysis time" },
  { value: "12+", label: "Content types per project" },
  { value: "1 URL", label: "To start full strategy" },
  { value: "24/7", label: "AI-powered insights" },
];

const howItWorks = [
  {
    step: "01",
    title: "Paste your website URL",
    body: "Enter your store or brand site. We crawl homepage, product pages, about, and contact sections to understand your offer, tone, and audience signals.",
  },
  {
    step: "02",
    title: "AI reads your brand context",
    body: "Our engine extracts positioning, product themes, visual cues, and messaging patterns—so recommendations match what you actually sell, not generic templates.",
  },
  {
    step: "03",
    title: "Get a full marketing pack",
    body: "Receive positioning statements, campaign angles, social posts, ad copy, homepage suggestions, and share-ready drafts you can copy or refine in minutes.",
  },
  {
    step: "04",
    title: "Iterate and publish",
    body: "Regenerate sections, use social templates for Facebook-ready packs, track store analytics, and keep every project organized in one workspace.",
  },
];

const features = [
  {
    icon: "analyze" as const,
    title: "Smart website crawl",
    body: "Deep-scans key pages and images to capture products, value props, and brand voice—foundation for accurate AI output.",
    details: ["Homepage & collection pages", "About & contact context", "Product imagery signals"],
  },
  {
    icon: "projects" as const,
    title: "Project workspace",
    body: "Every URL becomes a saved project with status tracking, history, and one-click regeneration when your site or offer changes.",
    details: ["Pending → analyzing pipeline", "Cached results for fast reload", "Per-project settings"],
  },
  {
    icon: "templates" as const,
    title: "Social templates",
    body: "Generate platform-ready social packs from any product URL—headlines, hooks, captions, and share flows built for speed.",
    details: ["Facebook share integration", "Copy-to-clipboard drafts", "Item-level customization"],
  },
  {
    icon: "analytics" as const,
    title: "Store analytics",
    body: "Upload sales data for revenue concentration, repeat customers, category performance, and AI-written campaign recommendations.",
    details: ["Top product insights", "7-day action plans", "Ad copy from your data"],
  },
  {
    icon: "growth" as const,
    title: "Campaign strategy",
    body: "Positioning, angles, and channel-specific ideas aligned to your crawl—so campaigns start from evidence, not guesswork.",
    details: ["Brand positioning", "Campaign angles", "Channel recommendations"],
  },
  {
    icon: "customers" as const,
    title: "Team-ready workflow",
    body: "Built for founders, marketers, and agencies who need repeatable research-to-content pipelines without hiring more headcount.",
    details: ["Multi-plan scaling", "Admin user management", "Shareable outputs"],
  },
];

const deliverables = [
  { type: "Brand positioning", description: "Clear statement of who you serve, what you solve, and why you win." },
  { type: "Campaign angles", description: "Multiple creative directions to test across paid and organic channels." },
  { type: "Social posts", description: "Ready-to-edit posts tuned to your products and tone." },
  { type: "Ad copy", description: "Five paid social / search style variations per project." },
  { type: "Homepage suggestions", description: "Section-level ideas to improve conversion on your live site." },
  { type: "Social template packs", description: "Structured creatives for fast publishing workflows." },
];

const useCases = [
  {
    title: "E-commerce stores",
    body: "Launch campaigns faster when you have dozens of SKUs and limited time to write unique copy for each hero product.",
  },
  {
    title: "Marketing agencies",
    body: "Onboard new clients by analyzing their site in minutes and presenting a strategy deck before the kickoff call ends.",
  },
  {
    title: "Solo founders",
    body: "Replace hours of blank-page brainstorming with structured positioning, posts, and ads you can ship the same day.",
  },
  {
    title: "Growth teams",
    body: "Combine crawl insights with store analytics to prioritize SKUs, segments, and weekly experiment backlogs.",
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

const faqs = [
  {
    q: "Do I need technical setup?",
    a: "No. Paste a public URL, create an account, and your first project starts processing immediately.",
  },
  {
    q: "What pages does the crawler analyze?",
    a: "Typically homepage, product or collection pages, about, and contact—enough context for positioning and channel copy.",
  },
  {
    q: "Can I regenerate if my site changes?",
    a: "Yes. Each project supports regeneration for crawl, analysis, or content so outputs stay aligned with your latest site.",
  },
  {
    q: "Is store analytics included?",
    a: "Growth and Scale plans support uploading sales data for revenue insights and AI-generated campaign actions.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-violet-50/40 text-zinc-900 dark:from-zinc-950 dark:via-zinc-950 dark:to-violet-950/30 dark:text-zinc-50">
      <header className="sticky top-0 z-40 border-b border-zinc-200/60 bg-white/80 backdrop-blur-lg dark:border-zinc-800/80 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
          <nav className="hidden items-center gap-6 text-sm text-zinc-600 md:flex dark:text-zinc-400">
            <a href="#how-it-works" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              How it works
            </a>
            <a href="#features" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              Features
            </a>
            <a href="#pricing" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              Pricing
            </a>
            <a href="#faq" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              FAQ
            </a>
          </nav>
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
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-14 md:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium uppercase tracking-widest text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">
                {APP_NAME} platform
              </p>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl md:leading-tight">
                Turn any website into a complete marketing strategy—in minutes, not weeks.
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
                {APP_NAME} crawls your site, understands your brand and products, then delivers positioning,
                campaigns, social content, ad copy, and homepage improvements you can use immediately. Built for stores,
                agencies, and growth teams who need depth without hiring a full content team.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500"
                >
                  Start free analysis
                </Link>
                <Link
                  href="#pricing"
                  className="inline-flex rounded-xl border border-violet-200 bg-violet-50 px-6 py-3 text-sm font-semibold text-violet-700 hover:bg-violet-100 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200 dark:hover:bg-violet-500/15"
                >
                  Compare plans
                </Link>
                <Link
                  href="/login"
                  className="inline-flex rounded-xl border border-zinc-200 bg-white/80 px-6 py-3 text-sm font-semibold text-zinc-800 backdrop-blur hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-100 dark:hover:bg-zinc-900"
                >
                  Sign in
                </Link>
              </div>
              <ul className="mt-8 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex items-center gap-2">
                  <span className="text-violet-600 dark:text-violet-400">✓</span> No credit card required to explore
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-violet-600 dark:text-violet-400">✓</span> Full content pack per website project
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-violet-600 dark:text-violet-400">✓</span> Regenerate anytime your site updates
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-zinc-200/80 bg-white/80 p-6 shadow-xl shadow-violet-500/5 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Sample output preview</p>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Positioning", sample: "Premium home essentials for design-conscious buyers who want quality without luxury markups." },
                  { label: "Campaign angle", sample: "Before/after room refresh — show transformation using your bestseller collection." },
                  { label: "Social post", sample: "Your space deserves better than generic decor. Start with the piece guests notice first." },
                  { label: "Ad headline", sample: "Upgrade your living room in one weekend — free shipping over $75." },
                ].map((row) => (
                  <div key={row.label} className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">{row.label}</p>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{row.sample}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">Illustrative examples — yours are generated from your live site</p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-zinc-200/80 bg-white/50 dark:border-zinc-800 dark:bg-zinc-900/30">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center md:text-left">
                <p className="text-3xl font-semibold text-violet-600 dark:text-violet-400">{s.value}</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-widest text-violet-600 dark:text-violet-400">How it works</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">From URL to publish-ready marketing in four steps</h2>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400">
              The platform is designed for speed: one input, a structured analysis pipeline, and organized outputs you can
              copy, share, or hand to clients.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {howItWorks.map((item) => (
              <article
                key={item.step}
                className="relative rounded-2xl border border-zinc-200/80 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/50"
              >
                <span className="text-4xl font-bold text-violet-200 dark:text-violet-900">{item.step}</span>
                <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-violet-50/50 py-20 dark:bg-violet-950/20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-widest text-violet-600 dark:text-violet-400">Platform features</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Everything you need after the crawl finishes</h2>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Not just a single blog post— a full commercial toolkit spanning strategy, creative, analytics, and team workflow.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((card) => (
                <article
                  key={card.title}
                  className="rounded-2xl border border-zinc-200/80 bg-white/90 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70"
                >
                  <span className="inline-flex rounded-xl border border-violet-200 bg-violet-50 p-2.5 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">
                    <NavIcon name={card.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{card.body}</p>
                  <ul className="mt-4 space-y-1.5 border-t border-zinc-100 pt-4 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                    {card.details.map((d) => (
                      <li key={d} className="flex items-center gap-2">
                        <span className="text-violet-500">•</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Deliverables */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-violet-600 dark:text-violet-400">What you receive</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Structured deliverables per project</h2>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Each analysis groups content by type so you can jump straight to positioning, paid ads, organic social, or
                on-site conversion work—without digging through one long document.
              </p>
              <Link
                href="/register"
                className="mt-8 inline-flex rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-500"
              >
                Create your first project
              </Link>
            </div>
            <ul className="space-y-3">
              {deliverables.map((d) => (
                <li
                  key={d.type}
                  className="flex gap-4 rounded-xl border border-zinc-200/80 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                    ✓
                  </span>
                  <div>
                    <p className="font-medium">{d.type}</p>
                    <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">{d.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Use cases */}
        <section className="border-t border-zinc-200/80 bg-white/40 py-20 dark:border-zinc-800 dark:bg-zinc-900/20">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-sm font-medium uppercase tracking-widest text-violet-600 dark:text-violet-400">Who it&apos;s for</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Built for teams that ship marketing weekly</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {useCases.map((uc) => (
                <article key={uc.title} className="rounded-2xl border border-zinc-200/80 p-6 dark:border-zinc-800">
                  <h3 className="font-semibold">{uc.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{uc.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-widest text-violet-600 dark:text-violet-400">Pricing plans</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Choose the plan that fits your volume</h2>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              Review limits and support levels before sign-up. Upgrade as your analyses and client workload grow.
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
                {plan.highlighted ? (
                  <span className="mb-3 inline-block rounded-full bg-violet-600 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    Most popular
                  </span>
                ) : null}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-3 flex items-end gap-1">
                  <span className="text-3xl font-semibold">{plan.price}</span>
                  <span className="pb-1 text-sm text-zinc-500 dark:text-zinc-400">{plan.period}</span>
                </p>
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{plan.description}</p>
                <ul className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                  {plan.bullets.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-violet-600 dark:text-violet-400">✓</span>
                      {item}
                    </li>
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

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl px-6 pb-20">
          <p className="text-center text-sm font-medium uppercase tracking-widest text-violet-600 dark:text-violet-400">FAQ</p>
          <h2 className="mt-2 text-center text-3xl font-semibold tracking-tight">Common questions</h2>
          <dl className="mt-10 space-y-6">
            {faqs.map((item) => (
              <div key={item.q} className="rounded-2xl border border-zinc-200/80 bg-white/70 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
                <dt className="font-semibold">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 px-8 py-12 text-center text-white shadow-xl shadow-violet-600/25 md:px-16">
            <h2 className="text-2xl font-semibold md:text-3xl">Ready to analyze your first website?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-violet-100 md:text-base">
              Join teams using {APP_NAME} to go from URL to campaigns, copy, and growth ideas in one workflow.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex rounded-xl bg-white px-6 py-3 text-sm font-semibold text-violet-700 hover:bg-violet-50"
              >
                Get started free
              </Link>
              <Link
                href="/login"
                className="inline-flex rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                I already have an account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200/80 py-10 dark:border-zinc-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-zinc-500 md:flex-row dark:text-zinc-400">
          <span>© {new Date().getFullYear()} {APP_NAME}</span>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-zinc-800 dark:hover:text-zinc-200">
              Log in
            </Link>
            <Link href="/register" className="hover:text-zinc-800 dark:hover:text-zinc-200">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
