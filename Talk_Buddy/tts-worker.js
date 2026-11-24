// Talk Buddy · voz natural (Kokoro-82M, licencia Apache 2.0). Corre en el procesador del alumno (WASM),
// así no compite con la tarjeta gráfica que usa la IA de conversación. Se descarga una vez (~90 MB).
// Las frases se generan de a una y en orden (el modelo no puede generar dos a la vez).
import { KokoroTTS } from "https://esm.run/kokoro-js@1.2.1";

let tts = null, chain = Promise.resolve(), cancelled = 0;
self.onmessage = ({ data }) => {
  if (data.type === "cancel") { cancelled = data.id; return; }
  chain = chain.then(() => handle(data));
};

async function handle(data) {
  try {
    if (data.type === "load") {
      if (!tts) tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
        dtype: "q8", device: "wasm",
        progress_callback: p => { if (p && p.status === "progress") self.postMessage({ type: "progress", p: p.progress || 0 }); }
      });
      self.postMessage({ type: "ready" });
    } else if (data.type === "speak") {
      if (data.id > 0 && data.id <= cancelled) return;   // el alumno ya pasó a otra cosa (las pruebas usan id negativo)
      const t0 = performance.now();
      const a = await tts.generate(data.text, { voice: data.voice, speed: data.speed });
      self.postMessage({ type: "audio", id: data.id, idx: data.idx, audio: a.audio, rate: a.sampling_rate, ms: performance.now() - t0 }, [a.audio.buffer]);
    }
  } catch (e) {
    self.postMessage({ type: "error", id: data.id, msg: String((e && e.message) || e) });
  }
}
