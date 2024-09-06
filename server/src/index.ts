import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import path from 'node:path';
import { Server } from "socket.io";
import routes from './routes';
import registerStateHandlers from './sockets/persisted-state';
import registerSpotifyAuthHandlers from './sockets/qrcode-auth';
import chalk from 'chalk';

const isDevMode = process.env.NODE_ENV === "development"
const __clientdir = isDevMode
  ? path.join(__dirname, '/../../client/dist/') 
  : path.join(__dirname, 'client/');

const app = express();
if(isDevMode) app.use(cors());

const server = isDevMode ? http.createServer(app) : https.createServer({
  key: fs.readFileSync(path.join(__dirname,'./cert/key.pem')),
  cert: fs.readFileSync(path.join(__dirname,'./cert/cert.pem'))
}, app);

const io = new Server(server, {
  cors: isDevMode ? {} : undefined
});


io.on('connection', (socket) => {
  const clientIP = socket.handshake.address;
  console.log(chalk.greenBright('user connected: '), chalk.gray(clientIP, socket.id));

  socket.on('disconnect', () => {
    console.log(chalk.green.dim('user disconnected: '), chalk.gray(clientIP, socket.id));
  });

  registerStateHandlers(socket);
  registerSpotifyAuthHandlers(io, socket);
});

app.use(bodyParser.json())
app.use(routes);


app.use(express.static(__clientdir));
app.get('*', (req, res) => {
  res.sendFile(path.join(__clientdir, 'index.html'));
});

server.listen(3000, '0.0.0.0', () => {
  console.log('server running at port 3000');
});