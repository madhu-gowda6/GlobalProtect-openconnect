import React from "react";
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
import { Settings } from "../../../tauri/commands";

type ClientOs = "Linux" | "Windows" | "Mac";

type Props = {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
};

export function ConnectionTab({ settings, onChange }: Props) {
  const userAgent = `PAN GlobalProtect/${settings.clientVersion} (${settings.osVersion})`;

  return (
    <Box>
      <InfoBanner variant="info">
        You could tweak these settings if you're experiencing connection issues.
      </InfoBanner>

      <FieldLabel>Client OS</FieldLabel>
      <FormControl sx={{ mb: 2.5 }}>
        <RadioGroup
          row
          value={settings.os}
          onChange={(_, v) => onChange({ os: v })}
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

      <TextRow label="OS Version" value={settings.osVersion} onChange={(v) => onChange({ osVersion: v })} />
      <TextRow
        label="Client Version"
        value={settings.clientVersion}
        onChange={(v) => onChange({ clientVersion: v })}
      />
      <TextRow label="User Agent" value={userAgent} readOnly />
      <TextRow label="VPNC Script" value={settings.vpncScript} onChange={(v) => onChange({ vpncScript: v })} />
      <TextRow
        label="Local Hostname"
        value={settings.localHostname}
        onChange={(v) => onChange({ localHostname: v })}
        placeholder="The '--local-hostname' option of openconnect"
      />
      <TextRow
        label="Reconnect Timeout"
        value={settings.reconnectTimeout}
        onChange={(v) => onChange({ reconnectTimeout: v })}
        placeholder="The '--reconnect-timeout' option of openconnect (default: 300 seconds)"
      />
      <TextRow
        label="MTU"
        value={settings.mtu}
        onChange={(v) => onChange({ mtu: v })}
        placeholder="Request MTU from server (legacy servers only)"
      />
      <TextRow
        label="Force DPD"
        value={settings.forceDpd}
        onChange={(v) => onChange({ forceDpd: v })}
        placeholder="The '--force-dpd' option of openconnect (in seconds)"
      />

      <CheckboxRow
        label="Submit HIP Report"
        checked={settings.hipEnabled}
        onChange={(v) => onChange({ hipEnabled: v })}
      >
        {settings.hipEnabled && (
          <TextRow
            label="Custom HIP Script Location"
            value={settings.hipScript}
            onChange={(v) => onChange({ hipScript: v })}
            embed
          />
        )}
      </CheckboxRow>

      <CheckboxRow
        label="Disable IPv6"
        checked={settings.disableIpv6}
        onChange={(v) => onChange({ disableIpv6: v })}
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
