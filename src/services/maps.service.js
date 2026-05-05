const axios = require("axios");
const { config } = require("../config");
const AppError = require("../utils/appError");

exports.getTravelEstimate = async (origin, destination, mode = "driving") => {
  try {
    const originStr = `${origin[1]},${origin[0]}`;
    const destStr = `${destination[1]},${destination[0]}`;

    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/distancematrix/json",
      {
        params: {
          origins: originStr,
          destinations: destStr,
          mode: mode,
          departure_time: "now",
        },
      },
    );

    const data = response.data.rows[0].elements[0];

    if (data.status !== "OK") {
      throw new AppError("Could not calculate travel distance.", 400);
    }

    return {
      distance: data.distance.text,
      duration: Math.ceil(data.duration_in_traffic.value / 60),
      rawResponse: data,
    };
  } catch (error) {
    throw new AppError("Maps Service Error", 500);
  }
};
