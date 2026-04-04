import { chromium } from "playwright";

const url = process.argv[2];
if (!url) {
  console.error(JSON.stringify({ error: "missing_url" }));
  process.exit(1);
}

const timeout = Number(process.env.PLAYWRIGHT_TIMEOUT_MS || 28000);

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  const page = await browser.newPage({
    userAgent:
      process.env.CRAWL_USER_AGENT ||
      "AIMarketingDiscoveryBot/1.0 (+https://example.com/bot)",
  });
  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout,
  });
  const html = await page.content();
  const title = await page.title();
  process.stdout.write(
    JSON.stringify({
      html,
      title,
    }),
  );
} finally {
  await browser.close();
}
