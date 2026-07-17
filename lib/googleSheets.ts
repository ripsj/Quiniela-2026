import Papa from "papaparse";

const SHEETS_REVALIDATE_SECONDS = 60;
const SHEETS_CACHE_VERSION = "special-status-v2";

function getCacheVersionedUrl(url: string) {
  const separator = url.includes("?") ? "&" : "?";

  return `${url}${separator}quiniela_cache=${SHEETS_CACHE_VERSION}`;
}

export async function loadCsv<T>(
  url: string
): Promise<T[]> {
  const response = await fetch(
    getCacheVersionedUrl(url),
    {
    next: {
      revalidate: SHEETS_REVALIDATE_SECONDS,
      tags: ["google-sheets"],
    },
    }
  );

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
    const response = await fetch(
      getCacheVersionedUrl(url),
      {
      next: {
        revalidate: SHEETS_REVALIDATE_SECONDS,
        tags: ["google-sheets"],
      },
      }
    );

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
