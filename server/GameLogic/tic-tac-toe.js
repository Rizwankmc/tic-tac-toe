import tictacRoomModel from "../models/tictacRoom.model";

export const gameStart = async (io, socket, data) => {
  try {
    const { roomId } = data;
    const roomData = await tictacRoomModel.findOne({ _id: roomId });
    if (roomData) {
      if (roomData.players.length === 2) {
        io.in(roomId).emit("gameStart", {
          playerPosition: userIndex + 1,
          matrix: roomData.matrix,
        });
      }
    } else {
      socket.emit("actionError", { msg: "Room not found" });
    }
  } catch (error) {
    console.log("Error in gameStart =>", error);
  }
};
