import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.5';
import bcrypt from 'https://esm.sh/bcryptjs@2.4.3';

// Supabase env vars
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const syncvkKey = Deno.env.get('SYNCVK_ACCESS_KEY')!;

// Init Supabase client with Service Role
const supabase = createClient(supabaseUrl, serviceRoleKey);

serve(async (req) => {
  // ✅ CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  try {
    const { username, tgId } = await req.json();

    const availableUsername = username || `th_${tgId}`;

    // Проверка — не занят ли username
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('tg_id', tgId)
      .maybeSingle();

    if (existingUser) {
      const { authData, authError } = await supabase.auth.signInWithPassword({
        email: `${existingUser.username}@generated.email`,
        password: existingUser.password_hash,
      });
      
      if (authError) {
        console.error('Ошибка при входе:', authError);
      } else {
        console.log('Пользователь успешно вошел:', authData);
      }
      // Получаем данные пользователя из SyncVK
      const syncvkRes = await fetch(
        `https://panel.syncvk.com/api/users/by-username/${existingUser.username}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${syncvkKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const syncvkData = await syncvkRes.json();
      const uuid = syncvkData?.response?.uuid;

      return jsonResponse(
        {
          user: {
            ...existingUser,
            syncvk_uuid: uuid,
            user_API_data: syncvkData?.response,
          },
        },
        200
      );
    }

    // Хэширование пароля
    const hashedPassword = bcrypt.hashSync(tgId, 10);
    // Регистрируем пользователя через Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: `${availableUsername}@generated.email`, // или требуй реальный email
        password: hashedPassword,
        email_confirm: true, // сразу подтверждён
      });

    if (authError || !authData.user) {
      console.error('Ошибка регистрации в Supabase Auth:', authError);
      return jsonResponse({ error: 'Ошибка регистрации' }, 500);
    }

    const authUserId = authData.user.id;

    // Создание пользователя в Supabase
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          username: availableUsername,
          password_hash: hashedPassword,
          auth_user_id: authUserId,
          tg_id: tgId,
        },
      ])
      .select()
      .single();

    if (insertError || !newUser) {
      console.error('Insert error:', insertError);
      return jsonResponse({ error: 'Ошибка создания пользователя' }, 500);
    }

    // Создание пользователя в SyncVK
    const expireAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 1); // 1 дней
    const syncvkPayload = {
      username,
      expireAt: expireAt.toISOString(),
    };

    const syncvkResponse = await fetch('https://panel.syncvk.com/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${syncvkKey}`,
      },
      body: JSON.stringify(syncvkPayload),
    });

    const syncvkData = await syncvkResponse.json();

    const uuid = syncvkData?.response?.uuid;

    if (!uuid) {
      console.error('SyncVK response invalid:', syncvkData);
      return jsonResponse(
        { error: 'Ошибка при создании SyncVK пользователя' },
        500
      );
    }

    // Обновляем пользователя с uuid
    const { error: updateError } = await supabase
      .from('users')
      .update({ syncvk_uuid: uuid })
      .eq('id', newUser.id);

    if (updateError) {
      console.error('Ошибка при обновлении uuid:', updateError);
      return jsonResponse({ error: 'Не удалось записать syncvk_uuid' }, 500);
    }

    return jsonResponse(
      {
        user: {
          ...newUser,
          syncvk_uuid: uuid,
          user_API_data: syncvkData?.response,
        },
      },
      200
    );
  } catch (err) {
    console.error('Общая ошибка:', err);
    return jsonResponse({ error: 'Внутренняя ошибка сервера' }, 500);
  }
});

// --- Хелперы ---

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(),
  });
}
