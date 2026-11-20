// src/utils/metarApi.js
import axios from 'axios';

const NOAA_BASE = {
  metar: 'https://tgftp.nws.noaa.gov/data/observations/metar/stations',
  taf: 'https://tgftp.nws.noaa.gov/data/forecasts/taf/stations',
};

export const isIcaoCode = (code) => /^[A-Z0-9]{4}$/.test(code);

// NOAA files start with the UTC issue time: "2026/11/20 06:00".
export const parseNoaaTime = (line) => {
  const m = /^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2})/.exec((line || '').trim());
  if (!m) return null;
  return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
};

// "25 min", "3 h", "2 days" since `time`.
export const formatAge = (time, now = Date.now()) => {
  if (!time) return null;
  const min = Math.max(0, Math.round((now - time) / 60000));
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 48) return `${h} h ago`;
  return `${Math.round(h / 24)} days ago`;
};

// Break a TAF onto lines at its change groups so each period reads on its own.
export const tafLines = (taf) => {
  const parts = taf
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/ (?=(FM\d{6}|TEMPO|BECMG|PROB\d{2})\b)/g, '\n')
    .split('\n');
  // Keep "PROB30 TEMPO" together.
  const lines = [];
  parts.forEach((p) => {
    const prev = lines[lines.length - 1];
    if (prev && /^PROB\d{2}$/.test(prev)) lines[lines.length - 1] = `${prev} ${p}`;
    else lines.push(p);
  });
  return lines;
};

// METARs are routine every 30–60 min; older than 2 h is not a current report.
export const METAR_STALE_MS = 2 * 60 * 60 * 1000;
// TAFs are issued every 6 h; older than 12 h has been superseded.
export const TAF_STALE_MS = 12 * 60 * 60 * 1000;

export const getMetarTaf = async (airport) => {
  try {
    const airportCode = airport.toUpperCase().trim();
    if (!isIcaoCode(airportCode)) {
      return { success: false, error: 'Not a 4-character ICAO code.' };
    }

    let metarText = 'No METAR available';
    let tafText = 'No TAF available';
    let metarTime = null;
    let tafTime = null;

    try {
      const { data } = await axios.get(`${NOAA_BASE.metar}/${airportCode}.TXT`);
      const lines = data.split('\n');
      metarTime = parseNoaaTime(lines[0]);
      metarText = lines[1]?.trim() || 'No METAR available';
    } catch (e) {
      console.log('METAR fetch error:', e.message);
    }

    try {
      const { data } = await axios.get(`${NOAA_BASE.taf}/${airportCode}.TXT`);
      // TAF is multiple lines; first line is a timestamp
      const lines = data.split('\n');
      tafTime = parseNoaaTime(lines[0]);
      tafText = lines.slice(1).join(' ').trim() || 'No TAF available';
    } catch (e) {
      console.log('TAF fetch error:', e.message);
      tafText = 'TAF not available for this airport';
    }

    if (metarText !== 'No METAR available') {
      return { success: true, airport: airportCode, metar: metarText, taf: tafText, metarTime, tafTime };
    }

    return {
      success: false,
      error: 'Unable to fetch weather data. Airport may not be available or check your internet connection.',
    };
  } catch (error) {
    console.error('METAR/TAF API Error:', error);
    return {
      success: false,
      error: 'Unable to fetch weather data. Please check airport code and internet connection.',
    };
  }
};
