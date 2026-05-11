/**
 * calculator.ts
 * Core logic for Work Time Calculator Extension
 * Parses HH:mm time entries and calculates work day stats
 */

export interface ParseResult {
  validLines: string[];
  skippedCount: number;
}

export interface CalcResult {
  workDays: number;
  totalMinutes: number;
  requiredMinutes: number;
  diffMinutes: number;
  isOvertime: boolean;
}

/** Standard working hours per day (fixed at 8h) */
export const HOURS_PER_DAY = 8;

/**
 * Parse raw text input, extract valid HH:mm lines.
 * Skips: empty lines, 00:00, invalid formats.
 */
export function parseInput(text: string): ParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const validLines: string[] = [];
  let skippedCount = 0;

  for (const line of lines) {
    if (!/^\d{1,2}:\d{2}$/.test(line)) {
      skippedCount++;
      continue;
    }

    const [hStr, mStr] = line.split(":");
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);

    if (h < 0 || h > 23 || m < 0 || m > 59) {
      skippedCount++;
      continue;
    }

    // 00:00 → skip entirely
    if (h === 0 && m === 0) {
      skippedCount++;
      continue;
    }

    validLines.push(line);
  }

  return { validLines, skippedCount };
}

/**
 * Calculate work stats from valid HH:mm lines.
 */
export function calculate(lines: string[]): CalcResult {
  const workDays = lines.length;
  let totalMinutes = 0;

  for (const line of lines) {
    const [hStr, mStr] = line.split(":");
    totalMinutes += parseInt(hStr, 10) * 60 + parseInt(mStr, 10);
  }

  const requiredMinutes = workDays * HOURS_PER_DAY * 60;
  const diffMinutes = totalMinutes - requiredMinutes;
  const isOvertime = diffMinutes >= 0;

  return { workDays, totalMinutes, requiredMinutes, diffMinutes, isOvertime };
}

/**
 * Format total minutes into HH:mm string.
 */
export function formatMinutes(totalMinutes: number): string {
  const abs = Math.abs(totalMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const sign = totalMinutes < 0 ? "-" : "";
  return `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
