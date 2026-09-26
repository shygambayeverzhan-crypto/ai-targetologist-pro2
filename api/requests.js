const { requireAdmin } = require("../../lib/admin");
const { getSupabase } = require("../../lib/supabase");

module.exports = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const supabase = getSupabase();
    const all = req.query.status === "all";
    let query = supabase.from("requests").select("*").order("created_at", { ascending: false }).limit(200);
    if (!all) query = query.eq("status", "pending");
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "server_error", message: String(e.message || e) });
  }
};
