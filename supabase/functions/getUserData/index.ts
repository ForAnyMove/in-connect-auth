import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const syncvkKey = Deno.env.get("SYNCVK_ACCESS_KEY")!;

serve(async (req) => {
  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  const supabaseClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: { Authorization: req.headers.get("Authorization")! },
    },
  });

  // Получение авторизованного пользователя
  const { data: authData, error: authError } = await supabaseClient.auth.getUser();

  if (authError || !authData?.user) {
    return jsonResponse({ error: "Неавторизовано" }, 401);
  }

  const authUserId = authData.user.id;

  // Получение из своей таблицы users
  const { data: gottenUser, error: userError } = await supabaseClient
    .from("users")
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (userError || !gottenUser) {
    return jsonResponse({ error: "Пользователь не найден" }, 404);
  }

  const username = gottenUser.username;

  // Получение SyncVK данных
  const syncvkRes = await fetch(`https://panel.syncvk.com/api/users/by-username/${username}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${syncvkKey}`,
      "Content-Type": "application/json",
    },
  });

  const syncvkData = await syncvkRes.json();
  const uuid = syncvkData?.response?.uuid;

  return jsonResponse({
    user: {
      ...gottenUser,
      syncvk_uuid: uuid,
      user_API_data: syncvkData?.response,
    },
  });
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
