import { useState } from "react";
import { Box } from "@mui/material";
import { InfoBanner } from "../InfoBanner";
import { CheckboxRow } from "../CheckboxRow";

export function SslTlsTab() {
  const [opensslLegacy, setOpensslLegacy] = useState(false);
  const [ignoreTlsErrors, setIgnoreTlsErrors] = useState(false);

  return (
    <Box>
      <InfoBanner variant="warning">
        You might need to restart the client to apply the settings on this page.
      </InfoBanner>

      <CheckboxRow
        label="Enable OpenSSL Legacy Mode"
        description="Uses extended compatibility mode for OpenSSL operations to support a broader range of systems and formats."
        checked={opensslLegacy}
        onChange={setOpensslLegacy}
      />
      <CheckboxRow
        label="Ignore TLS Errors"
        description="Enable this if your server is using a self-signed or invalid certificate."
        checked={ignoreTlsErrors}
        onChange={setIgnoreTlsErrors}
      />
    </Box>
  );
}
