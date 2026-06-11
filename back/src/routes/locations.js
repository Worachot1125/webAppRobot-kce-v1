const express = require("express");
const { getConfig } = require("../services/store");

const router = express.Router();

router.get("/get/buffers", async (req, res) => {
  const config = await getConfig();

  const buffers = (config.pickupLocactions || []).flatMap(
    (group) => group.buffers || []
  );

  res.json({
    ok: true,
    data: buffers,
  });
});

module.exports = router;