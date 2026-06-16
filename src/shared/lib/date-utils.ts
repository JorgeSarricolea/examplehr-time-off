function parseDate(dateStr: string): Date | null {
  const d = new Date(`${dateStr}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

export function isWeekendIso(dateStr: string): boolean {
  const d = parseDate(dateStr);
  return d ? isWeekend(d) : false;
}

/** Next calendar day that is Mon–Fri, on or after the given ISO date. */
export function nextOrSameBusinessDayIso(dateStr: string): string {
  const d = parseDate(dateStr);
  if (!d) return dateStr;
  const current = new Date(d);
  while (isWeekend(current)) {
    current.setDate(current.getDate() + 1);
  }
  return formatDate(current);
}

/** Inclusive business days (Mon–Fri) between two YYYY-MM-DD dates. Weekends are excluded. */
export function countBusinessDays(startDate: string, endDate: string): number | null {
  if (!startDate || !endDate) return null;

  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (!start || !end || end < start) return null;

  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    if (!isWeekend(current)) count += 1;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

/** @deprecated Use countBusinessDays */
export const countInclusiveDays = countBusinessDays;

export function todayIso(): string {
  return formatDate(new Date());
}

/**
 * Latest end date (inclusive) so that business days from start to end equal availableDays.
 */
export function maxEndDateForStart(startDate: string, availableDays: number): string {
  if (availableDays < 1) return startDate;
  const start = parseDate(startDate);
  if (!start) return startDate;

  const current = new Date(start);
  let counted = 0;
  while (counted < availableDays) {
    if (!isWeekend(current)) counted += 1;
    if (counted < availableDays) current.setDate(current.getDate() + 1);
  }
  return formatDate(current);
}

/**
 * Earliest start date (inclusive) so that business days from start to end equal availableDays.
 */
export function minStartDateForEnd(endDate: string, availableDays: number): string {
  if (availableDays < 1) return endDate;
  const end = parseDate(endDate);
  if (!end) return endDate;

  const current = new Date(end);
  let counted = 0;
  while (counted < availableDays) {
    if (!isWeekend(current)) counted += 1;
    if (counted < availableDays) current.setDate(current.getDate() - 1);
  }
  return formatDate(current);
}

export function clampEndDate(
  startDate: string,
  endDate: string,
  availableDays: number,
): string {
  const min = startDate;
  const max = maxEndDateForStart(startDate, availableDays);
  if (endDate < min) return min;
  if (endDate > max) return max;
  return endDate;
}

export function clampStartDate(
  startDate: string,
  endDate: string,
  availableDays: number,
  earliestAllowed: string,
): string {
  const minFromBalance = endDate ? minStartDateForEnd(endDate, availableDays) : earliestAllowed;
  const min = minFromBalance > earliestAllowed ? minFromBalance : earliestAllowed;
  const max = endDate || undefined;
  if (startDate < min) return min;
  if (max && startDate > max) return max;
  return startDate;
}
