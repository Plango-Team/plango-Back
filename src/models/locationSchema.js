const locationSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      trim: true,
    },
    coordinates: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
  },
  { _id: false },
);
locationSchema.index({ "coordinates.lat": 1, "coordinates.lng": 1 });

module.exports = locationSchema;
