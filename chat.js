export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Разрешён только POST-запрос." });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "На сервере не задан GROQ_API_KEY." });

  try {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages.slice(-12) : [];
    if (!messages.length) return res.status(400).json({ error: "Напиши сообщение." });

    let hasImage = false;
    const safeMessages = messages.map((m) => {
      if (!["user", "assistant"].includes(m.role)) throw new Error("Недопустимая роль сообщения.");
      if (typeof m.content === "string") return { role: m.role, content: m.content.slice(0, 12000) };
      if (m.role !== "user" || !Array.isArray(m.content)) throw new Error("Неверный формат сообщения.");
      const parts = m.content.slice(0, 2).map((part) => {
        if (part.type === "text") return { type: "text", text: String(part.text || "").slice(0, 8000) };
        if (part.type === "image_url" && typeof part.image_url?.url === "string") {
          const url = part.image_url.url;
          if (!/^data:image\/(jpeg|png|webp);base64,/.test(url) || url.length > 5_000_000) {
            throw new Error("Изображение слишком большое или имеет неподдерживаемый формат.");
          }
          hasImage = true;
          return { type: "image_url", image_url: { url } };
        }
        throw new Error("Неподдерживаемый тип данных.");
      });
      return { role: m.role, content: parts };
    });

    const model = hasImage ? "qwen/qwen3.6-27b" : "llama-3.3-70b-versatile";
    const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "Ты Nova AI — полезный, дружелюбный ИИ-помощник. Отвечай на языке пользователя, обычно на русском. Объясняй понятно и честно; если не знаешь ответа, скажи об этом. При анализе изображения описывай только то, что действительно видно." },
          ...safeMessages
        ],
        temperature: 0.7,
        max_completion_tokens: 1500
      })
    });

    const result = await upstream.json();
    if (!upstream.ok) {
      const detail = result?.error?.message || "Groq API вернул ошибку.";
      return res.status(upstream.status).json({ error: detail });
    }
    const reply = result?.choices?.[0]?.message?.content;
    if (!reply) return res.status(502).json({ error: "Модель не вернула текстовый ответ." });
    return res.status(200).json({ reply, model });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Не удалось обработать запрос." });
  }
}