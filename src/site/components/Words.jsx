// Splits a heading into masked words for the scroll reveal (rendered by React, so it survives re-renders).
export default function Words({ text }) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  return words.map((w, i) => (
    <span key={`${i}-${w}`}>
      <span className="w"><span className="w__in" style={{ "--i": i }}>{w}</span></span>
      {i < words.length - 1 ? " " : ""}
    </span>
  ));
}
