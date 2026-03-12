import { useNavigate } from "@solidjs/router";
import { clearStoredAuthToken } from "~/lib/spotify-auth";
import { Button } from "~/solid-ui/components/button";
import { BackgroundSelect } from "./background-select";
import { ResolutionSelect } from "./resolution-select";
import { Flex } from "~/solid-ui/components/flex";

export function Settings() {
  const navigate = useNavigate();

  const onLogout = () => {
    clearStoredAuthToken();
    navigate('/');
  }

  return <Flex class="gap-4" justifyContent="start" alignItems="start">
    <Button onClick={onLogout}>Logout</Button>

    <ResolutionSelect />

    <BackgroundSelect />
  </Flex>
}