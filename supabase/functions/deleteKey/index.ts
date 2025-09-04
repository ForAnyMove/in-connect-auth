import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.5';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const syncvkKey = Deno.env.get('SYNCVK_ACCESS_KEY')!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

serve(async (req) => {
  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  try {
    const { id } = await req.json();
    
    if (!id) {
      return jsonResponse({ error: "Не передан id" }, 400);
    }

    // Ищем пользователя
    const { data: gottenUser, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (userError || !gottenUser) {
      return jsonResponse({ error: "Пользователь не найден" }, 401);
    }

    const syncvkUuid = gottenUser.syncvk_uuid;

    // Получение SyncVK данных
    const syncvkRes = await fetch(
      `https://panel.syncvk.com/api/users/${syncvkUuid}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${syncvkKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Обновляем пользователя с uuid
    const { error: updateError } = await supabase
      .from('users')
      .update({ syncvk_uuid: null, isVKSync: false })
      .eq('id', id);

    if (updateError) {
      console.error('Ошибка при удалении ключа:', updateError);
      return jsonResponse({ error: 'Не удалось удалить ключ' }, 500);
    }

    return jsonResponse({
      user: {
        ...gottenUser,
        syncvk_uuid: null,
        isVKSync: false,
      },
    });
  } catch (err) {
    console.error("Delete error:", err);
    return jsonResponse({ error: "Ошибка сервера" }, 500);
  }
});

// --- Хелперы ---
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
    'Content-Type': 'application/json',
  };
}
function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(),
  });
}
