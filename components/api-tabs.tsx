"use client";

import { useState } from "react";

/** Ejemplos de la API en varios lenguajes, con pestañas. */
export default function ApiTabs({ samples }: { samples: { lang: string; text: string }[] }) {
  const [tab, setTab] = useState(0);
  const cur = samples[tab] ?? samples[0];
  return <div className="api-tabs">
    <div className="api-tablist" role="tablist" aria-label="Lenguaje del ejemplo">
      {samples.map((s, i) => <button key={s.lang} role="tab" aria-selected={i === tab} className={i === tab ? "on" : ""} onClick={() => setTab(i)}>{s.lang}</button>)}
    </div>
    <pre role="tabpanel" aria-label={`Ejemplo en ${cur?.lang}`}><code>{cur?.text}</code></pre>
  </div>;
}
