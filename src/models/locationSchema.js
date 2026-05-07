const mongoose = require("mongoose");
const locationSchema = new mongoose.Schema(
  {
    addressName: {
      type: String,
      trim: true,
    },

    fullAddress: {
      type: String,
      trim: true,
    },

    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point",
    },

    coordinates: {
      type: [Number],
      required: [true, "Coordinates (Long/Lat) are required"],
      validate: {
        validator: function (val) {
          return (
            val.length === 2 &&
            Math.abs(val[0]) <= 180 &&
            Math.abs(val[1]) <= 90
          );
        },
        message: "Invalid coordinates format. Use [Longitude, Latitude].",
      },
    },

    placeId: {
      type: String,
    },
  },
  { _id: false },
);

module.exports = locationSchema;
