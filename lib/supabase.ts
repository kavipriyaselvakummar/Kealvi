import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

let isOffline = false;

const timeoutFetch = (url: RequestInfo | URL, options?: RequestInit) => {
  if (isOffline) {
    return Promise.reject(new Error("Supabase is offline (cached)"));
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 1500);
  return fetch(url, {
    ...options,
    signal: controller.signal,
  })
    .catch((err) => {
      const msg = err.message || "";
      if (
        err.name === "AbortError" ||
        msg.includes("ENOTFOUND") ||
        msg.includes("fetch failed")
      ) {
        isOffline = true;
        // Reset after 30 seconds to retry
        setTimeout(() => {
          isOffline = false;
        }, 30000);
      }
      throw err;
    })
    .finally(() => clearTimeout(id));
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: timeoutFetch as typeof fetch,
  },
});
