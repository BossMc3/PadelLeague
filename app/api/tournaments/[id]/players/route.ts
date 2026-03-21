import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { DEFAULT_ELO } from "@/lib/elo";

function resolveId(raw: string | string[] | undefined) {
  return Array.isArray(raw) ? raw[0] : raw;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string | string[] | undefined }> }
) {
  const id = (await context.params).id;
  const resolvedId = resolveId(id);
  console.log("API Request for ID:", resolvedId);
  if (!resolvedId || !isUuid(resolvedId)) {
    return NextResponse.json(
      { error: "Invalid tournament id in request params.", source: "api-validation" },
      { status: 422 }
    );
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("tournament_id", resolvedId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      {
        error: `Supabase players query failed: ${error.message}`,
        source: "supabase",
        supabaseError: error,
      },
      { status: 400 }
    );
  }

  return NextResponse.json(data ?? []);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string | string[] | undefined }> }
) {
  const id = (await context.params).id;
  const resolvedId = resolveId(id);
  console.log("API Request for ID:", resolvedId);
  if (!resolvedId || !isUuid(resolvedId)) {
    return NextResponse.json(
      { error: "Invalid tournament id in request params.", source: "api-validation" },
      { status: 422 }
    );
  }

  const { name } = (await request.json()) as { name?: string };
  const supabase = createServerSupabase();
  console.log("Server a primit pentru salvare:", { name, tournament_id: resolvedId });

  const { data, error } = await supabase
    .from("players")
    .insert({
      tournament_id: resolvedId,
      name,
      elo: DEFAULT_ELO,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      {
        error: `Supabase insert player failed: ${error.message}`,
        source: "supabase",
        supabaseError: error,
      },
      { status: 400 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
