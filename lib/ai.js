/** Calls OpenAI's Chat Completions API. The key lives only in Vercel's
 *  environment variables — never in this file, never in the browser. */
async function askAI(promptOrMessages, { json = false } = {}) {
  const messages = Array.isArray(promptOrMessages)
    ? promptOrMessages
    : [{ role: "user", content: promptOrMessages }];

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in environment variables");
  }

  const body = {
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages,
    max_tokens: 1400
  };
  if (json) body.response_format = { type: "json_object" };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenAI API ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
  if (!json) return text;

  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
}

module.exports = { askAI };
