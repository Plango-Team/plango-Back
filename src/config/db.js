const mongoose = require('mongoose');
const { config } = require('./index');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    // console.error(`❌ MongoDB connection failed: ${err.message}`);
    console.log(err);
    // console.log(JSON.stringify(process.env.MONGODB_URI));
    process.exit(1); // Stop the app if DB fails
  }
};

module.exports = connectDB;
