import { Box } from "@mui/material";
import { CheckboxRow } from "../CheckboxRow";
import { Settings } from "../../../tauri/commands";

type Props = {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
};

export function AuthenticationTab({ settings, onChange }: Props) {
  return (
    <Box>
      <CheckboxRow
        label="Reuse Authentication Cookies"
        description="Enable this option to stay logged in longer with SSO. You won't need to log in repeatedly if your session is still active."
        checked={settings.reuseCookies}
        onChange={(v) => onChange({ reuseCookies: v })}
      />
      <CheckboxRow
        label="Use External Browser"
        description="Prefer to use the external browser for SSO authentication if your portal supports it."
        checked={settings.externalBrowser}
        onChange={(v) => onChange({ externalBrowser: v })}
      />
      <CheckboxRow
        label="Use Client Certificate Authentication"
        description="Enable this option if your portal requires the client certificate authentication."
        checked={settings.clientCert}
        onChange={(v) => onChange({ clientCert: v })}
      />
    </Box>
  );
}
