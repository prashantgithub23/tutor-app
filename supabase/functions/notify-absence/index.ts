// supabase/functions/notify-absence/index.ts
// Deploy with: supabase functions deploy notify-absence
//
// Runs server-side so parents' push tokens never touch the client app.
// Looks up each absent student's parent, finds their push token, and
// sends an Expo push notification.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const { studentIds, classDate, classId } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // service role bypasses RLS, safe here since this is server-only
  );

  const { data: students } = await supabase
    .from("students")
    .select("id, full_name, parent_id")
    .in("id", studentIds);

  const { data: klass } = await supabase
    .from("classes")
    .select("subject")
    .eq("id", classId)
    .single();

  for (const student of students ?? []) {
    const { data: tokens } = await supabase
      .from("push_tokens")
      .select("expo_push_token")
      .eq("profile_id", student.parent_id);

    for (const { expo_push_token } of tokens ?? []) {
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: expo_push_token,
          title: `${student.full_name} marked absent`,
          body: `${klass?.subject ?? "Class"} on ${classDate}`,
          data: { type: "absence", studentId: student.id, classDate },
        }),
      });
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
