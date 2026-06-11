import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeIcon from "@mui/icons-material/Home";

import logoKCE from "../../public/assets/logo-kce.jpg";

function ScreenLayout({
  title,
  onBack,
  onHome,
  children,
  showBack = true,
  showLogo = true,
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        px: 2,
        pt: 3,
        pb: 6,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 650,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <IconButton
          onClick={onBack}
          disabled={!showBack}
          sx={{ opacity: showBack ? 1 : 0 }}
        >
          <ArrowBackIcon sx={{ fontSize: 50 }} />
        </IconButton>

        {showLogo ? (
          <Box
            component="img"
            src={logoKCE}
            alt="Logo"
            sx={{
              width: "80px",
              height: "auto",
              display: "block",
              mx: "auto",
            }}
          />
        ) : (
          <Box sx={{ width: "80px" }} />
        )}

        <IconButton onClick={onHome}>
          <HomeIcon sx={{ fontSize: 50 }} />
        </IconButton>
      </Box>

      <Box
        sx={{
          mt: 2,
          width: "100%",
          maxWidth: 650,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default ScreenLayout;
