import { useState } from "react";
import { IMAGES, resolveImage } from "../../data/menu.js";
import { useAdmin } from "../context.js";
import { IconClose } from "../icons.jsx";

export default function ImagePicker({ value, onClose, onPick }) {
  const { t } = useAdmin();
  const current = resolveImage(value);
  const isLibrary = IMAGES.some((f) => `images/${f}` === current);
  const [selected, setSelected] = useState(current);
  const [url, setUrl] = useState(value && !isLibrary ? value : "");

  return (
    <div className="modal">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="sheet wide" role="dialog" aria-modal="true" aria-labelledby="picker-title">
        <div className="sheet-head">
          <h2 id="picker-title">{t("pickImage")}</h2>
          <button className="icon-btn" type="button" aria-label={t("cancel")} onClick={onClose}><IconClose /></button>
        </div>
        <div className="sheet-body">
          <div className="picker-grid">
            {IMAGES.map((f) => {
              const path = `images/${f}`;
              return (
                <button key={f} type="button" aria-pressed={selected === path && !url} onClick={() => { setSelected(path); setUrl(""); }}>
                  <img src={path} alt="" loading="lazy" />
                  <span>{f.replace(".webp", "")}</span>
                </button>
              );
            })}
          </div>
          <label className="field"><span>{t("imageUrl")}</span><input type="url" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} /></label>
          <p className="muted small">{t("imageUploadHint")}</p>
        </div>
        <div className="sheet-foot">
          <span className="grow" />
          <button type="button" className="btn btn-ghost" onClick={onClose}>{t("cancel")}</button>
          <button type="button" className="btn btn-primary" onClick={() => onPick(url.trim() || selected)}>{t("useImage")}</button>
        </div>
      </div>
    </div>
  );
}
