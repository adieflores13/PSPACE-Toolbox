// Wind Component Calculations
export const calculateWindComponent = (runway, windDirection, windSpeed) => {
  const runwayHeading = parseInt(runway) * 10;
  const windDir = parseInt(windDirection);
  const windSpd = parseInt(windSpeed);
  
  const angleDiff = windDir - runwayHeading;
  const angleRad = (angleDiff * Math.PI) / 180;
  
  const headwind = windSpd * Math.cos(angleRad);
  const crosswind = windSpd * Math.sin(angleRad);
  
  // Decide head/tail on the rounded value so a pure crosswind (cos 90° ≈ -1e-16)
  // reads "Headwind 0", not "Tailwind 0".
  const hw = Math.round(headwind) + 0; // +0 normalises -0
  return {
    headwind: hw,
    crosswind: Math.round(Math.abs(crosswind)),
    isHeadwind: hw >= 0,
  };
};

// Gradient Conversions
export const convertGradient = (value, fromUnit) => {
  let degrees, percent, ftPerNm;
  
  if (fromUnit === 'degrees') {
    degrees = parseFloat(value);
    percent = Math.tan(degrees * Math.PI / 180) * 100;
    ftPerNm = percent * 60.76;
  } else if (fromUnit === 'percent') {
    percent = parseFloat(value);
    degrees = Math.atan(percent / 100) * 180 / Math.PI;
    ftPerNm = percent * 60.76;
  } else if (fromUnit === 'ftPerNm') {
    ftPerNm = parseFloat(value);
    percent = ftPerNm / 60.76;
    degrees = Math.atan(percent / 100) * 180 / Math.PI;
  }
  
  return {
    degrees: degrees.toFixed(2),
    percent: percent.toFixed(2),
    ftPerNm: Math.round(ftPerNm).toString(),
  };
};

export const calculateRateOfClimbDescent = (gradient, groundSpeed) => {
  const ftPerNm = parseFloat(gradient);
  const gs = parseFloat(groundSpeed);
  
  // Rate = (ft/nm) * (nm/hour) / 60 = ft/min
  const rate = (ftPerNm * gs) / 60;
  
  return Math.round(rate);
};

// ---------- Altitudes & air speeds ----------

// ICAO Standard Atmosphere (troposphere), feet / hPa / °C / knots.
const P0 = 1013.25; // hPa
const T0 = 288.15; // K
const A0 = 661.4786; // speed of sound at sea level, kt
const LAPSE = 0.0019812; // K per ft
const H_FACTOR = 145442.16; // ft
const EXP = 0.190263; // R·L / g

const pressureRatio = (pressureAltitude) => Math.pow(1 - pressureAltitude / H_FACTOR, 1 / EXP);
const speedOfSound = (oat) => 38.967854 * Math.sqrt(oat + 273.15); // kt

// Pressure altitude: altimeter reading with QNH set, moved to the 1013.25 hPa datum
// using the standard atmosphere (≈27–30 ft per hPa near sea level).
export const calculatePressureAltitude = (indicatedAltitude, qnh) =>
  indicatedAltitude + H_FACTOR * (1 - Math.pow(qnh / P0, EXP));

export const isaTemperature = (pressureAltitude) => 15 - pressureAltitude * LAPSE;

// TAS from CAS with compressibility (subsonic): CAS → impact pressure → Mach → TAS.
export const calculateTAS = (cas, pressureAltitude, oat) => {
  const qc = P0 * (Math.pow(1 + 0.2 * Math.pow(cas / A0, 2), 3.5) - 1);
  const p = P0 * pressureRatio(pressureAltitude);
  const mach = Math.sqrt(5 * (Math.pow(qc / p + 1, 2 / 7) - 1));
  return mach * speedOfSound(oat);
};

export const calculateMach = (tas, oat) => tas / speedOfSound(oat);

export const calculateGroundSpeed = (tas, heading, windDir, windSpeed) => {
  const headingRad = (heading * Math.PI) / 180;
  const windTowardRad = (windDir * Math.PI) / 180 + Math.PI;
  const gsNorth = tas * Math.cos(headingRad) + windSpeed * Math.cos(windTowardRad);
  const gsEast = tas * Math.sin(headingRad) + windSpeed * Math.sin(windTowardRad);
  return Math.sqrt(gsNorth * gsNorth + gsEast * gsEast);
};

// oat / elevation may be null (ISA / 0).
export const calculateAltitudes = (indicated, qnh, oat, elevation) => {
  const pressure = calculatePressureAltitude(indicated, qnh);
  const isaTemp = isaTemperature(pressure);
  const oatValue = oat === null ? isaTemp : oat;
  const isaDeviation = oatValue - isaTemp;
  const elev = elevation === null ? 0 : elevation;

  // Density altitude from the actual density ratio (no 120 ft/°C shortcut).
  const sigma = (pressureRatio(pressure) * T0) / (oatValue + 273.15);
  const density = H_FACTOR * (1 - Math.pow(sigma, 0.234969));

  // True altitude: ICAO temperature correction applied to the height of the
  // altimeter reading (QNH set) above the field.
  const trueAltitude = indicated + ((indicated - elev) * isaDeviation) / (273.15 + isaTemperature(indicated));

  return {
    pressure,
    density,
    trueAltitude,
    heightAGL: indicated - elev,
    isaTemp,
    isaDeviation,
  };
};

export const calculateWindCorrectedHeading =(track, tas, windDirection, windSpeed) => {
  const trk = parseFloat(track);
  const airspeed = parseFloat(tas);
  const windDir = parseFloat(windDirection);
  const windSpd = parseFloat(windSpeed);
  
  const relativeWindAngle = (windDir - trk) * Math.PI / 180;
  
  // Drift angle = arcsin(wind speed * sin(relative wind angle) / TAS)
  const driftAngleRad = Math.asin((windSpd * Math.sin(relativeWindAngle)) / airspeed);
  const driftAngleDeg = driftAngleRad * 180 / Math.PI;
  
  let heading = trk + driftAngleDeg;
  
  // Normalize heading to 0-360 range
  if (heading < 0) heading += 360;
  if (heading >= 360) heading -= 360;
  
  // Ground speed = TAS along the track (TAS × cos WCA) minus the headwind
  // component (negative headwind = tailwind). Crabbed into the wind, only
  // TAS × cos(WCA) of the airspeed points down the track.
  const headwindComponent = windSpd * Math.cos(relativeWindAngle);
  const groundSpeed = airspeed * Math.cos(driftAngleRad) - headwindComponent;

  return {
    heading: Math.round(heading),
    groundSpeed: Math.round(groundSpeed),
    drift: Math.round(driftAngleDeg * 10) / 10,
  };
};