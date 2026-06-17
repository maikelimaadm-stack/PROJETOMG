const MONTH_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export { MONTH_SHORT };

export function parseBrDate(value) {
  const parts = String(value || "").split("/");
  if (parts.length === 3 && parts[2].length === 4) {
    return { day: parseInt(parts[0], 10), month: parseInt(parts[1], 10) - 1, year: parseInt(parts[2], 10) };
  }
  const iso = String(value || "").split("T")[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [year, month, day] = iso.split("-").map(Number);
    return { day, month: month - 1, year };
  }
  const now = new Date();
  return { day: now.getDate(), month: now.getMonth(), year: now.getFullYear() };
}

export function formatBrDate(day, month, year) {
  return `${String(day).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}/${year}`;
}

export function brDateToTimestamp(value) {
  if (!value) return null;
  const { day, month, year } = parseBrDate(value);
  return new Date(year, month, day).getTime();
}

export function formatBrDateRangeDisplay(from, to) {
  if (from && to) return `${from} → ${to}`;
  if (from) return `${from} → ...`;
  return "";
}

export function buildDayCells(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevLast = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = 0; i < 42; i += 1) {
    const dayNum = i - firstDay + 1;
    if (dayNum < 1) {
      cells.push({ key: `p-${year}-${month}-${i}`, day: prevLast + dayNum, type: "other" });
    } else if (dayNum > daysInMonth) {
      cells.push({ key: `n-${year}-${month}-${i}`, day: dayNum - daysInMonth, type: "other" });
    } else {
      cells.push({ key: `d-${year}-${month}-${dayNum}`, day: dayNum, type: "current" });
    }
  }

  return cells;
}

export function addMonths(year, month, delta) {
  let nextMonth = month + delta;
  let nextYear = year;
  while (nextMonth > 11) {
    nextMonth -= 12;
    nextYear += 1;
  }
  while (nextMonth < 0) {
    nextMonth += 12;
    nextYear -= 1;
  }
  return { year: nextYear, month: nextMonth };
}

export function getDayRangeClasses(year, month, day, startValue, endValue) {
  const startTs = brDateToTimestamp(startValue);
  if (startTs == null) return "";

  const dayTs = new Date(year, month, day).getTime();
  const endTs = brDateToTimestamp(endValue);

  if (endTs == null) {
    return dayTs === startTs ? " selected" : "";
  }

  const min = Math.min(startTs, endTs);
  const max = Math.max(startTs, endTs);

  if (dayTs === min) return " selected range-start";
  if (dayTs === max) return " selected range-end";
  if (dayTs > min && dayTs < max) return " in-range";
  return "";
}
