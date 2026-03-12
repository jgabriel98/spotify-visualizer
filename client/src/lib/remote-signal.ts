import { type Accessor, createComputed, createSignal, onCleanup, type Signal } from "solid-js";
import { leadingAndTrailing, throttle } from "@solid-primitives/scheduled";
import { webSocket } from "./websocket";

type RemoteSignal<T> = [Signal<T>[0], Signal<T>[1], Accessor<boolean>]

export default function createRemoteSignal<T>(key: string, fallbackValue: T): RemoteSignal<T>;
export default function createRemoteSignal<T>(key: string): RemoteSignal<T | undefined>;

export default function createRemoteSignal<T>(key: string, fallbackValue?: T) {

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

  const throttledEmit = leadingAndTrailing(throttle, (msg: {key: string, value: typeof fallbackValue}) => webSocket.emit('setState', msg), 25);

  createComputed(() => {
    const _value = value();
    if (!joinedStateRoom()) return;

    if (lastSignalChangeSource === 'local') {
      throttledEmit({ key, value: _value });
    }
  })

  // on server message emit
  webSocket.on(`setState-${key}`, (msg) => {
    setValueWithSource(msg as any, 'external');
  });

  onCleanup(() => webSocket.off(`setState-${key}`));

  // @ts-ignore
  const setValue: typeof _setValue = (v) => {
    setValueWithSource(v, 'local');
  }

  return [
    value,
    setValue,
    joinedStateRoom
  ] as const;
};
