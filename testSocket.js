const { io } = require("socket.io-client");

const socket = io("http://localhost:5000", {
  transports: ["websocket"],

  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OWZkZjIyM2RkOWYxZjRhZGNiNTE2ODIiLCJyb2xlIjoidXNlciIsImlhdCI6MTc3ODgwOTQzOCwiZXhwIjoxNzc5NDE0MjM4fQ.OceDmIU9kLUOBZqd4R9AMAIQt_UWzWxM2i9NMCNK4V4",
  },
});

socket.on("connect", () => {

  console.log("✅ Connected");

  console.log("Socket ID:", socket.id);

});

socket.on("notification:new", (notification) => {

  console.log("🔔 New Notification:");

  console.log(notification);

});

socket.on("connect_error", (error) => {

  console.log("❌ Connection Error:");

  console.log(error.message);

});