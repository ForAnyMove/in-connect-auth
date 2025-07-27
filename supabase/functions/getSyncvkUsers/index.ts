// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

serve(async (_req) => {
  try {
    const response = await fetch("https://panel.syncvk.com/api/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // ❗Если требуется авторизация — добавь токен:
        // "Authorization": "Bearer YOUR_TOKEN"
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch users" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await response.json();

    return new Response(JSON.stringify({ users: data.response }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("Error in getSyncvkUsers:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
