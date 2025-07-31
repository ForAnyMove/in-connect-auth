import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  try {
    const { expiresAt } = await req.json();

    if (!expiresAt) {
      return jsonResponse({ error: "Поле 'expiresAt' обязательно" }, 400);
    }

    const now = new Date();
    const expireDate = new Date(expiresAt);

    if (isNaN(expireDate.getTime())) {
      return jsonResponse({ error: "Неверный формат даты" }, 400);
    }

    const diffMs = expireDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      return jsonResponse({ timeLeft: 0, isExpired: true });
    }

    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays < 1) {
      return jsonResponse({
        timeLeft: Math.ceil(diffHours),
        isHours: true,
      });
    }

    return jsonResponse({
      timeLeft: Math.floor(diffDays),
      isHours: false,
    });
  } catch (err) {
    console.error("Error calculating time left:", err);
    return jsonResponse({ error: "Ошибка сервера" }, 500);
  }
});

// --- Хелперы ---
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(),
  });
}
