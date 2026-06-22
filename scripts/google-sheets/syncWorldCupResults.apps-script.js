/**
 * Google Apps Script for the Quiniela spreadsheet.
 *
 * Paste this file into Extensions > Apps Script in the Google Sheet.
 * Then set Script property FOOTBALL_DATA_API_TOKEN with a football-data.org token.
 */

const RESULT_SYNC_CONFIG = {
  SHEET_NAME: "partidos",
  API_TOKEN_PROPERTY: "FOOTBALL_DATA_API_TOKEN",
  COMPETITION_CODE: "WC",
  SEASON: "2026",
  DATE_FROM: "2026-06-11",
  DATE_TO: "2026-07-20",
  MATCH_DATE_TIME_ZONE: "Europe/Madrid",
  SYNC_IN_PLAY_SCORES: false,
  FINAL_STATUSES: ["FINISHED", "AWARDED"],
  LIVE_STATUSES: [
    "IN_PLAY",
    "PAUSED",
    "EXTRA_TIME",
    "PENALTY_SHOOTOUT",
  ],
  OPTIONAL_COLUMNS: {
    externalMatchId: "external_match_id",
    source: "fuente_resultado",
    updatedAt: "ultima_actualizacion_resultado",
  },
  TEAM_ALIASES: {
    "cabo verde": "cape verde islands",
    "cape verde": "cape verde islands",
    "corea del sur": "korea republic",
    "costa de marfil": "cote d ivoire",
    "cote divoire": "cote d ivoire",
    "estados unidos": "united states",
    "iran": "ir iran",
    "mexico": "mexico",
    "paises bajos": "Netherlands",
    "republica de corea": "korea republic",
    "turquia": "turkiye",
    "usa": "united states",
    "Japón": "Japan"
  },
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Quiniela")
    .addItem(
      "Sincronizar resultados",
      "syncWorldCupResultsFromInternet"
    )
    .addItem(
      "Previsualizar sincronizacion",
      "previewWorldCupResultSync"
    )
    .addItem(
      "Completar external_match_id",
      "populateWorldCupExternalMatchIds"
    )
    .addSeparator()
    .addItem(
      "Instalar trigger cada 15 min",
      "installWorldCupResultSyncTrigger"
    )
    .addToUi();
}

function syncWorldCupResultsFromInternet() {
  return syncWorldCupResults_({ dryRun: false });
}

function previewWorldCupResultSync() {
  return syncWorldCupResults_({ dryRun: true });
}

function populateWorldCupExternalMatchIds() {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
      RESULT_SYNC_CONFIG.SHEET_NAME
    );

  if (!sheet) {
    throw new Error(
      `Sheet not found: ${RESULT_SYNC_CONFIG.SHEET_NAME}`
    );
  }

  const values = sheet.getDataRange().getValues();
  const headers = values[0] || [];
  const columns = buildColumnMap_(headers);

  if (columns.external_match_id == null) {
    throw new Error(
      `Missing optional header: ${RESULT_SYNC_CONFIG.OPTIONAL_COLUMNS.externalMatchId}`
    );
  }

  const apiMatches = fetchWorldCupMatches_();
  const apiIndex = buildApiMatchIndex_(apiMatches);
  const changes = [];

  values.slice(1).forEach((row, rowOffset) => {
    const rowNumber = rowOffset + 2;

    if (row[columns.external_match_id]) {
      return;
    }

    const apiMatch = findApiMatchForRow_(
      row,
      columns,
      apiIndex
    );

    if (!apiMatch) {
      Logger.log(
        `No API match for row ${rowNumber}: ${row[columns.equipo_local]} vs ${row[columns.equipo_visitante]}`
      );
      return;
    }

    queueCellChange_(
      changes,
      rowNumber,
      columns.external_match_id,
      row[columns.external_match_id],
      apiMatch.id
    );
  });

  changes.forEach((change) => {
    sheet
      .getRange(change.row, change.column + 1)
      .setValue(change.next);
  });

  Logger.log(
    `external_match_id hydration completed. Applied changes: ${changes.length}`
  );

  return changes;
}

function installWorldCupResultSyncTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(
      (trigger) =>
        trigger.getHandlerFunction() ===
        "syncWorldCupResultsFromInternet"
    )
    .forEach((trigger) =>
      ScriptApp.deleteTrigger(trigger)
    );

  ScriptApp.newTrigger(
    "syncWorldCupResultsFromInternet"
  )
    .timeBased()
    .everyMinutes(15)
    .create();
}

function syncWorldCupResults_(options) {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
      RESULT_SYNC_CONFIG.SHEET_NAME
    );

  if (!sheet) {
    throw new Error(
      `Sheet not found: ${RESULT_SYNC_CONFIG.SHEET_NAME}`
    );
  }

  const values = sheet.getDataRange().getValues();
  const headers = values[0] || [];
  const columns = buildColumnMap_(headers);
  const apiMatches = fetchWorldCupMatches_();
  const apiIndex = buildApiMatchIndex_(apiMatches);
  const changes = [];

  values.slice(1).forEach((row, rowOffset) => {
    const rowNumber = rowOffset + 2;

    if (isTrue_(row[columns.finalizado])) {
      return;
    }

    const apiMatch = findApiMatchForRow_(
      row,
      columns,
      apiIndex
    );

    if (!apiMatch) {
      Logger.log(
        `No API match for row ${rowNumber}: ${row[columns.equipo_local]} vs ${row[columns.equipo_visitante]}`
      );
      return;
    }

    const score = getScoreForSync_(apiMatch);

    if (!score) {
      return;
    }

    queueCellChange_(
      changes,
      rowNumber,
      columns.goles_local,
      row[columns.goles_local],
      score.home
    );
    queueCellChange_(
      changes,
      rowNumber,
      columns.goles_visitante,
      row[columns.goles_visitante],
      score.away
    );

    if (score.final) {
      queueCellChange_(
        changes,
        rowNumber,
        columns.finalizado,
        row[columns.finalizado],
        "TRUE"
      );
    }

    if (
      columns.external_match_id != null &&
      !row[columns.external_match_id]
    ) {
      queueCellChange_(
        changes,
        rowNumber,
        columns.external_match_id,
        row[columns.external_match_id],
        apiMatch.id
      );
    }

    if (columns.fuente_resultado != null) {
      queueCellChange_(
        changes,
        rowNumber,
        columns.fuente_resultado,
        row[columns.fuente_resultado],
        "football-data.org"
      );
    }

    if (
      columns.ultima_actualizacion_resultado != null
    ) {
      queueCellChange_(
        changes,
        rowNumber,
        columns.ultima_actualizacion_resultado,
        row[
          columns.ultima_actualizacion_resultado
        ],
        new Date()
      );
    }
  });

  if (options.dryRun) {
    changes.forEach((change) =>
      Logger.log(
        `DRY RUN R${change.row}C${change.column + 1}: ${change.previous} -> ${change.next}`
      )
    );
    Logger.log(
      `Dry run completed. Pending changes: ${changes.length}`
    );
    return changes;
  }

  changes.forEach((change) => {
    sheet
      .getRange(change.row, change.column + 1)
      .setValue(change.next);
  });

  Logger.log(
    `Result sync completed. Applied changes: ${changes.length}`
  );

  return changes;
}

function fetchWorldCupMatches_() {
  const token =
    PropertiesService.getScriptProperties().getProperty(
      RESULT_SYNC_CONFIG.API_TOKEN_PROPERTY
    );

  if (!token) {
    throw new Error(
      `Missing Script property: ${RESULT_SYNC_CONFIG.API_TOKEN_PROPERTY}`
    );
  }

  const url =
    "https://api.football-data.org/v4/competitions/" +
    encodeURIComponent(
      RESULT_SYNC_CONFIG.COMPETITION_CODE
    ) +
    "/matches?season=" +
    encodeURIComponent(RESULT_SYNC_CONFIG.SEASON) +
    "&dateFrom=" +
    encodeURIComponent(RESULT_SYNC_CONFIG.DATE_FROM) +
    "&dateTo=" +
    encodeURIComponent(RESULT_SYNC_CONFIG.DATE_TO);

  const response = UrlFetchApp.fetch(url, {
    method: "get",
    headers: {
      "X-Auth-Token": token,
    },
    muteHttpExceptions: true,
  });
  const status = response.getResponseCode();
  const body = response.getContentText();

  if (status < 200 || status >= 300) {
    throw new Error(
      `football-data.org request failed (${status}): ${body}`
    );
  }

  const payload = JSON.parse(body);
  return payload.matches || [];
}

function buildColumnMap_(headers) {
  const normalized = {};

  headers.forEach((header, index) => {
    normalized[normalizeHeader_(header)] = index;
  });

  const required = [
    "id",
    "fecha",
    "equipo_local",
    "equipo_visitante",
    "goles_local",
    "goles_visitante",
    "finalizado",
  ];

  required.forEach((header) => {
    if (normalized[header] == null) {
      throw new Error(
        `Missing required header in partidos: ${header}`
      );
    }
  });

  return {
    id: normalized.id,
    fecha: normalized.fecha,
    equipo_local: normalized.equipo_local,
    equipo_visitante:
      normalized.equipo_visitante,
    goles_local: normalized.goles_local,
    goles_visitante:
      normalized.goles_visitante,
    finalizado: normalized.finalizado,
    external_match_id:
      normalized[
        RESULT_SYNC_CONFIG.OPTIONAL_COLUMNS
          .externalMatchId
      ],
    fuente_resultado:
      normalized[
        RESULT_SYNC_CONFIG.OPTIONAL_COLUMNS.source
      ],
    ultima_actualizacion_resultado:
      normalized[
        RESULT_SYNC_CONFIG.OPTIONAL_COLUMNS
          .updatedAt
      ],
  };
}

function buildApiMatchIndex_(matches) {
  const byExternalId = {};
  const byNaturalKey = {};

  matches.forEach((match) => {
    byExternalId[String(match.id)] = match;
    byNaturalKey[getApiMatchKey_(match)] = match;
  });

  return {
    byExternalId,
    byNaturalKey,
  };
}

function findApiMatchForRow_(
  row,
  columns,
  apiIndex
) {
  const externalMatchId =
    columns.external_match_id == null
      ? ""
      : row[columns.external_match_id];

  if (
    externalMatchId &&
    apiIndex.byExternalId[String(externalMatchId)]
  ) {
    return apiIndex.byExternalId[
      String(externalMatchId)
    ];
  }

  const key = [
    toSheetDateKey_(row[columns.fecha]),
    normalizeTeamName_(row[columns.equipo_local]),
    normalizeTeamName_(
      row[columns.equipo_visitante]
    ),
  ].join("|");

  return apiIndex.byNaturalKey[key] || null;
}

function getApiMatchKey_(match) {
  return [
    Utilities.formatDate(
      new Date(match.utcDate),
      RESULT_SYNC_CONFIG.MATCH_DATE_TIME_ZONE,
      "yyyy-MM-dd"
    ),
    normalizeTeamName_(match.homeTeam.name),
    normalizeTeamName_(match.awayTeam.name),
  ].join("|");
}

function getScoreForSync_(match) {
  const isFinal =
    RESULT_SYNC_CONFIG.FINAL_STATUSES.indexOf(
      match.status
    ) >= 0;
  const isLive =
    RESULT_SYNC_CONFIG.LIVE_STATUSES.indexOf(
      match.status
    ) >= 0;

  if (
    !isFinal &&
    !(
      RESULT_SYNC_CONFIG.SYNC_IN_PLAY_SCORES &&
      isLive
    )
  ) {
    return null;
  }

  const score =
    match.score && match.score.fullTime
      ? match.score.fullTime
      : null;

  if (
    score == null ||
    score.home == null ||
    score.away == null
  ) {
    return null;
  }

  return {
    home: score.home,
    away: score.away,
    final: isFinal,
  };
}

function queueCellChange_(
  changes,
  row,
  column,
  previous,
  next
) {
  if (column == null) {
    return;
  }

  if (String(previous) === String(next)) {
    return;
  }

  changes.push({
    row,
    column,
    previous,
    next,
  });
}

function normalizeHeader_(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeTeamName_(value) {
  const normalized = String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

  return (
    RESULT_SYNC_CONFIG.TEAM_ALIASES[
      normalized
    ] || normalized
  );
}

function toSheetDateKey_(value) {
  if (
    Object.prototype.toString.call(value) ===
    "[object Date]"
  ) {
    return Utilities.formatDate(
      value,
      RESULT_SYNC_CONFIG.MATCH_DATE_TIME_ZONE,
      "yyyy-MM-dd"
    );
  }

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

function isTrue_(value) {
  return String(value || "")
    .trim()
    .toUpperCase() === "TRUE";
}
