// Toppings and bases for the "Build your pizza / manakish" screen.
// Every added topping costs the "extra topping" price set in the admin panel.

export const TOPPINGS = {
  cheese: { name: { sv: "Ost", en: "Cheese", ar: "جبنة" }, pieces: 34 },
  olives: { name: { sv: "Oliver", en: "Olives", ar: "زيتون" }, pieces: 9 },
  mushroom: { name: { sv: "Svamp", en: "Mushroom", ar: "فطر" }, pieces: 8 },
  peppers: { name: { sv: "Paprika", en: "Peppers", ar: "فليفلة" }, pieces: 9 },
  onion: { name: { sv: "Rödlök", en: "Red onion", ar: "بصل" }, pieces: 8 },
  tomato: { name: { sv: "Tomat", en: "Tomato", ar: "بندورة" }, pieces: 7 },
  sujuk: { name: { sv: "Sujuk", en: "Sujuk", ar: "سجق" }, pieces: 8 },
  jalapeno: { name: { sv: "Jalapeño", en: "Jalapeño", ar: "هالبينو" }, pieces: 9 },
  labneh: { name: { sv: "Labneh", en: "Labneh", ar: "لبنة" }, pieces: 7 },
  cucumber: { name: { sv: "Gurka", en: "Cucumber", ar: "خيار" }, pieces: 7 },
  mint: { name: { sv: "Mynta", en: "Mint", ar: "نعنع" }, pieces: 9 }
};

const LISTS = {
  pizza: ["cheese", "olives", "mushroom", "peppers", "onion", "tomato", "sujuk", "jalapeno"],
  manakish: ["cheese", "labneh", "tomato", "cucumber", "olives", "mint", "onion", "sujuk"]
};

// Which dishes open the builder. Sweet manakish keeps the normal sheet.
export function builderKind(p) {
  if (!p || /nutella/.test(p.id)) return null;
  return LISTS[p.category] ? p.category : null;
}

export const toppingList = (kind) => LISTS[kind] || [];

// What the dish already has, drawn before the customer adds anything (free).
export function baseOf(p) {
  const id = p.id;
  if (p.category === "pizza") {
    const built = [];
    if (/sujuk/.test(id)) built.push("sujuk");
    if (/salami|roma/.test(id)) built.push("salami");
    if (/kyckling/.test(id)) built.push("chicken");
    if (/kebab/.test(id)) built.push("kebab", "onion");
    if (/vegetar/.test(id)) built.push("peppers", "mushroom", "olives");
    if (/margherita/.test(id)) built.push("basil");
    return { spread: "pizza", built };
  }
  let spread = "dough";
  const built = [];
  if (/zaatar/.test(id)) spread = "zaatar";
  if (/muhammara/.test(id)) spread = "muhammara";
  if (/kushik/.test(id)) spread = "kishk";
  if (/kott/.test(id)) spread = /ost/.test(id) ? "cheese" : "meat";
  if (/(^|-)ost/.test(id) && spread === "dough") spread = "cheese";
  if (/mix-ost-kott/.test(id)) built.push("meat");
  if (/mix-ost-zaatar/.test(id)) built.push("zaatarSpecks");
  if (/mix-muhammara/.test(id)) { spread = "muhammara"; built.push("cheeseMelt"); }
  if (/tomat/.test(id)) built.push("tomato");
  if (/sujuk/.test(id)) built.push("sujuk");
  if (/labneh/.test(id)) built.push("labneh");
  return { spread, built };
}

// Group a line's toppings (["cheese","cheese","olives"]) into readable text.
export function toppingSummary(toppings, loc) {
  const counts = {};
  (toppings || []).forEach((k) => { counts[k] = (counts[k] || 0) + 1; });
  return Object.keys(counts).map((k) => {
    const name = TOPPINGS[k] ? loc(TOPPINGS[k].name) : k;
    return counts[k] > 1 ? `${name} ×${counts[k]}` : name;
  });
}
