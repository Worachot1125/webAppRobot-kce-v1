import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import ScreenLayout from "../components/ScreenLayout.jsx";
import Logo from "../components/Logo.jsx";

function Home() {
  const navigate = useNavigate();
  const [pendingPath, setPendingPath] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const openPasswordDialog = (path) => {
    setPendingPath(path);
    setPassword("");
    setError("");
  };

  const closeDialog = () => {
    setPendingPath(null);
    setPassword("");
    setError("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") submitPassword();
  };

  return (
    <ScreenLayout
      title="หน้าหลัก"
      onBack={() => {}}
      showBack={false}
      onHome={() => navigate("/")}
      showLogo={false}
      contentMaxWidth={900}
    >
      <Logo />
      <Box
        sx={{
          display: "flex",
          gap: { xs: 1, md: 3 },
          width: "100%",
          justifyContent: "center",
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Button
          variant="contained"
          sx={{
            flex: 1,
            borderRadius: "4px",
            py: { xs: 2, md: 4 },
            fontSize: { xs: 22, md: 34 },
            bgcolor: "#eb521d",
            fontWeight: 900,
            height: 120,
          }}
          onClick={() => navigate("/machine-select")}
        >
          MACHINE
        </Button>

       
      </Box>
    </ScreenLayout>
  );
}

export default Home;
