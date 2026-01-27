// Wind Component Calculations
export const calculateWindComponent = (runway, windDirection, windSpeed) => {
  const runwayHeading = parseInt(runway) * 10;
  const windDir = parseInt(windDirection);
  const windSpd = parseInt(windSpeed);
  
  const angleDiff = windDir - runwayHeading;
  const angleRad = (angleDiff * Math.PI) / 180;
  
  const headwind = windSpd * Math.cos(angleRad);
  const crosswind = windSpd * Math.sin(angleRad);
  
  return {
    headwind: Math.round(headwind),
    crosswind: Math.round(Math.abs(crosswind)),
    isHeadwind: headwind >= 0,
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

// Rate of Climb/Descent Calculation
export const calculateRateOfClimbDescent = (gradient, groundSpeed) => {
  const ftPerNm = parseFloat(gradient);
  const gs = parseFloat(groundSpeed);
  
  // Rate = (ft/nm) * (nm/hour) / 60 = ft/min
  const rate = (ftPerNm * gs) / 60;
  
  return Math.round(rate);
};

// Wind Corrected Heading Calculation
export const calculateWindCorrectedHeading = (track, tas, windDirection, windSpeed) => {
  const trk = parseFloat(track);
  const airspeed = parseFloat(tas);
  const windDir = parseFloat(windDirection);
  const windSpd = parseFloat(windSpeed);
  
  // Convert wind direction and track to radians
  const trackRad = trk * Math.PI / 180;
  const windDirRad = windDir * Math.PI / 180;
  
  // Calculate the angle between wind direction and track
  const relativeWindAngle = (windDir - trk) * Math.PI / 180;
  
  // Drift angle = arcsin(wind speed * sin(relative wind angle) / TAS)
  const driftAngleRad = Math.asin((windSpd * Math.sin(relativeWindAngle)) / airspeed);
  const driftAngleDeg = driftAngleRad * 180 / Math.PI;
  
  // Changed from (trk - drift) to (trk + drift)
  let heading = trk + driftAngleDeg;
  
  // Normalize heading to 0-360 range
  if (heading < 0) heading += 360;
  if (heading >= 360) heading -= 360;
  
  // Calculate the ground speed
  // Headwind component = wind speed * cos(angle between wind and track)
  const headwindComponent = windSpd * Math.cos(relativeWindAngle);
  
  // Ground speed = TAS - headwind component (negative headwind = tailwind)
  const groundSpeed = airspeed - headwindComponent;
  
  return {
    heading: Math.round(heading),
    groundSpeed: Math.round(Math.abs(groundSpeed)),
    drift: Math.round(driftAngleDeg * 10) / 10,
  };
};