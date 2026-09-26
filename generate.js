const { checkAndBumpUsage, clientIdFrom } = require("../lib/limits");
const { askAI } = require("../lib/ai");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const clientId = clientIdFrom(req);
  if (!clientId) return res.status(400).json({ error: "missing_client_id" });

  try {
    const gate = await checkAndBumpUsage(clientId, "generator");
    if (!gate.ok) return res.status(402).json({ error: "limit_exceeded" });

    const { niche, target, geo, platform, tone, funnel } = req.body || {};
    const prompt =
      "Ты — опытный таргетолог и копирайтер, работающий с рынком СНГ. Собери полную рекламную связку.\n\n" +
      `Ниша/продукт: ${niche || "Онлайн-курс по мобилографии"}\n` +
      `Целевая аудитория: ${target || "Девушки 18–35 лет, начинающие блогеры"}\n` +
      `Гео: ${geo || "Казахстан"}\n` +
      `Площадка: ${platform || "Instagram / Facebook Ads (Meta)"}\n` +
      `Тональность: ${tone || "Вовлекающий, трендовый"}\n` +
      (funnel ? `Архитектура воронки: ${funnel}\n` : "") +
      "\nПиши по-русски, конкретно, без воды и без общих фраз вроде «качественный продукт». " +
      "Используй реальные интересы, доступные в рекламном кабинете выбранной площадки.\n\n" +
      "Ответь ТОЛЬКО JSON-объектом такой формы:\n" +
      '{"framework":"AIDA|PAS|4U","offer":"1 предложение","headlines":["3 варианта заголовка"],' +
      '"hook":"первые 3 секунды видео","body":"что показать и сказать в основной части","cta":"призыв к действию",' +
      '"audience":{"interests":["5-7 интересов"],"age":"18-35","geo":"...","placements":"..."},' +
      '"budget":"рекомендация по стартовому бюджету","kpi":"целевые CTR/CPL"}';

    const data = await askAI(prompt, { json: true });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "ai_error", message: String(e.message || e) });
  }
};
