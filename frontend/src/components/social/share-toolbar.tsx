"use client";

import { useCallback, useState } from "react";
import {
  buildCaptionForClipboard,
  buildPlainShareText,
  buildShareUrl,
  runFacebookPageShare,
  runFacebookPersonalShare,
  shareImagesWithPlainCaption,
  shareNative,
  shareNativeWithImageFiles,
} from "@/lib/share-links";

type Props = {
  body: string;
  pageUrl: string;
  /** All fetched image URLs from the crawl/template (Pinterest uses the first; caption includes every URL). */
  imageUrls?: string[];
  /** @deprecated Prefer `imageUrls` — single image is treated as `[imageUrl]`. */
  imageUrl?: string;
  platformHint?: string;
  /** When true (Facebook template card), primary button targets Page posting, not personal profile. */
  preferFacebookPage?: boolean;
};

const btn =
  "rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700";

export function ShareToolbar({
  body,
  pageUrl,
  imageUrl,
  imageUrls,
  platformHint,
  preferFacebookPage = false,
}: Props) {
  const isFacebookCard =
    preferFacebookPage || platformHint?.toLowerCase() === "facebook";
  const [toast, setToast] = useState<string | null>(null);

  const resolvedImageUrls =
    imageUrls && imageUrls.length > 0 ? imageUrls : imageUrl ? [imageUrl] : undefined;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4500);
  }, []);

  const open = useCallback((url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  const copyCaption = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buildCaptionForClipboard(body, pageUrl, resolvedImageUrls));
      showToast("Caption + link + all image URLs copied. Paste into the app or browser composer.");
    } catch {
      showToast("Could not copy — select the text above and copy manually.");
    }
  }, [body, pageUrl, resolvedImageUrls, showToast]);

  const shareFacebookProfile = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buildCaptionForClipboard(body, pageUrl, resolvedImageUrls));
    } catch {
      /* still try share */
    }

    const outcome = await runFacebookPersonalShare(body, pageUrl, resolvedImageUrls, platformHint);

    if (outcome.ok && outcome.method === "native") {
      showToast("Pick Facebook in the share sheet. Posts to your personal profile — not a Facebook Page.");
      return;
    }
    if (outcome.ok && outcome.method === "sharer") {
      showToast("Link share opened (personal profile only). Caption copied — paste if needed.");
      return;
    }
    if (!outcome.ok) {
      if (outcome.reason === "invalid-url") {
        showToast("Need a public https:// URL. Caption copied — paste in Facebook manually.");
        return;
      }
      if (outcome.reason === "cancelled") {
        showToast("Share cancelled. Caption is still copied.");
        return;
      }
    }
    showToast("Caption copied. Paste in Facebook while on your personal profile (not a Page).");
  }, [body, pageUrl, resolvedImageUrls, platformHint, showToast]);

  const shareFacebookPage = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buildCaptionForClipboard(body, pageUrl, resolvedImageUrls));
    } catch {
      showToast("Could not copy — select the text above and copy manually.");
      return;
    }

    const outcome = await runFacebookPageShare(body, pageUrl, resolvedImageUrls, platformHint);

    if (outcome.ok && outcome.method === "sharer") {
      showToast(
        "Meta share dialog opened — choose your Facebook Page at the top, then paste your caption (Ctrl+V) and Post.",
      );
      return;
    }
    if (outcome.ok && outcome.method === "native") {
      showToast(
        "In the Facebook app: switch to your Page (menu → your Page name) → paste the copied caption → Post.",
      );
      return;
    }
    if (!outcome.ok) {
      if (outcome.reason === "invalid-url") {
        showToast("Need a public https:// URL. Caption copied.");
        return;
      }
      if (outcome.reason === "cancelled") {
        showToast("Share cancelled. Caption is still copied.");
        return;
      }
    }
    showToast(
      "Caption copied. In Meta Business Suite: pick your Page → paste in the composer → Post. (Or switch to your Page in the Facebook app and paste.)",
    );
  }, [body, pageUrl, resolvedImageUrls, platformHint, showToast]);

  const copyThenOpenLinkedIn = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buildCaptionForClipboard(body, pageUrl, resolvedImageUrls));
    } catch {
      /* still open */
    }
    open(buildShareUrl("linkedin", body, pageUrl, resolvedImageUrls));
    showToast("Caption copied. In LinkedIn, paste (Ctrl+V) into the post editor.");
  }, [body, pageUrl, resolvedImageUrls, open, showToast]);

  const shareWhatsApp = useCallback(async () => {
    if (resolvedImageUrls?.length) {
      const ok = await shareImagesWithPlainCaption(body, pageUrl, resolvedImageUrls, platformHint);
      if (ok) {
        showToast("Pick WhatsApp in the share sheet to send text + images (no raw links in the message).");
        return;
      }
    }
    open(buildShareUrl("whatsapp", body, pageUrl, resolvedImageUrls));
    showToast(
      resolvedImageUrls?.length
        ? "Opened WhatsApp with caption + link. Add photos from gallery if images didn’t attach (CDN may block fetch)."
        : "Opened WhatsApp with your caption and link.",
    );
  }, [body, pageUrl, resolvedImageUrls, platformHint, open, showToast]);

  const copyForInstagram = useCallback(async () => {
    const plain = buildPlainShareText(body, pageUrl);
    try {
      await navigator.clipboard.writeText(plain);
    } catch {
      showToast("Could not copy — select the text above and copy manually.");
      return;
    }
    if (resolvedImageUrls?.length) {
      const ok = await shareImagesWithPlainCaption(body, pageUrl, resolvedImageUrls, platformHint);
      if (ok) {
        showToast(
          "Plain caption copied (no image links). If a share sheet opened, pick Instagram; otherwise paste the caption and add photos.",
        );
        return;
      }
    }
    showToast("Caption copied (no image links) — open Instagram and add your photos from the gallery.");
  }, [body, pageUrl, resolvedImageUrls, platformHint, showToast]);

  return (
    <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
      {toast && (
        <p className="mb-2 rounded-lg border border-violet-200 bg-violet-50 px-2 py-1.5 text-[11px] text-violet-900 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-100">
          {toast}
        </p>
      )}
      {isFacebookCard && (
        <div className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[10px] leading-snug text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          <strong className="font-semibold">Facebook Page (not personal profile)</strong>
          <ol className="mt-1 list-decimal space-y-0.5 pl-4">
            <li>Tap <strong>Post to Page</strong> — caption copies automatically.</li>
            <li>In Facebook or Business Suite, <strong>select your Page</strong> (switch profile if needed).</li>
            <li><strong>Paste</strong> the caption → add photos from your gallery if needed → Post.</li>
          </ol>
          <p className="mt-1 text-amber-800/90 dark:text-amber-200/90">
            The normal Facebook link-sharer only works on a personal profile. Pages always need paste + Page selected.
          </p>
        </div>
      )}
      <p className="mb-2 text-[10px] leading-snug text-zinc-500 dark:text-zinc-400">
        {!isFacebookCard && (
          <>
            <strong className="font-medium text-zinc-600 dark:text-zinc-300">Facebook (profile)</strong> uses personal
            timeline only. Use <strong className="font-medium">Post to Page</strong> for a business Page.{" "}
          </>
        )}
        <strong className="font-medium text-zinc-600 dark:text-zinc-300">LinkedIn</strong> opens their share dialog;
        paste your caption there.{" "}
        <strong className="font-medium text-zinc-600 dark:text-zinc-300">WhatsApp / Instagram</strong> use your caption +
        link only (no image URLs in text); when the browser allows, we attach fetched images as files. If attach fails
        (common cross-origin), add photos manually in the app.
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
          Share{platformHint ? ` · ${platformHint}` : ""}
        </span>
        <button type="button" className={btn} onClick={() => void copyCaption()}>
          Copy caption
        </button>
        {typeof navigator !== "undefined" && "share" in navigator && (
          <button
            type="button"
            className={btn}
            onClick={() =>
              void (resolvedImageUrls?.length
                ? shareNativeWithImageFiles(body, pageUrl, resolvedImageUrls, platformHint)
                : shareNative(body, pageUrl, resolvedImageUrls, platformHint))
            }
          >
            Device
          </button>
        )}
        <button type="button" className={btn} onClick={() => open(buildShareUrl("x", body, pageUrl, resolvedImageUrls))}>
          X
        </button>
        {isFacebookCard ? (
          <>
            <button
              type="button"
              className={`${btn} border-violet-300 bg-violet-50 font-semibold text-violet-800 dark:border-violet-500/40 dark:bg-violet-500/15 dark:text-violet-100`}
              onClick={() => void shareFacebookPage()}
              title="Post on a Facebook Page you manage"
            >
              Post to Page
            </button>
            <button
              type="button"
              className={btn}
              onClick={() => void shareFacebookProfile()}
              title="Personal profile only"
            >
              Profile only
            </button>
          </>
        ) : (
          <>
            <button type="button" className={btn} onClick={() => void shareFacebookProfile()} title="Personal profile">
              Facebook
            </button>
            <button type="button" className={btn} onClick={() => void shareFacebookPage()} title="Facebook Page">
              Post to Page
            </button>
          </>
        )}
        <button type="button" className={btn} onClick={() => void copyThenOpenLinkedIn()}>
          LinkedIn
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => open(buildShareUrl("pinterest", body, pageUrl, resolvedImageUrls))}
        >
          Pinterest
        </button>
        <button type="button" className={btn} onClick={() => void shareWhatsApp()}>
          WhatsApp
        </button>
        <button type="button" className={btn} onClick={() => open(buildShareUrl("telegram", body, pageUrl, resolvedImageUrls))}>
          Telegram
        </button>
        <button type="button" className={btn} onClick={() => open(buildShareUrl("threads", body, pageUrl, resolvedImageUrls))}>
          Threads
        </button>
        <button type="button" className={btn} onClick={() => open(buildShareUrl("reddit", body, pageUrl, resolvedImageUrls))}>
          Reddit
        </button>
        <button type="button" className={btn} onClick={() => open(buildShareUrl("email", body, pageUrl, resolvedImageUrls))}>
          Email
        </button>
        <button
          type="button"
          className={btn}
          title="Copy for Instagram app"
          onClick={() => void copyForInstagram()}
        >
          Instagram
        </button>
      </div>
    </div>
  );
}
