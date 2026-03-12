import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/solid-ui/components/select";
import { type Settings, useSettings } from "./context";

export function BackgroundSelect() {
  const { settings, setSettings } = useSettings();

  return (
    <Select<Settings['background']>
      disallowEmptySelection
      value={settings().background}
      onChange={(option) => setSettings(prev => ({ ...prev, background: option! }))}
      options={["audioBars", "accentColor"]}
      itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>}
    >
      <SelectTrigger aria-label="Fruit" class="gap-2">
        <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
      </SelectTrigger>
      <SelectContent class="*:w-full w-full" />
    </Select>
  )
}