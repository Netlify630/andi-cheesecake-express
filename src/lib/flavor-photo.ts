import { supabase } from "@/integrations/supabase/client";

export const FLAVOR_PHOTO_BUCKET = "flavor-photos";
/** Marker stored in flavors.image_url for photos uploaded to our own storage. */
export const STORAGE_PREFIX = "storage:";

export function isStoredPhoto(value: string | null | undefined) {
  return !!value && value.startsWith(STORAGE_PREFIX);
}

export function storagePathOf(value: string) {
  return value.slice(STORAGE_PREFIX.length);
}

/** Shrinks a photo in the browser so it can be saved inline with the flavor. */
async function toCompressedDataUrl(file: File, maxSide = 1400, quality = 0.82): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process that photo. Please try another one.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  if (dataUrl.length > 3_000_000) {
    return canvas.toDataURL("image/jpeg", 0.6);
  }
  return dataUrl;
}

/** Uploads a photo file and returns the value to save in flavors.image_url. */
export async function uploadFlavorPhoto(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;
  try {
    const { error } = await supabase.storage
      .from(FLAVOR_PHOTO_BUCKET)
      .upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
    if (!error) return `${STORAGE_PREFIX}${path}`;
  } catch {
    // fall through to the inline fallback below
  }

  // Photo storage isn't set up on this backend (or the upload was rejected).
  // Save a shrunk copy of the photo directly with the flavor so it still works.
  return toCompressedDataUrl(file);
}


/** Turns a stored-photo marker into a URL an <img> tag can display. */
export async function resolveFlavorPhoto(value: string): Promise<string | null> {
  if (!isStoredPhoto(value)) return value || null;
  const path = storagePathOf(value);
  const { data } = await supabase.storage
    .from(FLAVOR_PHOTO_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 7);
  return data?.signedUrl ?? null;
}
