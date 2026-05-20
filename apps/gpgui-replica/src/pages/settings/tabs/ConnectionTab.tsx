import React, { useState } from "react";
import {
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { InfoBanner } from "../InfoBanner";
import { CheckboxRow } from "../CheckboxRow";

type ClientOs = "Linux" | "Windows" | "Mac";

// Default values mirror what the screenshots show, sourced from
// common::constants::GP_USER_AGENT / GP_CLIENT_VERSION and the host OS.
const DEFAULT_OS_VERSION = "Linux Ubuntu 24.04.4 LTS";
const DEFAULT_CLIENT_VERSION = "6.3.0-33";
const DEFAULT_VPNC_SCRIPT = "/usr/libexec/gpclient/vpnc-script";
const DEFAULT_HIP_SCRIPT = "/usr/libexec/gpclient/hipreport.sh";

export function ConnectionTab() {
  const [clientOs, setClientOs] = useState<ClientOs>("Linux");
  const [osVersion, setOsVersion] = useState(DEFAULT_OS_VERSION);
  const [clientVersion, setClientVersion] = useState(DEFAULT_CLIENT_VERSION);
  const [vpncScript, setVpncScript] = useState(DEFAULT_VPNC_SCRIPT);
  const [localHostname, setLocalHostname] = useState("");
  const [reconnectTimeout, setReconnectTimeout] = useState("");
  const [mtu, setMtu] = useState("");
  const [forceDpd, setForceDpd] = useState("");
  const [submitHip, setSubmitHip] = useState(true);
  const [hipScript, setHipScript] = useState(DEFAULT_HIP_SCRIPT);
  const [disableIpv6, setDisableIpv6] = useState(false);

  const userAgent = `PAN GlobalProtect/${clientVersion} (${osVersion})`;

  return (
    <Box>
      <InfoBanner variant="info">
        You could tweak these settings if you're experiencing connection issues.
      </InfoBanner>

      <FieldLabel>Client OS</FieldLabel>
      <FormControl sx={{ mb: 2.5 }}>
        <RadioGroup
          row
          value={clientOs}
          onChange={(_, v) => setClientOs(v as ClientOs)}
        >
          {(["Linux", "Windows", "Mac"] as ClientOs[]).map((os) => (
            <FormControlLabel
              key={os}
              value={os}
              control={<Radio size="small" />}
              label={
                <Typography sx={{ fontSize: 14 }}>
                  {os === "Mac" ? "macOS" : os}
                </Typography>
              }
            />
          ))}
        </RadioGroup>
      </FormControl>

      <TextRow label="OS Version" value={osVersion} onChange={setOsVersion} />
      <TextRow
        label="Client Version"
        value={clientVersion}
        onChange={setClientVersion}
      />
      <TextRow label="User Agent" value={userAgent} readOnly />
      <TextRow label="VPNC Script" value={vpncScript} onChange={setVpncScript} />
      <TextRow
        label="Local Hostname"
        value={localHostname}
        onChange={setLocalHostname}
        placeholder="The '--local-hostname' option of openconnect"
      />
      <TextRow
        label="Reconnect Timeout"
        value={reconnectTimeout}
        onChange={setReconnectTimeout}
        placeholder="The '--reconnect-timeout' option of openconnect (default: 300 seconds)"
      />
      <TextRow
        label="MTU"
        value={mtu}
        onChange={setMtu}
        placeholder="Request MTU from server (legacy servers only)"
      />
      <TextRow
        label="Force DPD"
        value={forceDpd}
        onChange={setForceDpd}
        placeholder="The '--force-dpd' option of openconnect (in seconds)"
      />

      <CheckboxRow
        label="Submit HIP Report"
        checked={submitHip}
        onChange={setSubmitHip}
      >
        {submitHip && (
          <TextRow
            label="Custom HIP Script Location"
            value={hipScript}
            onChange={setHipScript}
            embed
          />
        )}
      </CheckboxRow>

      <CheckboxRow
        label="Disable IPv6"
        checked={disableIpv6}
        onChange={setDisableIpv6}
      />
    </Box>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.6)", mb: 0.5 }}>
      {children}
    </Typography>
  );
}

type TextRowProps = {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  embed?: boolean;
};

function TextRow({ label, value, onChange, placeholder, readOnly, embed }: TextRowProps) {
  return (
    <Box sx={{ mb: embed ? 0 : 2 }}>
      {!embed && <FieldLabel>{label}</FieldLabel>}
      {embed && (
        <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.6)", mb: 0.5 }}>
          {label}
        </Typography>
      )}
      <TextField
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        fullWidth
        variant="standard"
        slotProps={{ input: { readOnly: !!readOnly } }}
        sx={{
          "& .MuiInput-input": { fontSize: 14, py: 0.5 },
          "& .MuiInput-underline:before": {
            borderBottomColor: "rgba(255,255,255,0.12)",
          },
        }}
      />
    </Box>
  );
}
