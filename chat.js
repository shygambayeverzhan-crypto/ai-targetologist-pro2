const { checkAndBumpUsage, clientIdFrom } = require("../lib/limits");
const { askAI } = require("../lib/ai");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const clientId = clientIdFrom(req);
  if (!clientId) return res.status(400).json({ error: "missing_client_id" });

  try {
    const gate = await checkAndBumpUsage(clientId, "consultant");
    if (!gate.ok) return res.status(402).json({ error: "limit_exceeded" });

    const { turns } = req.body || {};
    if (!Array.isArray(turns) || !turns.length) return res.status(400).json({ error: "missing_turns" });

    const system =
      "Ты — практикующий таргетолог с опытом в Meta Ads и TikTok Ads, работаешь с рынком СНГ и Казахстана. " +
      "Отвечай по-русски, коротко и по делу: конкретные настройки, цифры, структура кампаний, а не общие советы. " +
      "Если данных не хватает — задай один уточняющий вопрос. Не советуй обходить правила площадок и блокировки: " +
      "вместо этого объясняй, как пройти модерацию легально. Максимум 180 слов.";

    const messages = [{ role: "user", content: system }].concat(
      turns.slice(-12).map((t) => ({ role: t.role === "assistant" ? "assistant" : "user", content: String(t.content || "") }))
    );

    const text = await askAI(messages, { json: false });
    res.json({ text });
  } catch (e) {
    res.status(500).json({ error: "ai_error", message: String(e.message || e) });
  }
};
