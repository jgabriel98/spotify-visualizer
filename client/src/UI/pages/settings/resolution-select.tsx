import { createComputed, createEffect, createResource, createSignal, Show, Suspense } from "solid-js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/solid-ui/components/select";
import { type Settings, useSettings } from "./context";


type DeviceResolutionOptions = {
  name: string;
  dimensions: Settings['dimensions'];
}

function toRange<T>(arr: T[]) {
  return Array.from({ length: arr.length }, (_, index) => index);
}

export function ResolutionSelect() {
  const { settings, setSettings, fetchClientsScreenResolution } = useSettings();

  const [selectedScreen, setSelectedScreen] = createSignal<number>();
  const [clientsScreens] = createResource(fetchClientsScreenResolution);

  const thisScreen = { name: 'this screen', dimensions: [window.innerWidth, window.innerHeight] }
  const allScreens = () => {
    return [thisScreen, ...(clientsScreens() ?? [])] as DeviceResolutionOptions[]
  }

  createComputed((initialized? :boolean) => {
    if (initialized) return true;
    if (!settings()) return false;

    const optionIdx = allScreens().findIndex(d =>
      d.dimensions[0] === settings().dimensions[0] &&
      d.dimensions[1] === settings().dimensions[1]
    )
    if (optionIdx >= 0) {
      setSelectedScreen(optionIdx)
      return true;
    }
    else return false
  })

  createEffect(() => {
    const idx = selectedScreen();
    if (typeof idx !== 'number') return;
    setSettings(prev => ({
      ...prev,
      dimensions: allScreens()[idx].dimensions
    }))
  })

  /* colocar um drodown select, tendo como opções: os clientes conectados + manually defined resolution */
  return (
    <Suspense fallback={<div>suspense...</div>}>
      <Show when={clientsScreens()}>
    <Select
      disabled={!clientsScreens()}
      options={toRange(allScreens())}
      value={selectedScreen()}
      placeholder='pick a resolution'
      onChange={(option) => option && setSelectedScreen(option)}
      itemComponent={(props) => {
        const deviceOption = allScreens()[props.item.rawValue]

        return <SelectItem item={props.item}>{
          deviceOption ? `${deviceOption.dimensions[0]}x${deviceOption.dimensions[1]} (${deviceOption.name})` : props.item.textValue
        }</SelectItem>
      }}
      disallowEmptySelection
    >
      <SelectTrigger aria-label="Resolution" class="gap-2">
        <SelectValue<number>>{(state) => {
          const selectedOption = state.selectedOption();
          if (typeof selectedOption !== 'number') return;
          const selectedDeviceOption = allScreens()[selectedOption];
          return `${selectedDeviceOption.dimensions[0]}x${selectedDeviceOption.dimensions[1]}`
        }}</SelectValue>
      </SelectTrigger>
      <SelectContent class="*:w-full w-full" />
    </Select>
    </Show>
    </Suspense>
  );
}