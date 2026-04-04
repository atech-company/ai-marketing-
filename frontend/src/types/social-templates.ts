export interface PageImage {
  url: string;
  alt?: string | null;
  kind: string;
}

export interface SocialTemplatesPack {
  source_url: string;
  images?: PageImage[];
  instagram?: {
    caption?: string;
    hashtags?: string[];
    cta?: string;
  };
  facebook?: { post?: string };
  linkedin?: { post?: string };
  x_twitter?: { tweet?: string; reply_hook?: string };
  threads?: { post?: string };
  tiktok?: {
    on_screen_hook?: string;
    caption?: string;
    hashtags?: string[];
  };
  pinterest?: { title?: string; description?: string };
  youtube_shorts?: {
    title?: string;
    description?: string;
    hashtags?: string[];
  };
}

export function formatInstagramBlock(p: NonNullable<SocialTemplatesPack["instagram"]>): string {
  const tags = (p.hashtags ?? [])
    .map((t) => (t.startsWith("#") ? t : `#${t.replace(/^#+/, "")}`))
    .join(" ");
  return [p.caption, p.cta, tags].filter(Boolean).join("\n\n");
}

export function formatTiktokBlock(p: NonNullable<SocialTemplatesPack["tiktok"]>): string {
  const tags = (p.hashtags ?? [])
    .map((t) => (t.startsWith("#") ? t : `#${t.replace(/^#+/, "")}`))
    .join(" ");
  return [p.on_screen_hook, p.caption, tags].filter(Boolean).join("\n\n");
}

export function formatYoutubeBlock(p: NonNullable<SocialTemplatesPack["youtube_shorts"]>): string {
  const tags = (p.hashtags ?? [])
    .map((t) => (t.startsWith("#") ? t : `#${t.replace(/^#+/, "")}`))
    .join(" ");
  return [p.title, p.description, tags].filter(Boolean).join("\n\n");
}
