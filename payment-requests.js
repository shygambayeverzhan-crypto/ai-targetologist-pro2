const { clientIdFrom } = require("../lib/limits");
const { getSupabase } = require("../lib/supabase");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  try {
    const clientId = clientIdFrom(req);
    const { plan, price } = req.body || {};
    if (!clientId) return res.status(400).json({ error: "missing_client_id" });
    if (!["PRO", "VIP"].includes(plan)) return res.status(400).json({ error: "bad_plan" });

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("requests")
      .insert({ client_id: clientId, plan, price: Number(price) || 0, status: "pending" })
      .select()
      .single();
    if (error) throw error;

    res.json({ ok: true, id: data.id });
  } catch (e) {
    res.status(500).json({ error: "server_error", message: String(e.message || e) });
  }
};
