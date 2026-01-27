// src/utils/metarApi.js
import axios from 'axios';

export const getMetarTaf = async (airport) => {
  try {
    const airportCode = airport.toUpperCase().trim();
    
    let metarText = 'No METAR available';
    let tafText = 'No TAF available';
    
    // Try to get METAR from NOAA
    try {
      const metarUrl = `https://tgftp.nws.noaa.gov/data/observations/metar/stations/${airportCode}.TXT`;
      const metarResponse = await axios.get(metarUrl);
      const lines = metarResponse.data.split('\n');
      metarText = lines[1]?.trim() || 'No METAR available';
    } catch (metarError) {
      console.log('METAR fetch error:', metarError.message);
    }
    
    // Try to get TAF from NOAA
    try {
      const tafUrl = `https://tgftp.nws.noaa.gov/data/forecasts/taf/stations/${airportCode}.TXT`;
      const tafResponse = await axios.get(tafUrl);
      const tafLines = tafResponse.data.split('\n');
      // TAF is usually multiple lines, skip the timestamp line
      tafText = tafLines.slice(1).join(' ').trim() || 'No TAF available';
    } catch (tafError) {
      console.log('TAF fetch error:', tafError.message);
      tafText = 'TAF not available for this airport';
    }
    
    // If we got at least METAR, consider it success
    if (metarText !== 'No METAR available') {
      return {
        success: true,
        airport: airportCode,
        metar: metarText,
        taf: tafText,
      };
    } else {
      return {
        success: false,
        error: 'Unable to fetch weather data. Airport may not be available or check your internet connection.',
      };
    }
  } catch (error) {
    console.error('METAR/TAF API Error:', error);
    return {
      success: false,
      error: 'Unable to fetch weather data. Please check airport code and internet connection.',
    };
  }
};