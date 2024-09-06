import { Socket } from "socket.io"
import jsonStorage from "../lib/json-storage";
import chalk from "chalk";

function getroomName(key: string) {
  return `signal-state:${key}`
}

function registerStateHandlers(socket: Socket) {

  socket.on('joinStateRoom', (key, callback) => {
    const roomName = getroomName(key);
    console.log(chalk.cyanBright('joinStateRoom:'), roomName)
    socket.join(roomName);

    let state;
    try {
      state = jsonStorage.get(key);
    } catch (e) {
      console.log(chalk.gray("    - no persisted state found"))
      return callback({ 
        status: "ok",
        foundPersistedState: false
      });
    }

    console.log( chalk.white("    - persisted state:"), chalk.gray(state))
    callback({
      status: "ok",
      foundPersistedState: true,
      state
    });
  });

  // emmits to everyone in state room, expect current client
  socket.on('setState', ({ key, value }) => {
    jsonStorage.set(key, value);

    socket.broadcast.to(getroomName(key))
      .emit(`setState-${key}`, value);
  });

};

export default registerStateHandlers;