export function isValidIanaTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

function getTimeZoneOffsetMs(timezone: string, date: Date): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';

  const asUtc = Date.UTC(
    Number(getPart('year')),
    Number(getPart('month')) - 1,
    Number(getPart('day')),
    Number(getPart('hour')),
    Number(getPart('minute')),
    Number(getPart('second'))
  );

  return asUtc - date.getTime();
}

export function convertLocalTimeToUtc(localTime: string, timezone: string, referenceDate = new Date()): string {
  const [hh, mm] = localTime.split(':').map(Number);
  if (!Number.isInteger(hh) || !Number.isInteger(mm)) {
    throw new Error(`Invalid local time: ${localTime}`);
  }

  const localDateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const localDateParts = localDateFormatter.formatToParts(referenceDate);
  const getDatePart = (type: string) => localDateParts.find((p) => p.type === type)?.value ?? '00';

  // Start from local date + local time interpreted as UTC, then offset-adjust into actual UTC.
  let utcGuessMs = Date.UTC(
    Number(getDatePart('year')),
    Number(getDatePart('month')) - 1,
    Number(getDatePart('day')),
    hh,
    mm,
    0
  );

  // Iterate twice to stabilize around DST boundaries.
  for (let i = 0; i < 2; i++) {
    const offset = getTimeZoneOffsetMs(timezone, new Date(utcGuessMs));
    utcGuessMs = Date.UTC(
      Number(getDatePart('year')),
      Number(getDatePart('month')) - 1,
      Number(getDatePart('day')),
      hh,
      mm,
      0
    ) - offset;
  }

  return new Date(utcGuessMs).toISOString().slice(11, 16);
}
