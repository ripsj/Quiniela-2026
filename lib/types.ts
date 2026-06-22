export interface Participant {
  id: number;
  nombre: string;
}

export interface Match {
  id: string;
  fecha?: string;
  dia: string;
  hora?: string;
  grupo?: string;
  jornada?: string;
  ronda?: string;
  equipo_local: string;
  equipo_visitante: string;
  goles_local: string;
  goles_visitante: string;
  finalizado: string;
}

export interface Prediction {
  participante_id: string;
  participante?: string;
  partido_id: string;
  goles_local: string;
  goles_visitante: string;
}

export interface SpecialPrediction {
  participante_id: string;
  participante?: string;
  campeon?: string;
  subcampeon?: string;
  tercer_lugar?: string;
  fase_mexico?: string;
  mvp?: string;
  goleador?: string;
  [key: string]: string | undefined;
}

export interface Scorer {
  posicion?: string;
  jugador: string;
  equipo: string;
  goles: string;
  asistencias?: string;
  penales?: string;
  actualizado?: string;
}

export interface RankingEntry {
  participanteId: number;
  nombre: string;
  puntos: number;
  exactos: number;
  resultados: number;
  cambioPosicion?: number;
  forma?: string[];
}
