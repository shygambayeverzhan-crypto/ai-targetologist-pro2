/** Calls Google Gemini's API. The key lives only in Vercel's
 *  environment variables — never in this file, never in the browser. */
async function askAI(promptOrMessages, { json = false } = {}) {
  // Превращаем входящие сообщения (если это массив) в формат Gemini или просто берем текст
  let contents = "";
  if (Array.isArray(promptOrMessages)) {
    // Конвертируем историю ролей OpenAI в формат Gemini, если нужно,
    // либо берем последнее сообщение пользователя:
    contents = promptOrMessages.map(m => `${m.role}: ${m.content}`).join("\n");
  } else {
    contents = promptOrMessages;
  }

  // Проверяем ключ (теперь используем GEMINI_API_KEY)
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  // Выбираем модель (по умолчанию gemini-2.5-flash)
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [{ text: contents }]
      }
    ],
    generationConfig: {
      maxOutputTokens: 1400,
      ...(json ? { responseMimeType: "application/json" } : {})
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gemini API ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  
  // Достаем текст из ответа Gemini
  const text = (
    data.candidates &&
    data.candidates[0] &&
    data.candidates[0].content &&
    data.candidates[0].content.parts &&
    data.candidates[0].content.parts[0] &&
    data.candidates[0].content.parts[0].text
  ) || "";

  if (!json) return text;

  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
}

module.exports = { askAI };
