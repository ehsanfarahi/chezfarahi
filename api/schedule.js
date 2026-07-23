import { getBusinessData } from "./redis.js";

const JS_DAY = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];

function pad(n) { return String(n).padStart(2, "0"); }

function dateStr(d) {
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

function isOpenNow(hour, now) {
  if (!hour || hour.closed) return false;
  const [oh, om] = (hour.open  || "00:00").split(":").map(Number);
  const [ch, cm] = (hour.close || "23:59").split(":").map(Number);
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= oh * 60 + om && cur < ch * 60 + cm;
}

function getHourForDay(dayName, hours) {
  return (hours || []).find((h) => h.day === dayName) || null;
}

function getLocation(locationId, locations) {
  if (!locationId) return null;
  return (locations || []).find((l) => l.id === locationId) || null;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const data = await getBusinessData();
    const { hours = [], locations = [], scheduleWeeks = 2 } = data;

    const now       = new Date();
    const todayName = JS_DAY[now.getDay()];
    const todayHour = getHourForDay(todayName, hours);
    const openNow   = isOpenNow(todayHour, now);
    const todayLoc  = openNow ? getLocation(todayHour?.locationId, locations) : null;

    // Find next opening — look ahead up to 14 days
    let nextOpening = null;
    for (let i = 1; i <= 14; i++) {
      const d    = new Date(now);
      d.setDate(d.getDate() + i);
      const name = JS_DAY[d.getDay()];
      const h    = getHourForDay(name, hours);
      if (h && !h.closed && h.open) {
        nextOpening = {
          day:       name,
          date:      dateStr(d),
          dateLabel: d.toLocaleDateString("fr-FR", {
            weekday: "long", day: "numeric", month: "long",
          }),
          open:      h.open,
          close:     h.close,
          location:  getLocation(h.locationId, locations),
        };
        break;
      }
    }

    // Build full schedule for next N weeks
    const totalDays = (scheduleWeeks || 2) * 7;
    const schedule  = [];
    for (let i = 0; i < totalDays; i++) {
      const d    = new Date(now);
      d.setDate(d.getDate() + i);
      const name = JS_DAY[d.getDay()];
      const h    = getHourForDay(name, hours);
      schedule.push({
        date:      dateStr(d),
        day:       name,
        dayLabel:  d.toLocaleDateString("fr-FR", { weekday: "long" }),
        dateLabel: d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" }),
        isToday:   i === 0,
        closed:    !h || h.closed,
        open:      h?.open  || null,
        close:     h?.close || null,
        location:  getLocation(h?.locationId, locations),
      });
    }

    res.status(200).json({
      status:        openNow ? "open" : "closed",
      todayHours:    todayHour || null,
      todayLocation: todayLoc,
      nextOpening,
      schedule,
      scheduleWeeks,
    });
  } catch (err) {
    console.error("Schedule error:", err);
    res.status(500).json({ error: "Could not compute schedule" });
  }
}