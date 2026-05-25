use std::{
  collections::HashMap,
  path::PathBuf,
  process::{ExitStatus, Stdio},
};

use anyhow::bail;
use common::constants::GP_GUI_BINARY;
use log::info;
use tokio::{io::AsyncWriteExt, process::Command};

use crate::utils::base64;

use super::command_traits::CommandExt;

pub struct GuiLauncher<'a> {
  program: PathBuf,
  api_key: &'a [u8],
  minimized: bool,
  envs: Option<HashMap<String, String>>,
}

impl<'a> GuiLauncher<'a> {
  pub fn new(_version: &'a str, api_key: &'a [u8]) -> Self {
    Self {
      program: GP_GUI_BINARY.into(),
      api_key,
      minimized: false,
      envs: None,
    }
  }

  pub fn envs<T: Into<Option<HashMap<String, String>>>>(mut self, envs: T) -> Self {
    self.envs = envs.into();
    self
  }

  pub fn minimized(mut self, minimized: bool) -> Self {
    self.minimized = minimized;
    self
  }

  pub async fn launch(&self) -> anyhow::Result<ExitStatus> {
    self.launch_program().await
  }

  async fn launch_program(&self) -> anyhow::Result<ExitStatus> {
    let mut cmd = Command::new(&self.program);

    if let Some(envs) = &self.envs {
      cmd.env_clear();
      cmd.envs(envs);
    }

    cmd.arg("--api-key-on-stdin");

    if self.minimized {
      cmd.arg("--minimized");
    }

    info!("Launching gpgui-replica");
    let mut non_root_cmd = cmd.into_non_root()?;
    let child = non_root_cmd.kill_on_drop(true).stdin(Stdio::piped()).spawn();
    let mut child = match child {
      Ok(child) => child,
      Err(err) => bail!("Failed to spawn {}: {}", self.program.display(), err),
    };

    let Some(mut stdin) = child.stdin.take() else {
      bail!("Failed to open stdin");
    };

    let api_key = base64::encode(self.api_key);
    tokio::spawn(async move {
      stdin.write_all(api_key.as_bytes()).await.unwrap();
      drop(stdin);
    });

    let exit_status = child.wait().await?;

    Ok(exit_status)
  }
}
