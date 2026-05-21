import { Box } from "@mui/material";
import { InfoBanner } from "../InfoBanner";
import { CheckboxRow } from "../CheckboxRow";
import { Settings } from "../../../tauri/commands";

type Props = {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
};

export function SslTlsTab({ settings, onChange }: Props) {
  return (
    <Box>
      <InfoBanner variant="warning">
        You might need to restart the client to apply the settings on this page.
      </InfoBanner>

      <CheckboxRow
        label="Enable OpenSSL Legacy Mode"
        description="Uses extended compatibility mode for OpenSSL operations to support a broader range of systems and formats."
        checked={settings.opensslLegacy}
        onChange={(v) => onChange({ opensslLegacy: v })}
      />
      <CheckboxRow
        label="Ignore TLS Errors"
        description="Enable this if your server is using a self-signed or invalid certificate."
        checked={settings.ignoreTlsErrors}
        onChange={(v) => onChange({ ignoreTlsErrors: v })}
      />
    </Box>
  );
}
