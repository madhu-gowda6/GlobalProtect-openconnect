import { useState } from "react";
import { Box } from "@mui/material";
import { CheckboxRow } from "../CheckboxRow";

export function AuthenticationTab() {
  const [reuseCookies, setReuseCookies] = useState(true);
  const [externalBrowser, setExternalBrowser] = useState(false);
  const [clientCert, setClientCert] = useState(false);

  return (
    <Box>
      <CheckboxRow
        label="Reuse Authentication Cookies"
        description="Enable this option to stay logged in longer with SSO. You won't need to log in repeatedly if your session is still active."
        checked={reuseCookies}
        onChange={setReuseCookies}
      />
      <CheckboxRow
        label="Use External Browser"
        description="Prefer to use the external browser for SSO authentication if your portal supports it."
        checked={externalBrowser}
        onChange={setExternalBrowser}
      />
      <CheckboxRow
        label="Use Client Certificate Authentication"
        description="Enable this option if your portal requires the client certificate authentication."
        checked={clientCert}
        onChange={setClientCert}
      />
    </Box>
  );
}
