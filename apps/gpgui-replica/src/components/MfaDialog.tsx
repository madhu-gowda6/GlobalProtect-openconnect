import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";

type Props = {
  open: boolean;
  message: string;
  onSubmit: (otp: string) => void;
  onCancel: () => void;
};

export function MfaDialog({ open, message, onSubmit, onCancel }: Props) {
  const [otp, setOtp] = useState("");

  // Reset the field whenever a new challenge appears.
  useEffect(() => {
    if (open) setOtp("");
  }, [open, message]);

  const submit = () => {
    if (otp.trim()) onSubmit(otp.trim());
  };

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontSize: 16 }}>Multi-factor authentication</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ fontSize: 13, mb: 2 }}>
          {message || "Enter the verification code from your authenticator."}
        </DialogContentText>
        <TextField
          autoFocus
          fullWidth
          size="small"
          label="Verification code"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          onClick={submit}
          disabled={!otp.trim()}
          variant="contained"
          disableElevation
          sx={{ textTransform: "none" }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
