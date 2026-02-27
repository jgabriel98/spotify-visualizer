import { Accessor, createContext, useContext } from "solid-js";
import { useLocalStorage } from "solidjs-use";

export interface Settings {
  resolution: [number, number] | [null, null];
  background: 'audioBars' | 'accentColor';
}

const DEFAULT_SETTINGS: Settings = {
  resolution: [null, null],
  background: 'audioBars'
};

const Context = createContext<[Accessor<Settings>, (newSettings: Settings) => void]>([
  () => DEFAULT_SETTINGS,
  () => {}
]);


export function SettingsProvider(props: { children: any }) {
  const [settings, setSettings] = useLocalStorage<Settings>('settings', DEFAULT_SETTINGS, { mergeDefaults: true });

  return (
    <Context.Provider value={[settings, setSettings]}>
      {props.children}
    </Context.Provider>
  );
}

// 4. Hook for easy consumption
export const useSettings = () => useContext(Context);
