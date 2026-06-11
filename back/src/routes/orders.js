const express = require("express");
const {
  getConfig,
  getHistory,
  saveHistory,
  saveConfig,
} = require("../services/store");
const {
  dispatchOrderImmediate,
  getQueueSnapshot,
} = require("../services/queue");

const router = express.Router();

const BUFFER_IDS = ["bu1-01", "bu1-02", "bu1-03", "bu1-04", "bu1-05"];

function getPickupLocations(config) {
  return (config.pickupLocactions || []).flatMap(
    (group) => group.location || [],
  );
}

function getPickupBuffers(config) {
  return (config.pickupLocactions || []).flatMap(
    (group) => group.buffers || [],
  );
}

function getMachines(config) {
  return (config.pickupLocactions || []).flatMap(
    (group) => group.machines || [],
  );
}

function findBufferById(config, bufferId) {
  return getPickupBuffers(config).find(
    (buffer) => String(buffer.id) === String(bufferId),
  );
}

function findMachineById(config, machineId) {
  return getMachines(config).find(
    (machine) => String(machine.id) === String(machineId),
  );
}

function findPickupLocationByBarcode(config, barcode) {
  return getPickupLocations(config).find(
    (loc) =>
      String(loc.barcode_text || "").trim() === String(barcode || "").trim(),
  );
}

function findRobot(config, robotId) {
  if (robotId) {
    return (config.robots || []).find((robot) => robot.id === robotId);
  }

  return (config.robots || [])[0] || null;
}

function findRcsBaseUrl(config, robot) {
  const rcs = (config.rcs || []).find((item) => item.id === robot?.rcsId);
  return rcs?.baseUrl || "";
}

function findAvailableBuffer(config) {
  const buffers = getPickupBuffers(config);

  for (const bufferId of BUFFER_IDS) {
    const buffer = buffers.find((item) => item.id === bufferId);
    if (!buffer) continue;

    if (
      buffer.statusCart === "empty" &&
      buffer.statusWork === "free" &&
      !buffer.orderId
    ) {
      return buffer;
    }
  }

  return null;
}

async function addHistory(order) {
  const history = await getHistory();
  history.unshift(order);
  await saveHistory(history);
}

function updateBufferStatus(config, bufferId, values) {
  for (const group of config.pickupLocactions || []) {
    for (const buffer of group.buffers || []) {
      if (buffer.id === bufferId) {
        Object.assign(buffer, values);
        return buffer;
      }
    }
  }

  return null;
}

router.post("/scan-barcode", async (req, res) => {
  try {
    const barcodeText = String(
      req.body?.barcode_text || req.body?.barcode || "",
    ).trim();

    if (!barcodeText) {
      return res.status(400).json({
        error: "Missing barcode_text",
      });
    }

    const config = await getConfig();

    if (!Array.isArray(config.products)) {
      config.products = [];
    }

    const exists = config.products.find(
      (item) => String(item.barcode_text || "").trim() === barcodeText,
    );

    if (exists) {
      return res.status(409).json({
        error: "Barcode already exists",
        product: exists,
      });
    }

    const nextId =
      config.products.reduce((max, item) => {
        const idNumber = Number(item.id);
        return Number.isFinite(idNumber) && idNumber > max ? idNumber : max;
      }, 0) + 1;

    const product = {
      id: nextId,
      barcode_text: barcodeText,
      createdAt: new Date().toISOString(),
    };

    config.products.push(product);

    await saveConfig(config);

    return res.json({
      ok: true,
      message: "Product barcode added",
      product,
      products: config.products,
    });
  } catch (err) {
    console.error("[Orders] scan-barcode error:", err);

    return res.status(500).json({
      error: err.message || "Scan barcode failed",
    });
  }
});

router.post("/scan-pickup-location", async (req, res) => {
  const { barcode } = req.body || {};

  if (!barcode) {
    return res.status(400).json({ error: "Missing barcode" });
  }

  const config = await getConfig();
  const location = findPickupLocationByBarcode(config, barcode);

  if (!location) {
    return res.status(404).json({ error: "Pickup location not found" });
  }

  res.json({
    ok: true,
    location,
  });
});

router.post("/", async (req, res) => {
  try {
    const { robotId, bufferId, machineId } = req.body || {};

    if (!bufferId) {
      return res.status(400).json({ error: "Missing bufferId" });
    }

    if (!machineId) {
      return res.status(400).json({ error: "Missing machineId" });
    }

    const config = await getConfig();

    const robot = findRobot(config, robotId);
    if (!robot) {
      return res.status(404).json({ error: "Robot not found" });
    }

    const pickup = findBufferById(config, bufferId);
    if (!pickup) {
      return res.status(404).json({ error: "Buffer not found" });
    }

    const drop = findMachineById(config, machineId);
    if (!drop) {
      return res.status(404).json({ error: "Machine not found" });
    }

    if (!pickup.rcsPosition || !drop.rcsPosition) {
      return res.status(400).json({
        error: "Pickup or drop rcsPosition is missing",
      });
    }

    const orderId = `${Date.now()}${Math.floor(Math.random() * 1e6)}`;

    const baseOrder = {
      orderId,
      robotId: robot.id,
      robotName: robot.name,
      pickup: {
        id: pickup.id,
        name: pickup.name,
        rcsPosition: pickup.rcsPosition,
      },
      drop: {
        id: drop.id,
        name: drop.name,
        rcsPosition: drop.rcsPosition,
      },
      createdAt: new Date().toISOString(),
    };

    const rcsBaseUrl = findRcsBaseUrl(config, robot);
    const taskPath = `${pickup.rcsPosition},${drop.rcsPosition}`;

    console.log(
      `[Orders] dispatch robot=${robot.id} orderId=${orderId} taskPath=${taskPath} deviceNum=${robot.deviceNum} rcsBaseUrl=${rcsBaseUrl || "(empty)"}`,
    );

    const result = await dispatchOrderImmediate(baseOrder, {
      robot,
      startSpot: pickup,
      endSpot: drop,
      rcsBaseUrl,
    });

    if (!result.ok) {
      return res.status(502).json({
        error: result.error || result.rcsResponse?.desc || "RCS send failed",
        orderId,
        status: "SEND_FAILED",
        rcsResponse: result.rcsResponse,
      });
    }

    updateBufferStatus(config, pickup.id, {
      robotId: robot.id,
      orderId,
    });

    await saveConfig(config);

    return res.json({
      ok: true,
      orderId,
      status: "SEND_SUCCESS",
      rcsResponse: result.rcsResponse,
      data: {
        ...baseOrder,
        status: "SEND_SUCCESS",
        rcsResponse: result.rcsResponse,
      },
      queue: getQueueSnapshot(),
    });
  } catch (err) {
    console.error("[Orders] create error:", err);

    return res.status(500).json({
      error: err.message || "Create order failed",
    });
  }
});

router.get("/history", async (req, res) => {
  const { status, q } = req.query;
  let history = await getHistory();

  if (status && status !== "ALL") {
    history = history.filter((item) => item.status === status);
  }

  if (q) {
    const query = String(q).toLowerCase();
    history = history.filter((item) => {
      return (
        item.orderId?.toLowerCase().includes(query) ||
        item.robotName?.toLowerCase().includes(query) ||
        item.pickup?.name?.toLowerCase().includes(query) ||
        item.drop?.name?.toLowerCase().includes(query)
      );
    });
  }

  res.json(history);
});

router.post("/:orderId/cancel", async (req, res) => {
  const { orderId } = req.params;
  const history = await getHistory();

  const index = history.findIndex((item) => item.orderId === orderId);
  if (index === -1) {
    return res.status(404).json({ error: "Order not found" });
  }

  history[index] = {
    ...history[index],
    status: "CANCELLED",
    finishedAt: new Date().toISOString(),
    note: "Cancelled",
  };

  await saveHistory(history);
  res.json({ ok: true });
});

module.exports = router;
