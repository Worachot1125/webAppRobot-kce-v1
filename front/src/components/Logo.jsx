import React from "react";
import { Box, Typography } from "@mui/material";

import logoKCE from "../../public/assets/logo-kce.jpg";

function Logo() {
  return (
    <Box sx={{ textAlign: "center", my: 1 }}>
      <Box
        component="img"
        src={logoKCE}
        alt="Logo"
        sx={{
          width: "150px",
          height: "100px",
          objectFit: "contain",
        }}
      />
      <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: 1, color: "#eb521d", fontSize: { xs: 18, md: 32 }}}>
        KCE Electronics PCL
      </Typography>
    </Box>
  );
}

export default Logo;
