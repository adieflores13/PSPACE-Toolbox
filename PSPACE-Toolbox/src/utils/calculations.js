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
    ftPerNm = percent * 60.76; // 1 nm = 6076 ft
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
    ftPerNm: ftPerNm.toFixed(0),
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
  
  // Convert to radians
  const trackRad = trk * Math.PI / 180;
  const windDirRad = windDir * Math.PI / 180;
  
  // Wind components
  const windNorth = windSpd * Math.cos(windDirRad);
  const windEast = windSpd * Math.sin(windDirRad);
  
  // Calculate heading and ground speed using vector math
  const drift = Math.asin((windSpd * Math.sin((windDir - trk) * Math.PI / 180)) / airspeed);
  const heading = trk - (drift * 180 / Math.PI);
  
  // Ground speed calculation
  const headwindComponent = windSpd * Math.cos((windDir - trk) * Math.PI / 180);
  const groundSpeed = Math.sqrt(Math.pow(airspeed, 2) - Math.pow(windSpd * Math.sin((windDir - trk) * Math.PI / 180), 2)) - headwindComponent;
  
  return {
    heading: Math.round(heading < 0 ? heading + 360 : heading),
    groundSpeed: Math.round(Math.abs(groundSpeed)),
  };
};