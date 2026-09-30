const NASA_POWER_API =
  "https://power.larc.nasa.gov/api/temporal/daily/point";

export async function getClimateData(
  latitude,
  longitude,
  startDate,
  endDate
) {
  try {
    const params = new URLSearchParams({
      parameters:
        "T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,RH2M,WS10M",

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
        `NASA POWER API failed: ${response.status}`
      );
    }

    const data = await response.json();

    const properties =
      data.properties?.parameter;

    if (!properties) {
      throw new Error(
        "Invalid response from NASA POWER"
      );
    }

    return {
      success: true,

      location: {
        latitude,
        longitude,
      },

      data: properties,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}