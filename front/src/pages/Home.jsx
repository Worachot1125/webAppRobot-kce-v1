import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import ScreenLayout from "../components/ScreenLayout.jsx";
import Logo from "../components/Logo.jsx";

const TEST_PASSWORD = "AMECAMR26";

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

  const submitPassword = () => {
    if (password === TEST_PASSWORD) {
      const target = pendingPath;
      closeDialog();
      navigate(target);
    } else {
      setError("รหัสผ่านไม่ถูกต้อง");
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") submitPassword();
  };

  return (
    <ScreenLayout title="หน้าหลัก" onBack={() => {}} showBack={false} onHome={() => navigate("/")}>
      <Logo />
      <Box sx={{ display: "flex", gap: 2, width: "100%", justifyContent: "center" }}>
        <Button
          variant="contained"
          color="primary"
          sx={{ flex: 1, borderRadius: 999, py: 1.2 }}
          onClick={() => navigate("/order/robot")}
        >
          สั่งงาน
        </Button>
        <Button
          variant="contained"
          color="inherit"
          sx={{ flex: 1, borderRadius: 999, py: 1.2, bgcolor: "#c8c8c8" }}
          onClick={() => navigate("/cancel")}
        >
          ยกเลิกงาน
        </Button>
      </Box>
      <Button
        variant="contained"
        color="primary"
        sx={{ borderRadius: 999, width: "100%", py: 1.4 }}
        onClick={() => navigate("/history")}
      >
        ประวัติการสั่งงาน
      </Button>
      <Button
        variant="outlined"
        color="primary"
        sx={{ borderRadius: 999, width: "100%", py: 1.4 }}
        onClick={() => navigate("/status")}
      >
        สถานะหุ่นยนต์
      </Button>
    </ScreenLayout>
  );
}

export default Home;
