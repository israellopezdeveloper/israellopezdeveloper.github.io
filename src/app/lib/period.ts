// src/lib/period.ts
// Convierte "Marzo 2020 - Marzo 2024", "2004 a la actualidad", etc. → meses de duración
// Soporta meses en español e inglés y rangos con "-", "–" o "a".
export function parsePeriodToMonths(period?: string): number {
  if (!period || !period.trim()) return 0;

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
  };

  const norm = (s: string): string =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const clean = norm(period);

  // separadores: " - ", "–", " a "
  const parts = clean.split(/\s*[-–]\s*|\s+a\s+/);
  const startStr = parts[0] ?? '';
  const endStrRaw: string | undefined = parts[1]; // puede venir vacío

  // helper: parse endpoint "mes año" | "año" | "actualidad/present"
  function parseEnd(sRaw: string | undefined, isEnd: boolean): Date | null {
    const s = (sRaw ?? (isEnd ? 'actualidad' : '')).trim();
    if (!s) return null;

    if (/actual|present/.test(s)) return now;

    // mes + año
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

    // solo año
    const y = s.match(/(\d{4})/);
    if (y && y[1]) {
      const year = parseInt(y[1], 10);
      if (Number.isInteger(year)) {
        const month = isEnd ? 11 : 0;
        return new Date(year, month, 1);
      }
    }

    return null;
  }

  const start = parseEnd(startStr, false);
  const end = parseEnd(endStrRaw, true);

  if (!start || !end) return 0;

  let months =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;

  if (months < 0) months = 0;
  return months;
}
