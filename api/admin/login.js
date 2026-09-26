module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const { code } = req.body || {};
  if (process.env.ADMIN_CODE && code === process.env.ADMIN_CODE) return res.json({ ok: true });
  res.status(401).json({ ok: false });
};
