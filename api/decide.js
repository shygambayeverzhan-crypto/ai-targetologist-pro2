const { requireAdmin } = require("../../lib/admin");
const { getSupabase } = require("../../lib/supabase");

module.exports = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  try {
    const { id, action } = req.body || {};
    if (!id || !["confirm", "reject"].includes(action)) return res.status(400).json({ error: "bad_request" });

    const supabase = getSupabase();

    if (action === "reject") {
      const { error } = await supabase
        .from("requests")
        .update({ status: "rejected", decided_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      return res.json({ ok: true });
    }

    // action === "confirm": look up the request, then grant its plan.
    const { data: request, error: findErr } = await supabase.from("requests").select("*").eq("id", id).maybeSingle();
    if (findErr) throw findErr;
    if (!request) return res.status(404).json({ error: "not_found" });

    const { error: upsertErr } = await supabase
      .from("clients")
      .upsert(
        { id: request.client_id, plan: request.plan, pro_used: 0, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      );
    if (upsertErr) throw upsertErr;

    const { error: reqErr } = await supabase
      .from("requests")
      .update({ status: "confirmed", decided_at: new Date().toISOString() })
      .eq("id", id);
    if (reqErr) throw reqErr;

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "server_error", message: String(e.message || e) });
  }
};
