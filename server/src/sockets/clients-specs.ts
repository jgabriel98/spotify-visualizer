import { Server, Socket } from "socket.io"
import chalk from "chalk";

type ScreenDimensions = [number, number];

type ClientScreenSpecs = {
  socketId: string;
  dimensions: ScreenDimensions
}

function registerClientSpecsHandlers(io: Server, socket: Socket) {

  const getIpFromSocket = (socketId: string) => {
    return io.sockets.sockets.get(socketId)?.handshake.address;
  }

  socket.on('clientSpecs:getAllClientsScreen', (callback) => {
    // emmits to everyone, expect the emmiting socket
    socket.broadcast.timeout(2000).emit('clientSpecs:getClientScreen', (err: Error, responses: ClientScreenSpecs[]) => {
      if (err) {
        console.log(
          chalk.dim.redBright('[clientSpecs:getClientScreen]'),
          chalk.redBright('client failed to ack:'),
          chalk.gray(err)
        );
      }

      const map = Object.fromEntries(responses.map(res => [
        res.socketId,
        { name: getIpFromSocket(res.socketId), dimensions: res.dimensions }
      ]))

      callback(map);
    })
  });

};

export default registerClientSpecsHandlers;