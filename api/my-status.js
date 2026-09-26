const { getOrCreateClient, clientIdFrom, FREE_LIMIT, PRO_LIMIT } = require("../lib/limits");
const { getSupabase } = require("../lib/supabase");

module.exports = async (req, res) => {
  try {
    const clientId = clientIdFrom(req);
    if (!clientId) return res.status(400).json({ error: "missing_client_id" });

    const row = await getOrCreateClient(clientId);
    const supabase = getSupabase();
    const { data: lastRequest, error } = await supabase
      .from("requests")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;

    res.json({
      plan: row.plan,
      usage: { generator: row.gen_used, analyzer: row.an_used, funnels: row.fn_used, consultant: row.cons_used },
      proUsed: row.pro_used,
      limits: { free: FREE_LIMIT, pro: PRO_LIMIT },
      lastRequest: lastRequest || null
    });
  } catch (e) {
    res.status(500).json({ error: "server_error", message: String(e.message || e) });
  }
};
