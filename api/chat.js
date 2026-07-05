import { GoogleGenAI } from "@google/genai";
// import businessData from "./business-data.json" with { type: "json" };
import { getBusinessData } from "./redis.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = "gemini-2.5-flash";

function buildSystemPrompt(data, lang = "fr") {
  const hoursText = data.hours
    .map((h) => (h.closed ? `${h.day}: fermé` : `${h.day}: ${h.open} - ${h.close}`))
    .join("\n");
  const locationsText = data.locations.map((l) => `- ${l.name} (${l.days})`).join("\n");
  const menuText = data.menu
    .map((i) => `- ${i.name} (${i.category}, ${i.price.toFixed(2)}€${i.veg ? ", végé" : ""}): ${i.desc}`)
    .join("\n");
  const recoText = data.recommendations.map((r) => `- ${r}`).join("\n");
  const langInstruction =
    lang === "en"
      ? "Respond in English. The customer has selected English as their language preference."
      : "Réponds en français. Le client a sélectionné le français comme langue préférée.";

  return `Tu es l'assistant du food truck "${data.businessName}" en France.
${langInstruction}

HORAIRES D'OUVERTURE:
${hoursText}

EMPLACEMENTS:
${locationsText}

MENU ACTUEL:
${menuText}

RECOMMANDATIONS DE LA MAISON:
${recoText}

NOTES SUPPLÉMENTAIRES:
${data.extraNotes || "Aucune"}

Règles:
- Reste bref et chaleureux, 2-4 phrases maximum.
- Recommande des plats précis du menu selon les goûts, le budget ou les restrictions.
- Ne donne jamais de prix, plats, horaires ou emplacements qui ne figurent pas ci-dessus.
- Tu ne peux pas passer de commande toi-même, seulement conseiller.`;
}

function toGeminiContents(messages) {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { messages, lang } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array required" });
    }

    // const systemPrompt = buildSystemPrompt(businessData, lang);

    const businessData = await getBusinessData();
const systemPrompt = buildSystemPrompt(businessData, lang);

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: toGeminiContents(messages),
      config: { systemInstruction: systemPrompt, maxOutputTokens: 300 },
    });

    res.status(200).json({ reply: response.text });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Le service IA est momentanément indisponible." });
  }
}