// Convierte periodos a meses de duración.
// Acepta:
// 1) Cadena: "Marzo 2020 - Marzo 2024", "2004 a la actualidad", etc.
// 2) Objeto: { start: "Marzo 2020", end: "Marzo 2024", current: false }
export type PeriodInput =
  | string
  | {
      start?: string | null;
      end?: string | null;
      current?: boolean | null;
    };

export function parsePeriodToMonths(period?: PeriodInput): number {
  const now = new Date();
  const monthMap: Record<string, number> = {
    // ES
    enero: 0,
    febrero: 1,
    marzo: 2,
    abril: 3,
    mayo: 4,
    junio: 5,
    julio: 6,
    agosto: 7,
    septiembre: 8,
    setiembre: 8,
    octubre: 9,
    noviembre: 10,
    diciembre: 11,
    // EN
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
    // Chino simplificado
    一月: 0,
    '1月': 0,
    二月: 1,
    '2月': 1,
    三月: 2,
    '3月': 2,
    四月: 3,
    '4月': 3,
    五月: 4,
    '5月': 4,
    六月: 5,
    '6月': 5,
    七月: 6,
    '7月': 6,
    八月: 7,
    '8月': 7,
    九月: 8,
    '9月': 8,
    十月: 9,
    '10月': 9,
    十一月: 10,
    '11月': 10,
    十二月: 11,
    '12月': 11,
  };

  const norm = (s: string): string =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  // ---- parse helpers ----
  function parseEnd(
    sRaw: string | undefined | null,
    isEnd: boolean,
  ): Date | null {
    const s = (sRaw ?? (isEnd ? 'actualidad' : '')).toString().trim();
    if (!s) return null;

    if (/\b(actual|actualidad|present)\b/.test(norm(s))) return now;

    // mes + año (e.g., "Marzo 2024", "march 2024")
    const m = s.match(/([a-z\u00f1]+)\s+(\d{4})/i);
    if (m) {
      const monthName = norm(m[1] ?? '');
      const yearStr = m[2] ?? '';
      const year = parseInt(yearStr, 10);
      const month = monthMap[monthName];
      if (Number.isInteger(year) && month !== undefined) {
        return new Date(year, month, 1);
      }
    }

    // solo año (e.g., "2020")
    const y = s.match(/(\d{4})/);
    if (y && y[1]) {
      const year = parseInt(y[1], 10);
      if (Number.isInteger(year)) {
        const month = isEnd ? 11 : 0; // fin -> diciembre; inicio -> enero
        return new Date(year, month, 1);
      }
    }

    return null;
  }

  // ---- normaliza entrada a startStr / endStrRaw ----
  let startStr: string | undefined;
  let endStrRaw: string | undefined;

  if (typeof period === 'string') {
    const clean = norm(period);
    // separadores: " - ", "–" o " a "
    const parts = clean.split(/\s*[-–]\s*|\s+a\s+/);
    startStr = parts[0] ?? '';
    endStrRaw = parts[1]; // puede venir vacío o no existir
  } else if (period && typeof period === 'object') {
    startStr = period.start ?? undefined;
    endStrRaw = period.current ? 'actualidad' : (period.end ?? undefined);
  } else {
    return 0;
  }

  const start = parseEnd(startStr, false);
  const end = parseEnd(endStrRaw, true);
  if (!start || !end) return 0;

  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) +
    1; // inclusivo

  if (months < 0) months = 0;
  return months;
}

/* Ejemplos:
parsePeriodToMonths("Marzo 2020 - Marzo 2024")            // -> 49
parsePeriodToMonths("2004 a la actualidad")               // -> desde 2004-01 a hoy
parsePeriodToMonths({ start: "Marzo 2020", end: "Marzo 2024", current: false }) // -> 49
parsePeriodToMonths({ start: "2019", current: true })     // -> desde 2019-01 a hoy
*/
