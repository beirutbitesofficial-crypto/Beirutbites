import { useEffect, useState } from "react";

const LANGS = [["sv", "Svenska"], ["en", "English"], ["ar", "العربية"]];
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

// Admin lock screen: a 4-digit PIN pad (works with taps or the keyboard).
export default function Gate({ t, lang, setLang, state, message, attempt, busy, onPin }) {
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!message) return undefined;
    setPin("");
    setShake(true);
    const id = setTimeout(() => setShake(false), 500);
    return () => clearTimeout(id);
  }, [message, attempt]);

  const press = (k) => {
    if (busy || state !== "login") return;
    if (k === "del") { setPin((p) => p.slice(0, -1)); return; }
    if (!/^\d$/.test(k)) return;
    setPin((p) => {
      const next = (p + k).slice(0, 4);
      if (next.length === 4) setTimeout(() => onPin(next), 120);
      return next;
    });
  };

  useEffect(() => {
    const onKey = (e) => {
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") press("del");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="gate">
      <div className="gate-card">
        <img src="images/logo.webp" alt="" width="64" height="64" />
        <h1>{t("gateTitle")}</h1>
        <p className="muted">{state === "loading" ? t("loadingSettings") : t("pinText")}</p>

        <div className={`pin-dots${shake ? " shake" : ""}`} aria-label={t("pinText")} role="status">
          {[0, 1, 2, 3].map((i) => <span key={i} className={i < pin.length ? "on" : ""} />)}
        </div>

        <div className="pin-pad" dir="ltr">
          {KEYS.map((k, i) => (
            k === "" ? <span key={i} /> : (
              <button key={i} type="button" className={k === "del" ? "pin-key pin-key--del" : "pin-key"} disabled={busy || state !== "login"}
                aria-label={k === "del" ? t("pinDelete") : k} onClick={() => press(k)}>
                {k === "del" ? "⌫" : k}
              </button>
            )
          ))}
        </div>

        {message && <p className="msg error" role="alert">{message}</p>}

        <div className="gate-langs" role="group" aria-label="Language">
          {LANGS.map(([code, label]) => (
            <button key={code} type="button" className={lang === code ? "active" : ""} onClick={() => setLang(code)}>{label}</button>
          ))}
        </div>
        <a className="back" href="./">{t("backToSite")}</a>
      </div>
    </div>
  );
}
