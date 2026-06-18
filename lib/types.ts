export interface Participant {
  id: number;
  nombre: string;
}

export interface Match {
  id: string;
  fecha?: string;
  equipo_local: string;
  equipo_visitante: string;
  goles_local: string;
  goles_visitante: string;
}

export interface Prediction {
  participante_id: string;
  partido_id: string;
  goles_local: string;
  goles_visitante: string;
}

export interface RankingEntry {
  participanteId: number;
  nombre: string;
  puntos: number;
  exactos: number;
  resultados: number;
}