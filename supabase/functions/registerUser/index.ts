import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { hash } from "https://deno.land/x/bcrypt/mod.ts";
import { v4 as uuidv4 } from "https://deno.land/std@0.192.0/uuid/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // <-- На проде укажи конкретный origin!
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ error: "Missing username or password" }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existingUser) {
      return new Response(JSON.stringify({ error: "Username already exists" }), {
        status: 409,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const hashedPassword = await hash(password);

    const generateCode = () =>
      Array.from({ length: 6 }, () =>
        Math.random().toString(36)[2].toUpperCase()
      ).join("");

    const shortCode = generateCode();

    const { data: newUser, error } = await supabase
      .from("users")
      .insert([{ username, password_hash: hashedPassword, code: shortCode }])
      .select()
      .single();

    if (error || !newUser) {
      return new Response(JSON.stringify({ error: "Failed to create user in DB" }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const expireAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 дней
    const apiPayload = {
      username,
      status: "ACTIVE",
      trojanPassword: password,
      ssPassword: password,
      vlessUuid: uuidv4.generate(),
      trafficLimitBytes: 0,
      trafficLimitStrategy: "NO_RESET",
      expireAt: expireAt.toISOString(),
    };

    const apiResponse = await fetch("https://panel.syncvk.com/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiPayload),
    });

    if (!apiResponse.ok) {
      return new Response(JSON.stringify({ error: "External API error" }), {
        status: 502,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const apiData = await apiResponse.json();

    await supabase
      .from("users")
      .update({ syncvk_uuid: apiData.response.uuid })
      .eq("id", newUser.id);

    return new Response(JSON.stringify({ user: apiData.response }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});
