const { checkAndBumpUsage, clientIdFrom } = require("../lib/limits");
const { askAI } = require("../lib/ai");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const clientId = clientIdFrom(req);
  if (!clientId) return res.status(400).json({ error: "missing_client_id" });

  try {
    const gate = await checkAndBumpUsage(clientId, "analyzer");
    if (!gate.ok) return res.status(402).json({ error: "limit_exceeded" });

    const { offer } = req.body || {};
    if (!offer || !String(offer).trim()) return res.status(400).json({ error: "missing_offer" });

    const prompt =
      "Ты — таргетолог-аналитик. Оцени рекламный оффер честно и строго, без комплиментов.\n\n" +
      `ОФФЕР:\n${offer}\n\n` +
      "Оцени ясность, конкретику выгоды, снятие возражений, доверие, силу призыва. " +
      "CTR оцени реалистично для холодного трафика в соцсетях. Пиши по-русски.\n\n" +
      "Ответь ТОЛЬКО JSON:\n" +
      '{"ctr":"например ≈ 1.8%","ctrLevel":"короткая оценка уровня","score":0-100,' +
      '"strengths":["2-4 пункта"],"weaknesses":["2-4 пункта"],"rewrite":["2-3 усиленных варианта оффера"]}';

    const data = await askAI(prompt, { json: true });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "ai_error", message: String(e.message || e) });
  }
};
