const { Worker } = require("bullmq");

const redisConnection = require("../redis");

const { getIO } = require("../../socket");
const { getUserSocketId } = require("../../socket/onlineUsers");

const notificationWorker = new Worker(
  "notifications",

  async (job) => {
    const notification = job.data;

    const socketId = getUserSocketId(notification.recipient);

    if (socketId) {
      const io = getIO();

      io.to(socketId).emit("notification:new", notification);
    }
  },

  {
    connection: redisConnection,
  },
);

notificationWorker.on("completed", (job) => {
  console.log(`✅ Notification job completed: ${job.id}`);
});

notificationWorker.on("failed", (job, error) => {
  console.log(`❌ Notification job failed: ${job?.id}`);

  console.log(error.message);
});

module.exports = notificationWorker;
