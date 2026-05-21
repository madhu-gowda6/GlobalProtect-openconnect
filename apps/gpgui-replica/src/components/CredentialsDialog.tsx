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
import { CredentialPrompt } from "../tauri/events";

type Props = {
  prompt: CredentialPrompt | null;
  onSubmit: (username: string, password: string) => void;
  onCancel: () => void;
};

export function CredentialsDialog({ prompt, onSubmit, onCancel }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Reset fields whenever a new prompt appears.
  useEffect(() => {
    if (prompt) {
      setUsername("");
      setPassword("");
    }
  }, [prompt]);

  const submit = () => {
    if (username.trim() && password) onSubmit(username.trim(), password);
  };

  const open = prompt !== null;

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontSize: 16 }}>Sign in</DialogTitle>
      <DialogContent>
        {prompt?.message && (
          <DialogContentText sx={{ fontSize: 13, mb: 2 }}>
            {prompt.message}
          </DialogContentText>
        )}
        <TextField
          autoFocus
          fullWidth
          size="small"
          label={prompt?.usernameLabel || "Username"}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          size="small"
          type="password"
          label={prompt?.passwordLabel || "Password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          disabled={!username.trim() || !password}
          variant="contained"
          disableElevation
          sx={{ textTransform: "none" }}
        >
          Sign in
        </Button>
      </DialogActions>
    </Dialog>
  );
}
