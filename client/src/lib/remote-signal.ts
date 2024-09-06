import { io } from "socket.io-client";
import { createComputed, createSignal, onCleanup, Signal } from "solid-js";
import { leadingAndTrailing, throttle } from "@solid-primitives/scheduled";

const wsEndpoint = `${location.protocol}//${location.hostname}:${import.meta.env.VITE_SERVER_PORT}`
const webSocket = io(wsEndpoint, {autoConnect: true});

export default function createRemoteSignal<T>(key: string, fallbackValue: T): Signal<T>;
export default function createRemoteSignal<T>(key: string): Signal<T | undefined>;

export default function createRemoteSignal<T>(key: string, fallbackValue?: T) {
  onCleanup(() => webSocket.disconnect());

  let lastSignalChangeSource: 'local' | 'external' = 'local';
  const [value, _setValue] = createSignal(fallbackValue)
  const [joinedStateRoom, setJoinedStateRoom] = createSignal(false);

  const setValueWithSource = (
    v: Parameters<typeof _setValue>[0],
    source: 'local' | 'external'
  ) => {
    lastSignalChangeSource = source;
    return _setValue(v);
  };

  webSocket.emitWithAck('joinStateRoom', key).then((res) => {
    if (res.status !== 'ok')
      throw new Error(`failed to join signal-state:${key} room`);

    if (res.foundPersistedState) setValueWithSource(res.state, 'external');
    setJoinedStateRoom(true);
  });

  const throttledEmit = leadingAndTrailing(throttle, (msg) => webSocket.emit('setState', msg), 25);

  createComputed(() => {
    const _value = value();
    if (!joinedStateRoom()) return;

    if (lastSignalChangeSource === 'local') {
      throttledEmit({key, value: _value});
    }
  })

  // on server message emit
  webSocket.on(`setState-${key}`, (msg) => {
    setValueWithSource(msg, 'external');
  });

  // @ts-ignore
  const setValue: typeof _setValue = (v) => {
    setValueWithSource(v, 'local');
  }

  return [
    value,
    setValue
  ] as const;
};
