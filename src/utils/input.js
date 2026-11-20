// Parse wind written the way pilots write it: "240/18" (also tolerates spaces).
export function parseWind(text) {
  const s = (text || '').replace(/\s+/g, '');
  if (!s) return { ok: false };
  if (!s.includes('/')) {
    // Still typing the direction.
    if (/^\d{1,3}$/.test(s)) return { ok: false };
    return { ok: false, error: 'Wind format: 240/18' };
  }
  const [dir, speed] = s.split('/');
  if (!/^\d{1,3}$/.test(dir) || parseInt(dir, 10) > 360) {
    return { ok: false, error: 'Wind direction 000–360' };
  }
  if (speed === '') return { ok: false };
  if (!/^\d{1,3}$/.test(speed)) {
    return { ok: false, error: 'Wind speed in whole knots' };
  }
  return { ok: true, dir, speed };
}

// A finite number from a text field, or null.
export function num(text) {
  if (text === undefined || text === null) return null;
  const s = String(text).trim().replace(',', '.');
  if (s === '' || s === '-' || s === '.' || s === '-.') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function fmtInt(n) {
  return Math.round(n).toLocaleString('en-US');
}

export function pad3(n) {
  return String(Math.round(n)).padStart(3, '0');
}
