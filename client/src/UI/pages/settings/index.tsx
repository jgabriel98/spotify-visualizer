import { useNavigate } from "@solidjs/router";
import { clearStoredAuthToken } from "~/lib/spotify-auth";
import { useSettings } from "./context";

export function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useSettings();

  const onLogout = () => {
    clearStoredAuthToken();
    navigate('/');
  }

  return <>
    <button onClick={onLogout}>Logout</button>

    {/* colocar um drodown select, tendo como opções: os clientes conectados + manually defined resolution */}
    <div>
      {settings().resolution}
      <button onclick={() => setSettings({
        ...settings(),
        resolution: [1920,  1080]
      })}>
        Set resolution
        </button>
    </div>

    {/* colocar um "option picker" entre barras de audio OU dynamic background (cor baseado na musica atual)*/}
    <div>
      {settings().background}
      <button onclick={() => setSettings({

        ...settings(),
        background: settings().background === 'audioBars' ? 'accentColor' : 'audioBars'
      })}>
        set background
        </button>
      
    </div>
  </>
}