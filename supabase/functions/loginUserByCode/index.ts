import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";

// Supabase env
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const syncvkKey = Deno.env.get("SYNCVK_ACCESS_KEY")!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  try {
    const { code } = await req.json();

    if (!code) {
      return jsonResponse({ error: "Введите 6-значный код" }, 400);
    }

    // Ищем пользователя
    const { data: gottenUser, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    if (userError || !gottenUser) {
      return jsonResponse({ error: "Пользователь не найден" }, 401);
    }
    
    // Логин в Supabase Auth (сгенерированный email + пароль)
    const email = `${gottenUser.username}@generated.email`;
    const password = gottenUser.password_hash;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData?.session) {
      return jsonResponse({ error: "Ошибка при авторизации" }, 401);
    }

    // Получаем данные пользователя из SyncVK
    const syncvkRes = await fetch(`https://panel.syncvk.com/api/users/by-username/${gottenUser?.username}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${syncvkKey}`,
        "Content-Type": "application/json",
      },
    });

    const syncvkData = await syncvkRes.json();
    const uuid = syncvkData?.response?.uuid;

    return jsonResponse({
      session: authData.session,
      user: {
        ...gottenUser,
        syncvk_uuid: uuid,
        user_API_data: syncvkData?.response,
      },
    }, 200);
  } catch (err) {
    console.error("Login error:", err);
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
