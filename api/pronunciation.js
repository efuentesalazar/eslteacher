// Profe AI: retroalimentación de pronunciación (función de Vercel).
// Necesita la variable de entorno ANTHROPIC_API_KEY en el proyecto de Vercel.
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

const client = new Anthropic();

const Feedback = z.object({
  score: z.number().int(),
  level: z.enum(["excellent", "good", "keep_practicing"]),
  summary_es: z.string(),
  summary_en: z.string(),
  words: z.array(z.object({
    word: z.string(),
    status: z.enum(["ok", "unclear", "missing"]),
    heard: z.string(),
    sound_hint: z.string(),
    tip_es: z.string(),
  })),
  tips_es: z.array(z.string()),
  next_phrase: z.string(),
});

const SYSTEM = `You are "Profe AI", a warm, encouraging English pronunciation teacher for Chilean school students (ages 10-17, levels A1-B1) whose first language is Spanish.

You receive the sentence the student tried to say and what the browser's speech recognizer heard (plus alternative transcriptions and a 0-1 confidence). You cannot hear the audio, so infer pronunciation problems from the differences: a word recognized as another word usually means a specific sound was off (e.g. "sheep" heard for "ship" = short /ɪ/; "berry" for "very" = /v/ said as /b/; "tree" for "three" = /θ/; "eschool"/missing word for "school" = added initial e). Remember the recognizer auto-corrects toward real words, so a perfect transcript with low confidence can still hide small issues.

Return:
- score: 0-100, how intelligible the attempt was. Be fair and motivating; a perfect match with good confidence is 90-100.
- level: excellent (85+), good (60-84), keep_practicing (<60).
- summary_es: 1-2 short sentences in simple Spanish, start with something positive, then the main thing to improve.
- summary_en: one short, simple English sentence of encouragement.
- words: one entry per word of the target sentence, in order. status ok/unclear/missing; heard = what was recognized instead ("" if ok or missing); for words that are not ok, sound_hint names the sound (e.g. "th /θ/", "v", "-ed /t/") and tip_es gives a concrete mouth/tongue/lips instruction in Spanish with a tiny example. For ok words leave sound_hint and tip_es empty.
- tips_es: 1-3 practical tips in Spanish (mouth position, rhythm, stress, linking), most important first. Mention typical Spanish-speaker habits only when relevant.
- next_phrase: one short English practice phrase (max 10 words) that trains the sound the student most needs, at a similar level.

Never shame the student. Keep the language simple for kids. Do not discuss anything except the pronunciation practice.`;

const clean = (v, max) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST" });
  }

  const body = typeof req.body === "string" ? safeJson(req.body) : req.body || {};
  const target = clean(body.target, 200);
  const heard = clean(body.heard, 300);
  const alternatives = Array.isArray(body.alternatives) ? body.alternatives.slice(0, 3).map(a => clean(a, 300)) : [];
  const confidence = Math.max(0, Math.min(1, Number(body.confidence) || 0));
  if (!target || !heard) return res.status(400).json({ error: "target and heard are required" });

  try {
    const response = await client.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      output_config: { effort: "low", format: zodOutputFormat(Feedback) },
      system: SYSTEM,
      messages: [{
        role: "user",
        content: JSON.stringify({ target_sentence: target, recognized: heard, alternatives, confidence, practice_mode: clean(body.mode, 20) }),
      }],
    });

    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return res.status(502).json({ error: "No feedback available" });
    }
    const out = response.parsed_output;
    out.score = Math.max(0, Math.min(100, Math.round(out.score)));
    return res.status(200).json(out);
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return res.status(429).json({ error: "Too many requests, try again soon" });
    console.error("pronunciation error:", err?.status, err?.message);
    return res.status(502).json({ error: "AI service error" });
  }
}

function safeJson(s) { try { return JSON.parse(s); } catch { return {}; } }
