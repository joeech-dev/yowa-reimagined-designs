import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller is admin/super_admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData } = await userClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "super_admin"])
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Handle delete action
    if (body.action === "delete") {
      const { userId } = body;
      if (!userId) {
        return new Response(JSON.stringify({ error: "userId is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Delete team member entry if exists
      await adminClient.from("team_members").delete().eq("id", userId);
      // Delete user role
      await adminClient.from("user_roles").delete().eq("user_id", userId);
      // Delete profile
      await adminClient.from("profiles").delete().eq("user_id", userId);
      // Delete user presence
      await adminClient.from("user_presence").delete().eq("user_id", userId);
      // Delete auth user
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
      if (deleteError) throw deleteError;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle create action (default)
    const { email, password, role, fullName, teamCategory, teamRole } = body;
    if (!email || !password || !role) {
      return new Response(JSON.stringify({ error: "email, password, and role are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validRoles = ["admin", "super_admin", "finance", "project_team", "sales_marketing"];
    if (!validRoles.includes(role)) {
      return new Response(JSON.stringify({ error: "Invalid role" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizedEmail)) {
      return new Response(JSON.stringify({ error: "Please enter a valid email address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (String(password).length < 6) {
      return new Response(JSON.stringify({ error: "Password must be at least 6 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Friendly duplicate check before hitting the auth admin API
    const { data: existingList } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const duplicate = existingList?.users?.find((u) => u.email?.toLowerCase() === normalizedEmail);
    if (duplicate) {
      return new Response(
        JSON.stringify({ error: `A user with the email ${normalizedEmail} already exists` }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Create the user with service role
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || "" },
    });

    if (createError) {
      console.error("createUser failed:", createError.message);
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Assign role (idempotent — the signup trigger may already have added one)
    const { error: roleInsertError } = await adminClient
      .from("user_roles")
      .upsert({ user_id: newUser.user.id, role }, { onConflict: "user_id,role" });

    if (roleInsertError) {
      console.error("role assignment failed:", roleInsertError.message);
      return new Response(
        JSON.stringify({ error: `User created but role assignment failed: ${roleInsertError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Ensure a profile row exists with the given name
    await adminClient
      .from("profiles")
      .upsert({ user_id: newUser.user.id, full_name: fullName || null }, { onConflict: "user_id" });

    // Create team member if category provided
    if (teamCategory && ["employee", "freelancer", "trainee"].includes(teamCategory)) {
      const { error: teamError } = await adminClient
        .from("team_members")
        .insert({
          full_name: fullName || normalizedEmail,
          role: teamRole || role,
          category: teamCategory,
        });

      if (teamError) {
        console.error("Team member creation error:", teamError);
      }
    }

    return new Response(JSON.stringify({ success: true, user: { id: newUser.user.id, email: normalizedEmail } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("create-user error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});


    return new Response(JSON.stringify({ success: true, user: { id: newUser.user.id, email } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
