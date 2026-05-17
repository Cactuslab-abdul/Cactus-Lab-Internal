import { createClient } from "./supabase/client";

const BUCKET = "app-data";

export async function syncLoad<T>(key: string, localFallback: T): Promise<T> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.storage.from(BUCKET).download(`${key}.json`);
    if (error || !data) return localFallback;
    const text = await data.text();
    return JSON.parse(text) as T;
  } catch {
    return localFallback;
  }
}

export async function syncSave<T>(key: string, value: T): Promise<void> {
  try {
    const supabase = createClient();
    const blob = new Blob([JSON.stringify(value)], { type: "application/json" });
    await supabase.storage.from(BUCKET).upload(`${key}.json`, blob, { upsert: true });
  } catch {
    // silent — localStorage already has the data
  }
}
