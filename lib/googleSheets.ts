import Papa from "papaparse";

const SHEETS_REVALIDATE_SECONDS = 60;

export async function loadCsv<T>(
  url: string
): Promise<T[]> {
  const response = await fetch(url, {
    next: {
      revalidate: SHEETS_REVALIDATE_SECONDS,
      tags: ["google-sheets"],
    },
  });

  const csv = await response.text();

  const parsed = Papa.parse<T>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data;
}

export async function loadOptionalCsv<T>(
  url: string
): Promise<T[]> {
  try {
    const response = await fetch(url, {
      next: {
        revalidate: SHEETS_REVALIDATE_SECONDS,
        tags: ["google-sheets"],
      },
    });

    if (!response.ok) {
      return [];
    }

    const csv = await response.text();
    const parsed = Papa.parse<T>(csv, {
      header: true,
      skipEmptyLines: true,
    });

    return parsed.data;
  } catch {
    return [];
  }
}
