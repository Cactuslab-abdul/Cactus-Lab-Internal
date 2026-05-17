import { createClient } from "./supabase/client";

const BUCKET = "app-data";

export async function syncLoad<T>(key: string, localFallback: T): Promise<T> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    console.log(`[sync] load "${key}" — auth:`, user?.email ?? "NOT LOGGED IN");
    const { data, error } = await supabase.storage.from(BUCKET).download(`${key}.json`);
    if (error) { console.warn(`[sync] load "${key}" FAILED:`, error.message); return localFallback; }
    if (!data) { console.warn(`[sync] load "${key}" — no data`); return localFallback; }
    const text = await data.text();
    const parsed = JSON.parse(text) as T;
    console.log(`[sync] load "${key}" OK — ${Array.isArray(parsed) ? parsed.length + " items" : "loaded"}`);
    return parsed;
  } catch (e) {
    console.warn(`[sync] load "${key}" threw:`, e);
    return localFallback;
  }
}

export async function syncSave<T>(key: string, value: T): Promise<void> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    console.log(`[sync] save "${key}" — auth:`, user?.email ?? "NOT LOGGED IN");
    const blob = new Blob([JSON.stringify(value)], { type: "application/json" });
    const { error } = await supabase.storage.from(BUCKET).upload(`${key}.json`, blob, { upsert: true });
    if (error) console.warn(`[sync] save "${key}" FAILED:`, error.message);
    else console.log(`[sync] save "${key}" OK`);
  } catch (e) {
    console.warn(`[sync] save "${key}" threw:`, e);
  }
}
