export interface SpecialAliasMatch {
  canonical: string;
  normalized: string;
  wasAliased: boolean;
}

const SPECIAL_ALIAS_GROUPS: Record<
  string,
  string[]
> = {
  "Fase de grupos": [
    "fase grupos",
    "fase de grupos",
    "grupos",
    "primera ronda",
  ],
  "Dieciseisavos de final": [
    "16avos",
    "dieciseisavos",
    "dieciseisavos de final",
  ],
  "Octavos de final": [
    "8vos",
    "octavos",
    "octavos de final",
  ],
  "Cuartos de final": [
    "4tos",
    "cuartos",
    "cuartos de final",
  ],
  Semifinales: [
    "semifinal",
    "semifinales",
    "semis",
  ],
  Final: [
    "final",
    "campeon",
    "campeón",
  ],
  Argentina: [
    "arg",
    "argentina",
    "seleccion argentina",
    "selección argentina",
  ],
  Brasil: [
    "bra",
    "brasil",
    "brazil",
    "seleccion de brasil",
    "selección de brasil",
  ],
  "Estados Unidos": [
    "estados unidos",
    "usa",
    "us",
    "united states",
    "united states of america",
  ],
  México: [
    "mex",
    "mexico",
    "méxico",
    "seleccion mexicana",
    "selección mexicana",
  ],
  Inglaterra: [
    "eng",
    "england",
    "ing",
    "inglaterra",
  ],
  Francia: [
    "fra",
    "francia",
    "france",
  ],
  Alemania: [
    "ale",
    "alemania",
    "germany",
  ],
  España: [
    "esp",
    "espana",
    "españa",
    "spain",
  ],
  Portugal: [
    "por",
    "portugal",
  ],
  Italia: [
    "ita",
    "italia",
    "italy",
  ],
  "Países Bajos": [
    "holanda",
    "netherlands",
    "paises bajos",
    "países bajos",
  ],
  "Cristiano Ronaldo": [
    "cr7",
    "cristiano",
    "cristiano ronaldo",
    "ronaldo",
  ],
  "Lionel Messi": [
    "leo messi",
    "lionel messi",
    "messi",
  ],
  Neymar: [
    "neymar",
    "neymar jr",
    "neymar junior",
  ],
  "Kylian Mbappé": [
    "kylian mbappe",
    "kylian mbappé",
    "mbape",
    "mbappe",
    "mbappé",
  ],
  "Erling Haaland": [
    "erling haaland",
    "haaland",
    "halland",
  ],
  "Harry Kane": [
    "harry kane",
    "kane",
  ],
  "Jude Bellingham": [
    "bellingham",
    "jude",
    "jude bellingham",
  ],
  "Lamine Yamal": [
    "lamine",
    "lamine yamal",
    "yamal",
  ],
  Rodri: [
    "rodri",
    "rodrigo hernandez",
    "rodrigo hernández",
  ],
  "Kevin De Bruyne": [
    "de bruyne",
    "kdb",
    "kevin de bruyne",
  ],
  "Jamal Musiala": [
    "jamal musiala",
    "musiala",
  ],
  Pedri: [
    "pedri",
    "pedro gonzalez",
    "pedro gonzález",
  ],
  "Vinícius Jr.": [
    "vini",
    "vini jr",
    "vinicius",
    "vinicius jr",
    "vinícius",
    "vinícius jr",
  ],
  "Julián Álvarez": [
    "julian alvarez",
    "julián alvarez",
    "julián álvarez",
  ],
  "Lautaro Martínez": [
    "lautaro",
    "lautaro martinez",
    "lautaro martínez",
  ],
  "Mohamed Salah": [
    "mo salah",
    "mohamed salah",
    "salah",
  ],
  "Bukayo Saka": [
    "bukayo saka",
    "saka",
  ],
  "Phil Foden": [
    "foden",
    "phil foden",
  ],
};

const aliasIndex = buildAliasIndex();

export function normalizeSpecialText(
  value: string
) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function resolveSpecialAlias(
  value: string
): SpecialAliasMatch {
  const normalized =
    normalizeSpecialText(value);
  const canonical =
    aliasIndex.get(normalized) ??
    value.trim();

  return {
    canonical,
    normalized,
    wasAliased:
      normalizeSpecialText(canonical) !==
      normalized,
  };
}

function buildAliasIndex() {
  const index =
    new Map<string, string>();

  Object.entries(SPECIAL_ALIAS_GROUPS).forEach(
    ([canonical, aliases]) => {
      index.set(
        normalizeSpecialText(canonical),
        canonical
      );

      aliases.forEach((alias) => {
        index.set(
          normalizeSpecialText(alias),
          canonical
        );
      });
    }
  );

  return index;
}
