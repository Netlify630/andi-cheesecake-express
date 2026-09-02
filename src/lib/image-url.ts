// Normalizes pasted photo links so they point at an actual image file.
// Many "share" links (Google Drive, Dropbox, Imgur pages) are HTML pages, not
// images, and render blank inside an <img> tag.

export function normalizeImageUrl(input: string): string {
  const url = input.trim();
  if (!url) return "";

  // Google Drive share link -> direct file view
  const drive = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([\w-]{10,})/);
  if (drive) return `https://drive.google.com/uc?export=view&id=${drive[1]}`;

  // Dropbox share link -> raw file
  if (/dropbox\.com\//.test(url)) {
    return url.replace(/[?&]dl=0/, "").replace(/[?&]raw=1/, "") + (url.includes("?") ? "&raw=1" : "?raw=1");
  }

  // Imgur page link -> direct image
  const imgur = url.match(/^https?:\/\/(?:www\.)?imgur\.com\/([\w]{5,})$/);
  if (imgur) return `https://i.imgur.com/${imgur[1]}.jpeg`;

  return url;
}

/** True when the link looks like something an <img> tag can actually display. */
export function looksLikeImageUrl(input: string): boolean {
  const url = normalizeImageUrl(input);
  if (!url) return false;
  if (url.startsWith("data:image/")) return true;
  if (!/^https?:\/\//i.test(url)) return false;
  // Known page URLs that are not images
  if (/^https?:\/\/(www\.)?(google\.[a-z.]+\/(search|imgres)|pinterest\.|www\.instagram\.com|facebook\.com)/i.test(url)) {
    return false;
  }
  return true;
}
