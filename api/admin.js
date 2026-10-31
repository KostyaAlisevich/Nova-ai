export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const ADMIN_PASSWORD = "aka29072012";

  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  if (req.body?.password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Неверный пароль" });
  }

  return res.status(200).json({ ok: true });
}
