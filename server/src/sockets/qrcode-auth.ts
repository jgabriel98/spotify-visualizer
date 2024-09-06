import chalk from "chalk";
import { Server, Socket } from "socket.io"

const ongoingAuthentications: {
  [authState: string]: string
} = {};

function registerSpotifyAuthHandlers(io: Server, socket: Socket) {

  socket.on('qrCodeAuth:init', (authState: string) => {
    console.log(chalk.bgBlueBright('qrCodeAuth:init :'), chalk.gray(authState))
    ongoingAuthentications[authState] = socket.id;
  });

  socket.on('qrCodeAuth:abort', (authState: string, callback) => {
    console.log(chalk.yellow('qrCodeAuth:abort :'), chalk.gray(authState))
    if (authState in ongoingAuthentications) {
      delete ongoingAuthentications[authState];
    } else callback?.({
      status: "error",
      message: "No ongoing authentication found"
    });
  });

  socket.on('qrCodeAuth:authenticated', (authState: string, code: string, callback) => {
    console.log(chalk.blue('qrCodeAuth:authenticated :'), chalk.gray(authState))

    if (authState in ongoingAuthentications) {
      const sourceSocketId = ongoingAuthentications[authState];
      io.to(sourceSocketId).emit('qrCodeAuth:authenticated', code);
    } else callback({
      status: "error",
      message: "No ongoing authentication found. Maybe it already completed or was aborted?"
    });
  });

  socket.on('qrCodeAuth:complete', (authState: string, callback) => {
    console.log(chalk.greenBright('qrCodeAuth:complete :'), chalk.gray(authState));

    if (authState in ongoingAuthentications) {
      delete ongoingAuthentications[authState];
    } else callback({
      status: "error",
      message: "No ongoing authentication found. Maybe it was aborted?"
    });
  });

};

export default registerSpotifyAuthHandlers;