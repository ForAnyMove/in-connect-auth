import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.5';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
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
      return jsonResponse({ error: 'Не передан id' }, 400);
    }

    // Ищем пользователя
    const { data: gottenUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (userError || !gottenUser) {
      return jsonResponse({ error: 'Пользователь не найден' }, 401);
    }

    const syncvkUuid = gottenUser.syncvk_uuid;

    // Получение SyncVK данных
    const syncvkRes = await fetch(
      `https://panel.syncvk.com/api/hwid/devices/${syncvkUuid}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${syncvkKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const syncvkData = await syncvkRes.json();
    const devices = syncvkData?.response?.devices;

    if (!devices || devices.length === 0) {
      return jsonResponse({ message: 'Устройства не подключены' }, 200);
    }
    // Удаляем устройство из SyncVK
    const deviceId = devices[0].hwid; // Предполагаем, что нужно удалить первое устройство
    const deleteRes = await fetch(
      `https://panel.syncvk.com/api/hwid/devices/delete`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${syncvkKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userUuid: syncvkUuid, hwid: deviceId }),
      }
    );

    if (!deleteRes.ok) {
      const errorData = await deleteRes.json();
      console.error('Ошибка при удалении устройства:', errorData);
      return jsonResponse({ error: 'Не удалось удалить устройство' }, 500);
    }

    return jsonResponse({
      message: 'Устройство успешно удалено',
      user: {
        ...gottenUser,
      },
    });
  } catch (err) {
    console.error('Delete error:', err);
    return jsonResponse({ error: 'Ошибка сервера' }, 500);
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
