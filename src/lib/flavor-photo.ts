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

/** Uploads a photo file and returns the value to save in flavors.image_url. */
export async function uploadFlavorPhoto(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(FLAVOR_PHOTO_BUCKET)
    .upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
  if (error) throw error;
  return `${STORAGE_PREFIX}${path}`;
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
