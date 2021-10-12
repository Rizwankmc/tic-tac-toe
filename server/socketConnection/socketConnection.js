const socketConnection = (io) => {
  try {
    io.on("connect", (socket) => {
      socket.on("disconnect", () => {
        let index = users.findIndex((user) => user === socket.id);
        if (index !== -1) {
          users.splice(index, 1);
        }
        console.log("player disconnected");
      });
    });
  } catch (error) {
    console.log("Error in socket connection =>", error.message);
    process.exit(1);
  }
};

export default socketConnection;
