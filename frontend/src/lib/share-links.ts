/**
 * Social share URL builders.
 *
 * Facebook/LinkedIn: link preview comes from their crawl of `url`; we append all image URLs in text/clipboard.
 * Native "Device" share may attach image files when CORS allows fetch (often only same-origin).
 */

const MAX_URL_SAFE_CHARS = 5500;

/** Caption + page URL only (no image URLs). Used for WhatsApp / Instagram / native share with photo files. */
export function buildPlainShareText(body: string, pageUrl: string): string {
  return `${body.trim()}\n\n${pageUrl}`;
}

/** Caption + page URL + numbered list of every fetched image URL. */
export function buildFullShareText(body: string, pageUrl: string, imageUrls?: string[]): string {
  let t = `${body.trim()}\n\n${pageUrl}`;
  if (imageUrls && imageUrls.length > 0) {
    t += "\n\nImages from page:\n";
    imageUrls.forEach((url, i) => {
      t += `${i + 1}. ${url}\n`;
    });
  }
  return t;
}

/** Keep intent URLs under browser limits. */
export function clipForIntent(body: string, pageUrl: string, imageUrls?: string[]): string {
  let full = buildFullShareText(body, pageUrl, imageUrls);
  let enc = encodeURIComponent(full);
  if (enc.length <= MAX_URL_SAFE_CHARS) {
    return full;
  }
  // Drop images from tail first, then truncate body
  if (imageUrls && imageUrls.length > 0) {
    for (let n = imageUrls.length - 1; n >= 0; n--) {
      full = buildFullShareText(body, pageUrl, imageUrls.slice(0, n));
      enc = encodeURIComponent(full);
      if (enc.length <= MAX_URL_SAFE_CHARS) {
        return full + (n < imageUrls.length ? `\n…+${imageUrls.length - n} more image URLs (use Copy caption for full list)` : "");
      }
    }
  }
  const sep = "\n\n";
  const suffix = `${sep}${pageUrl}`;
  const budget = MAX_URL_SAFE_CHARS - encodeURIComponent(suffix).length - 80;
  let truncated = body;
  while (encodeURIComponent(truncated + suffix).length > budget && truncated.length > 80) {
    truncated = truncated.slice(0, -40);
  }
  return `${truncated}…${suffix}\n\n(Full text + all images: use Copy caption)`;
}

export function buildShareUrl(
  platform: "x" | "facebook" | "linkedin" | "pinterest" | "whatsapp" | "telegram" | "reddit" | "email" | "threads",
  body: string,
  pageUrl: string,
  imageUrls?: string[],
): string {
  const u = encodeURIComponent(pageUrl);
  const combined = clipForIntent(body, pageUrl, imageUrls);
  const text = encodeURIComponent(combined);
  const title = encodeURIComponent(body.slice(0, 300));
  const firstImage = imageUrls?.[0];

  switch (platform) {
    case "x":
      return `https://twitter.com/intent/tweet?text=${text}`;
    case "facebook":
      return buildFacebookSharerUrl(pageUrl);
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}&summary=${encodeURIComponent(
        buildFullShareText(body, pageUrl, imageUrls).slice(0, 1500),
      )}`;
    case "pinterest": {
      const desc = encodeURIComponent(buildFullShareText(body, pageUrl, imageUrls));
      const base = `https://pinterest.com/pin/create/button/?url=${u}&description=${desc}`;
      if (firstImage) {
        return `${base}&media=${encodeURIComponent(firstImage)}`;
      }
      return base;
    }
    case "whatsapp": {
      // Never put image URLs in the message — prefer native share with files, or plain text + user adds media in app.
      const plain = clipForIntent(body, pageUrl, undefined);
      return `https://wa.me/?text=${encodeURIComponent(plain)}`;
    }
    case "telegram":
      return `https://t.me/share/url?url=${u}&text=${encodeURIComponent(buildFullShareText(body, pageUrl, imageUrls))}`;
    case "reddit":
      return `https://www.reddit.com/submit?text=${text}&title=${title}`;
    case "email":
      return `mailto:?subject=${encodeURIComponent("Social post")}&body=${text}`;
    case "threads":
      return `https://www.threads.net/intent/post?text=${text}`;
    default:
      return pageUrl;
  }
}

export async function shareNative(
  body: string,
  pageUrl: string,
  imageUrls?: string[],
  title?: string,
): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.share) {
    return false;
  }
  const text = buildFullShareText(body, pageUrl, imageUrls);
  try {
    await navigator.share({
      title: title ?? "Post",
      text,
      url: pageUrl,
    });
    return true;
  } catch {
    return false;
  }
}

/** Try sharing with image files (works when CDN sends CORS headers; else same as text-only). */
export async function shareNativeWithImageFiles(
  body: string,
  pageUrl: string,
  imageUrls: string[],
  title?: string,
): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.share) {
    return false;
  }
  const files = await fetchImagesAsFiles(imageUrls.slice(0, 10));
  const textPlain = buildPlainShareText(body, pageUrl);
  const base: ShareData = { title: title ?? "Post", url: pageUrl };

  if (files.length > 0 && navigator.canShare?.({ files })) {
    try {
      await navigator.share({ ...base, text: textPlain, files });
      return true;
    } catch {
      /* fall through */
    }
  }
  return shareNative(body, pageUrl, imageUrls, title);
}

/**
 * Share caption (plain, no image links) + fetched images as files when CORS allows.
 * Use for WhatsApp / Instagram flows so media is files, not URLs in text.
 */
export async function shareImagesWithPlainCaption(
  body: string,
  pageUrl: string,
  imageUrls: string[],
  title?: string,
): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.share) {
    return false;
  }
  const text = buildPlainShareText(body, pageUrl);
  const files = await fetchImagesAsFiles(imageUrls.slice(0, 10));
  const base: ShareData = { title: title ?? "Post", text, url: pageUrl };

  if (files.length > 0 && navigator.canShare?.({ files })) {
    try {
      await navigator.share({ ...base, files });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

async function fetchImagesAsFiles(urls: string[]): Promise<File[]> {
  const out: File[] = [];
  for (const url of urls) {
    try {
      const r = await fetch(url, { mode: "cors" });
      if (!r.ok) continue;
      const blob = await r.blob();
      if (!blob.type.startsWith("image/")) continue;
      const raw = url.split("/").pop()?.split("?")[0] || "image.jpg";
      const name = raw.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "image.jpg";
      out.push(new File([blob], name, { type: blob.type || "image/jpeg" }));
    } catch {
      /* CORS or network */
    }
  }
  return out;
}

/** Clipboard: always includes every image URL (no length cap). */
export function buildCaptionForClipboard(body: string, pageUrl: string, imageUrls?: string[]): string {
  return buildFullShareText(body, pageUrl, imageUrls);
}

const FB_BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "[::1]"]);

/** Public http(s) URL Facebook can crawl — rejects localhost and invalid input. */
export function normalizePageUrlForShare(pageUrl: string): string | null {
  try {
    const raw = pageUrl.trim();
    if (!raw) return null;
    const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (FB_BLOCKED_HOSTS.has(url.hostname.toLowerCase())) return null;
    return url.href;
  } catch {
    return null;
  }
}

/** Legacy sharer endpoint (not /sharer/sharer.php — that route often breaks Comet composer). */
export function buildFacebookSharerUrl(pageUrl: string): string {
  const u = encodeURIComponent(pageUrl);
  if (isMobileUserAgent()) {
    return `https://m.facebook.com/sharer.php?u=${u}`;
  }
  return `https://www.facebook.com/sharer.php?u=${u}`;
}

/** Optional Meta Share Dialog when NEXT_PUBLIC_FACEBOOK_APP_ID is set. */
export function buildFacebookDialogShareUrl(pageUrl: string): string | null {
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID?.trim();
  if (!appId) return null;
  const href = encodeURIComponent(pageUrl);
  return `https://www.facebook.com/dialog/share?app_id=${encodeURIComponent(appId)}&display=popup&href=${href}`;
}

function isMobileUserAgent(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export type FacebookShareResult = "shared" | "cancelled" | "unavailable";

/**
 * System share sheet (text + link [+ images]). Prefer openFacebookSharer when you need
 * Facebook to crawl the page for a link preview.
 */
export async function shareToFacebook(
  body: string,
  pageUrl: string,
  imageUrls?: string[],
  title?: string,
): Promise<FacebookShareResult> {
  if (typeof navigator === "undefined" || !navigator.share) {
    return "unavailable";
  }
  const text = buildPlainShareText(body, pageUrl);
  const shareData: ShareData = { title: title ?? "Post", text, url: pageUrl };

  const files = imageUrls?.length ? await fetchImagesAsFiles(imageUrls.slice(0, 4)) : [];
  if (files.length > 0 && navigator.canShare?.({ ...shareData, files })) {
    try {
      await navigator.share({ ...shareData, files });
      return "shared";
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return "cancelled";
    }
  }

  try {
    await navigator.share(shareData);
    return "shared";
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") return "cancelled";
    return "unavailable";
  }
}

/** Open Facebook link share in a new window (same-tab navigation breaks their Comet composer). */
export function openFacebookSharer(pageUrl: string): boolean {
  const href = normalizePageUrlForShare(pageUrl);
  if (!href) return false;
  const dialog = buildFacebookDialogShareUrl(href);
  const url = dialog ?? buildFacebookSharerUrl(href);
  const popup = window.open(url, "_blank", "noopener,noreferrer,width=600,height=700");
  return popup !== null;
}

export type FacebookShareOutcome =
  | { ok: true; method: "native" | "sharer" }
  | { ok: false; reason: "invalid-url" | "cancelled" | "manual" };

/**
 * Facebook share flow: system share sheet first (avoids web composer Relay bug),
 * desktop-only fallback to link sharer popup.
 */
export async function runFacebookShare(
  body: string,
  pageUrl: string,
  imageUrls?: string[],
  title?: string,
): Promise<FacebookShareOutcome> {
  const href = normalizePageUrlForShare(pageUrl);
  if (!href) return { ok: false, reason: "invalid-url" };

  if (typeof navigator !== "undefined" && navigator.share) {
    const native = await shareToFacebook(body, href, imageUrls, title);
    if (native === "shared") return { ok: true, method: "native" };
    if (native === "cancelled") return { ok: false, reason: "cancelled" };
  }

  // Mobile web sharer often hits ShareToFeedComposerCometDialogQuery infinite suspend — skip it.
  if (isMobileUserAgent()) {
    return { ok: false, reason: "manual" };
  }

  if (openFacebookSharer(href)) {
    return { ok: true, method: "sharer" };
  }
  return { ok: false, reason: "manual" };
}
