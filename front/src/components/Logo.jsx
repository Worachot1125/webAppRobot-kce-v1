import React from "react";
import { Box, Typography } from "@mui/material";

import logoPro from "../../public/assets/logo 100Pro.png"

function Logo() {
  return (
    <Box sx={{ textAlign: "center", my: 1 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1 }}>
        100 Pro
      </Typography>
      <Box
                component="img"
                src={logoPro}
                alt="CALL AMR"
                sx={{
                  width: "150px",
                  height: "100px",
                  objectFit: "contain",
                }}
              />
    </Box>
  );
}

export default Logo;
