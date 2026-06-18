import Papa from "papaparse";

export async function loadCsv<T>(
  url: string
): Promise<T[]> {
  const response = await fetch(url, {
    cache: "no-store",
  });

  const csv = await response.text();

  const parsed = Papa.parse<T>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data;
}