interface ServerToClientEvents {
  'qrCodeAuth:authenticated': (code: string) => void;
}

interface ClientToServerEvents {
  'qrCodeAuth:init': (authState: string) => void;
  'qrCodeAuth:abort': (authState: string) => void;
  'qrCodeAuth:externalAuthenticated': (authState: string, code: string, callback: ({ status: string, message: string }) => void) => void;
}
