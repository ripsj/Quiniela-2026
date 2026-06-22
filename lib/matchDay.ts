import {
  MatchPredictionsRow,
} from "./matchPredictions";

export const MATCH_DAY_TIME_ZONE =
  "Europe/Madrid";

export function getTodayDateKey(
  date = new Date(),
  timeZone = MATCH_DAY_TIME_ZONE
) {
  const parts =
    new Intl.DateTimeFormat("en", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);

  const year =
    parts.find(
      (part) => part.type === "year"
    )?.value ?? "";
  const month =
    parts.find(
      (part) => part.type === "month"
    )?.value ?? "";
  const day =
    parts.find(
      (part) => part.type === "day"
    )?.value ?? "";

  return `${year}-${month}-${day}`;
}

export function getSheetDateKey(
  value: string | null | undefined
) {
  const text = String(value || "").trim();

  const isoMatch = text.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  const slashMatch = text.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})/
  );

  if (slashMatch) {
    return [
      slashMatch[3],
      slashMatch[2].padStart(2, "0"),
      slashMatch[1].padStart(2, "0"),
    ].join("-");
  }

  return text;
}

export function filterMatchPredictionsByDate(
  rows: MatchPredictionsRow[],
  dateKey: string
) {
  return rows.filter((row) => {
    const matchDate =
      row.match.fecha || row.match.dia;

    return (
      getSheetDateKey(matchDate) === dateKey
    );
  });
}

export function formatDateKeyForDisplay(
  dateKey: string,
  locale = "es-MX"
) {
  const [year, month, day] =
    dateKey.split("-").map(Number);

  if (!year || !month || !day) {
    return dateKey;
  }

  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(
    new Date(
      Date.UTC(year, month - 1, day)
    )
  );
}
