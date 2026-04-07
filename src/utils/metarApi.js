// src/utils/metarApi.js
import axios from 'axios';

const NOAA_BASE = {
  metar: 'https://tgftp.nws.noaa.gov/data/observations/metar/stations',
  taf: 'https://tgftp.nws.noaa.gov/data/forecasts/taf/stations',
};

export const getMetarTaf = async (airport) => {
  try {
    const airportCode = airport.toUpperCase().trim();

    let metarText = 'No METAR available';
    let tafText = 'No TAF available';

    try {
      const { data } = await axios.get(`${NOAA_BASE.metar}/${airportCode}.TXT`);
      metarText = data.split('\n')[1]?.trim() || 'No METAR available';
    } catch (e) {
      console.log('METAR fetch error:', e.message);
    }

    try {
      const { data } = await axios.get(`${NOAA_BASE.taf}/${airportCode}.TXT`);
      // TAF is multiple lines; first line is a timestamp, skip it
      tafText = data.split('\n').slice(1).join(' ').trim() || 'No TAF available';
    } catch (e) {
      console.log('TAF fetch error:', e.message);
      tafText = 'TAF not available for this airport';
    }

    if (metarText !== 'No METAR available') {
      return { success: true, airport: airportCode, metar: metarText, taf: tafText };
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