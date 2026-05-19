const BASE = "/api/sync";

export async function syncLoad<T>(key: string, localFallback: T): Promise<T> {
  try {
    const res = await fetch(`${BASE}?key=${encodeURIComponent(key)}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[sync] load "${key}" FAILED: ${res.status}`);
      return localFallback;
    }
    const parsed = await res.json() as T;
    console.log(`[sync] load "${key}" OK — ${Array.isArray(parsed) ? parsed.length + " items" : "loaded"}`);
    return parsed;
  } catch (e) {
    console.warn(`[sync] load "${key}" threw:`, e);
    return localFallback;
  }
}

export async function syncSave<T>(key: string, value: T): Promise<void> {
  try {
    const res = await fetch(`${BASE}?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
    if (!res.ok) {
      const err = await res.text();
      console.warn(`[sync] save "${key}" FAILED:`, err);
    } else {
      console.log(`[sync] save "${key}" OK`);
    }
  } catch (e) {
    console.warn(`[sync] save "${key}" threw:`, e);
  }
}
