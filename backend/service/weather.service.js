const GEOCODING_API =
  "https://geocoding-api.open-meteo.com/v1/search";

const WEATHER_API =
  "https://api.open-meteo.com/v1/forecast";

/**
 * Convert a location name into latitude and longitude.
 *
 * Example:
 * getCoordinates("Karnal, Haryana")
 */
export async function getCoordinates(location) {
  try {
    const url =
      `${GEOCODING_API}` +
      `?name=${encodeURIComponent(location)}` +
      `&count=1` +
      `&language=en` +
      `&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Geocoding API failed with status ${response.status}`
      );
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error(`Location not found: ${location}`);
    }

    const place = data.results[0];

    return {
      name: place.name,
      country: place.country,
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: place.timezone,
      elevation: place.elevation,
    };
  } catch (error) {
    throw new Error(`Location service error: ${error.message}`);
  }
}

/**
 * Get current weather and 7-day forecast
 * using latitude and longitude.
 */
export async function getWeather(latitude, longitude) {
  try {
    const params = new URLSearchParams({
      latitude,
      longitude,

      current:
        "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m",

      daily:
        "precipitation_sum,precipitation_probability_max,temperature_2m_max,temperature_2m_min,et0_fao_evapotranspiration",

      forecast_days: "7",

      timezone: "auto",
    });

    const response = await fetch(
      `${WEATHER_API}?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(
        `Weather API failed with status ${response.status}`
      );
    }

    const data = await response.json();

    return data;
  } catch (error) {
    throw new Error(`Weather service error: ${error.message}`);
  }
}

/**
 * Get complete weather information for a location.
 *
 * This is the main function that our tool will use.
 */
export async function getWeatherByLocation(location) {
  try {
    // Step 1: Location → coordinates
    const place = await getCoordinates(location);

    // Step 2: Coordinates → weather
    const weather = await getWeather(
      place.latitude,
      place.longitude
    );

    // Step 3: Convert API response into
    // clean information for our AI agent.
    const forecast = weather.daily.time.map(
      (date, index) => ({
        date,

        minTemperature:
          weather.daily.temperature_2m_min[index],

        maxTemperature:
          weather.daily.temperature_2m_max[index],

        rainfall:
          weather.daily.precipitation_sum[index],

        rainProbability:
          weather.daily.precipitation_probability_max[index],

        evapotranspiration:
          weather.daily.et0_fao_evapotranspiration[index],
      })
    );

    return {
      success: true,

      location: {
        name: place.name,
        country: place.country,
        latitude: place.latitude,
        longitude: place.longitude,
        timezone: weather.timezone,
      },

      current: {
        temperature:
          weather.current.temperature_2m,

        humidity:
          weather.current.relative_humidity_2m,

        precipitation:
          weather.current.precipitation,

        windSpeed:
          weather.current.wind_speed_10m,
      },

      forecast,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}