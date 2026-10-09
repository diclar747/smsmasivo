// Reglas de texto SMS compartidas (servidor y panel). Un SMS = 1 crédito = hasta 160 caracteres GSM-7.
// Si el texto lleva un carácter fuera de GSM-7 (p. ej. á, í, ó, ú o emojis) el SMS pasa a Unicode y el
// límite baja a 70, con lo que un mensaje de 160 consumiría 3 créditos. Por eso se transliteran los
// acentos y signos comunes y se rechaza lo que no tenga equivalente.
export const SMS_MAX = 160;

const GSM_BASIC = new Set([..."@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà"]);
const GSM_EXTENDED = new Set([..."^{}\\[~]|€\f"]); // cuentan como 2 caracteres

const REPLACE: Record<string, string> = {
  "“": '"', "”": '"', "„": '"', "«": '"', "»": '"', "‘": "'", "’": "'", "‚": "'", "´": "'", "`": "'",
  "–": "-", "—": "-", "―": "-", "−": "-", "…": "...", "•": "-", "·": "-", "°": "o", "º": "o", "ª": "a",
  " ": " ", "\t": " ", " ": "\n", " ": "\n", "™": "", "®": "", "©": "",
};
const INVISIBLE = /[​-‏‪-‮⁠﻿­]/g;

/** Si el carácter no es GSM-7, devuelve su equivalente (acentos → letra base) o null si no hay. */
function fold(ch: string): string | null {
  if (ch in REPLACE) return REPLACE[ch];
  const base = ch.normalize("NFD").replace(/[̀-ͯ]/g, "");
  return base !== ch && [...base].every(c => GSM_BASIC.has(c) || GSM_EXTENDED.has(c)) ? base : null;
}

export type PreparedSms = { text: string; length: number; unsupported: string[]; changed: boolean };

/** Normaliza un texto a GSM-7 y calcula su largo real (los caracteres extendidos { } [ ] ^ ~ \ | € cuentan doble). */
export function prepareSms(input: string): PreparedSms {
  const source = input.replace(INVISIBLE, "").replace(/\r\n?/g, "\n");
  let text = "";
  const unsupported = new Set<string>();
  for (const ch of source) {
    if (GSM_BASIC.has(ch) || GSM_EXTENDED.has(ch)) { text += ch; continue; }
    const f = fold(ch);
    if (f === null) { unsupported.add(ch); text += ch; } else text += f;
  }
  text = text.trim();
  let length = 0;
  for (const c of text) length += GSM_EXTENDED.has(c) ? 2 : 1;
  return { text, length, unsupported: [...unsupported], changed: text !== input.trim() };
}

export function smsProblem(p: PreparedSms): string | null {
  if (!p.text) return "El mensaje está vacío";
  if (p.unsupported.length) return `El mensaje contiene caracteres no admitidos (${p.unsupported.slice(0, 5).join(" ")}). Quitalos o reemplazalos por texto normal.`;
  if (p.length > SMS_MAX) return `El mensaje tiene ${p.length} caracteres; el máximo es ${SMS_MAX} (1 SMS = 1 crédito).`;
  return null;
}
