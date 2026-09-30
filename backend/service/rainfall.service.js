const NASA_POWER_API =
  "https://power.larc.nasa.gov/api/temporal/daily/point";

export async function getHistoricalRainfall(
  latitude,
  longitude,
  startDate,
  endDate
) {
  try {
    const params = new URLSearchParams({
      parameters: "PRECTOTCORR",

      community: "AG",

      longitude,
      latitude,

      start: startDate,
      end: endDate,

      format: "JSON",
    });

    const response = await fetch(
      `${NASA_POWER_API}?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(
        `Rainfall API failed: ${response.status}`
      );
    }

    const data = await response.json();

    const rainfall =
      data.properties?.parameter?.PRECTOTCORR;

    if (!rainfall) {
      throw new Error(
        "Rainfall data not available"
      );
    }

    return {
      success: true,

      location: {
        latitude,
        longitude,
      },

      rainfall,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}