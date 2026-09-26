const { requireAdmin } = require("../../lib/admin");
const { getSupabase } = require("../../lib/supabase");

module.exports = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  try {
    const { clientId, plan } = req.body || {};
    if (!clientId || !["FREE", "PRO", "VIP"].includes(plan)) return res.status(400).json({ error: "bad_request" });

    const supabase = getSupabase();
    const { error } = await supabase
      .from("clients")
      .upsert({ id: clientId, plan, pro_used: 0, updated_at: new Date().toISOString() }, { onConflict: "id" });
    if (error) throw error;

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "server_error", message: String(e.message || e) });
  }
};
