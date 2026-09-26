const { getSupabase } = require("./supabase");

const USAGE_COLUMN = {
  generator: "gen_used",
  analyzer: "an_used",
  funnels: "fn_used",
  consultant: "cons_used"
};

const FREE_LIMIT = 10; // per tool, on the FREE plan
const PRO_LIMIT = 100; // shared pool, on the PRO plan

function clientIdFrom(req) {
  const id = req.headers["x-client-id"];
  if (!id || typeof id !== "string" || id.length < 8 || id.length > 128) return null;
  return id;
}

async function getOrCreateClient(id) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (data) return data;

  const { data: inserted, error: insertErr } = await supabase
    .from("clients")
    .insert({ id })
    .select()
    .single();
  if (insertErr) throw insertErr;
  return inserted;
}

/** Returns {ok:true} and bumps the counter, or {ok:false} if this visitor's
 *  current plan has no runs left for `tool`. */
async function checkAndBumpUsage(clientId, tool) {
  const supabase = getSupabase();
  const row = await getOrCreateClient(clientId);

  if (row.plan === "VIP") return { ok: true };

  if (row.plan === "PRO") {
    if (row.pro_used >= PRO_LIMIT) return { ok: false, reason: "pro_limit" };
    const { error } = await supabase
      .from("clients")
      .update({ pro_used: row.pro_used + 1, updated_at: new Date().toISOString() })
      .eq("id", clientId);
    if (error) throw error;
    return { ok: true };
  }

  const col = USAGE_COLUMN[tool];
  if (!col) return { ok: false, reason: "unknown_tool" };
  if (row[col] >= FREE_LIMIT) return { ok: false, reason: "free_limit" };

  const patch = { updated_at: new Date().toISOString() };
  patch[col] = row[col] + 1;
  const { error } = await supabase.from("clients").update(patch).eq("id", clientId);
  if (error) throw error;
  return { ok: true };
}

module.exports = { getOrCreateClient, checkAndBumpUsage, clientIdFrom, USAGE_COLUMN, FREE_LIMIT, PRO_LIMIT };
