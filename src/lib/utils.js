export const clone = (o) => JSON.parse(JSON.stringify(o));

export function storage(key, value) {
  try {
    if (value === undefined) return window.localStorage.getItem(key);
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    return null;
  }
  return null;
}

export function fill(str, vars) {
  if (!vars || typeof str !== "string") return str;
  return Object.keys(vars).reduce((s, k) => s.split(`{${k}}`).join(vars[k]), str);
}

export const kr = (n) => `${Math.round(n)} kr`;

export function tsMillis(ts) {
  if (!ts) return Date.now();
  if (typeof ts.toMillis === "function") return ts.toMillis();
  return new Date(ts).getTime() || 0;
}
