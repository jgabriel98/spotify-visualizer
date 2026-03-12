import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "~/services/types/socket.io";

const wsEndpoint = new URL(`${location.protocol}//${location.hostname}`);
wsEndpoint.port = import.meta.env.VITE_SERVER_PORT ?? '';
export const webSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io(wsEndpoint.toString(), { autoConnect: true, closeOnBeforeunload: true });

