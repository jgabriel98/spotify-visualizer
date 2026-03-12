import { Settings } from "~/UI/pages/settings/context";

type ScreenDimensions = [width: number, height: number];

type ClientsScreenSpecs = {
  [socketId: string]: {
    name: Readonly<string>;
    dimensions: Readonly<ScreenDimensions>;
  }
}

interface ServerToClientEvents {
  'qrCodeAuth:authenticated': (code: string) => void;
  [k: `setState-${string}`]: <T>(msg: T) => void;
  'clientSpecs:getClientScreen': (callback: (response: { socketId: string, dimensions: ScreenDimensions }) => void) => void
}

interface ClientToServerEvents {
  'qrCodeAuth:init': (authState: string) => void;
  'qrCodeAuth:abort': (authState: string) => void;
  'qrCodeAuth:externalAuthenticated': (
    authState: string,
    code: string,
    callback: (ack: { status: string, message: string }) => void
  ) => void;
  /* persisted state events */
  'joinStateRoom': (
    key: string,
    callback: <T>(ack: { status: string, foundPersistedState: false } | { status: string, foundPersistedState: true, state: any }) => void
  ) => void;
  'setState': <T>(msg: { key: string, value: T }) => void;

  /* client resolution advertizing */
  'clientSpecs:getAllClientsScreen': (callback: (response: ClientsScreenSpecs) => void) => void;
}
