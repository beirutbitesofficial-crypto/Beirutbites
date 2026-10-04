import { TIMEZONE } from "../config.js";

const DOWS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

// Current time in Malmö, whatever the visitor's own time zone is.
export function nowInMalmo() {
  const p = {};
  new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(new Date()).forEach((x) => { p[x.type] = x.value; });
  return { dow: DOWS[p.weekday], minutes: +p.hour * 60 + +p.minute, date: `${p.year}-${p.month}-${p.day}` };
}

export function toMin(hhmm) {
  const m = String(hhmm || "").match(/^(\d{1,2}):(\d{2})$/);
  return m ? +m[1] * 60 + +m[2] : null;
}

export function fmtMin(min) {
  const v = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(v / 60), m = v % 60;
  return `${h < 10 ? "0" : ""}${h}:${m < 10 ? "0" : ""}${m}`;
}

export function dayHours(settings, dow) {
  const h = settings.hours && settings.hours[dow];
  if (!h || h.closed || !h.open || !h.close) return null;
  const open = toMin(h.open);
  let close = toMin(h.close);
  if (open == null || close == null) return null;
  if (close <= open) close += 1440; // closes after midnight
  return { open, close };
}

// "Closed today" set in the admin panel only applies to the day it was set,
// so the truck opens again automatically the next day.
export function isClosedToday(settings, now = nowInMalmo()) {
  if (settings.truckOpen !== false) return false;
  return !settings.closedDate || settings.closedDate === now.date;
}

export function getStatus(settings) {
  const now = nowInMalmo();
  const closedToday = isClosedToday(settings, now);
  const y = dayHours(settings, (now.dow + 6) % 7);
  if (!closedToday && y && y.close > 1440 && now.minutes < y.close - 1440) {
    return { open: true, closesAt: y.close - 1440, now, minutesLeft: y.close - 1440 - now.minutes };
  }
  const h = dayHours(settings, now.dow);
  if (!closedToday && h && now.minutes >= h.open && now.minutes < h.close) {
    return { open: true, closesAt: h.close, now, minutesLeft: h.close - now.minutes };
  }
  for (let i = 0; i < 8; i++) {
    const dow = (now.dow + i) % 7;
    if (i === 0 && closedToday) continue;
    const dh = dayHours(settings, dow);
    if (!dh) continue;
    if (i === 0 && now.minutes >= dh.open) continue;
    return { open: false, closedToday, now, next: { offset: i, dow, open: dh.open, close: dh.close } };
  }
  return { open: false, closedToday, now, next: null };
}

export function dayLabel(t, offset, dow) {
  if (offset === 0) return t("today");
  if (offset === 1) return t("tomorrow");
  return t("days")[dow].toLowerCase();
}

export function pickupSlots(settings, status, t) {
  const slots = [];
  const prep = settings.prepTime || "10–15";
  const prepMax = parseInt(String(prep).split(/[^0-9]/).filter(Boolean).pop(), 10) || 15;
  if (status.open) {
    slots.push({ value: "asap", label: t("asap", { prep }) });
    const start = Math.ceil((status.now.minutes + prepMax + 5) / 15) * 15;
    for (let m = start; m <= status.closesAt - 10 && slots.length < 40; m += 15) {
      slots.push({ value: fmtMin(m), label: `${t("today")} ${fmtMin(m)}` });
    }
  } else if (status.next) {
    const n = status.next;
    const first = Math.ceil((n.open + 15) / 15) * 15;
    for (let x = first; x <= n.close - 10 && slots.length < 40; x += 15) {
      const label = `${dayLabel(t, n.offset, n.dow)} ${fmtMin(x)}`;
      slots.push({ value: label, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
  }
  return slots;
}
