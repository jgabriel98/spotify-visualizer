import { Accessor, createContext, onCleanup, onMount, ParentProps, Setter, useContext } from "solid-js";
import { useLocalStorage } from "solidjs-use";
import { webSocket } from "~/lib/websocket";

export interface Settings {
  dimensions: [width: number, height: number] | [width: null, height: null];
  background: 'audioBars' | 'accentColor';
}

interface SettingsProviderContext {
  settings: Accessor<Settings>;
  setSettings: Setter<Settings>;
  fetchClientsScreenResolution: () => Promise<{
    name: Readonly<string>;
    dimensions: Readonly<Settings['dimensions']>;
  }[]>;
}

const DEFAULT_SETTINGS: Settings = {
  dimensions: [null, null],
  background: 'audioBars'
};

const Context = createContext<SettingsProviderContext>({
  settings: () => DEFAULT_SETTINGS,
  setSettings: () => { },
  fetchClientsScreenResolution: (() => { }) as unknown as SettingsProviderContext['fetchClientsScreenResolution']
});


export function SettingsProvider(props: ParentProps<{ dimensionContainer: HTMLElement }>) {
  const [settings, setSettings] = useLocalStorage<Settings>('settings', DEFAULT_SETTINGS, { mergeDefaults: true });

  onMount(() => {
    webSocket.on('clientSpecs:getClientScreen', (callback) => {
      const styles = window.getComputedStyle(props.dimensionContainer);
      callback({
        socketId: webSocket.id!,
        dimensions: [parseInt(styles.width), parseInt(styles.height)]
      });
    })
  })

  onCleanup(() => {
    webSocket.off('clientSpecs:getClientScreen')
  })

  const fetchClientsScreenResolution = () => webSocket.emitWithAck('clientSpecs:getAllClientsScreen').then((responses) => {
    return Object.values(responses);
  });


  return (
    <Context.Provider value={{ settings, setSettings, fetchClientsScreenResolution }}>
      {props.children}
    </Context.Provider>
  );
}

// 4. Hook for easy consumption
export const useSettings = () => useContext(Context);
