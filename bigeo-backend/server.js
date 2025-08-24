require('dotenv').config(); // Load environment variables from .env file

const express = require("express");
const cors = require("cors");
const { createClient } = require("@libsql/client");

const app = express();
const port = process.env.PORT || 5000; // Use environment variable for port

// Middleware
app.use(cors());
app.use(express.json()); // Use built-in JSON parser instead of body-parser

// Turso client setup using environment variables
const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_TOKEN,
});

// Create shipments table if it does not exist
async function createTableIfNotExists() {
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS shipments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT NOT NULL UNIQUE,
        shipment_id TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL,
        current_location TEXT NOT NULL,
        destination_location TEXT NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Table 'shipments' verified/created.");
  } catch (error) {
    console.error("Error creating shipments table:", error);
  }
}

// Utility function to generate a zero-padded random number string
function generateRandomIdNumber() {
  const randomNum = Math.floor(Math.random() * 100000); // Generates number between 0 and 99999
  return randomNum.toString().padStart(5, '0'); // Pads to 5 digits, e.g., "00042"
}

// Utility function to get current IST timestamp in 24-hour format
function getCurrentISTTimestamp() {
  const now = new Date();
  const istOffset = 330; // IST offset in minutes (+5:30)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istTime = new Date(utc + (istOffset * 60000));

  const year = istTime.getFullYear();
  const month = String(istTime.getMonth() + 1).padStart(2, '0');
  const date = String(istTime.getDate()).padStart(2, '0');
  const hours = String(istTime.getHours()).padStart(2, '0');
  const minutes = String(istTime.getMinutes()).padStart(2, '0');
  const seconds = String(istTime.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
}

// REST API routes

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the BiGeo Backend with Turso!");
});

// REST API to get all shipments
app.get("/api/shipments", async (req, res) => {
  try {
    const result = await client.execute("SELECT * FROM shipments ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// REST API to get a shipment by ID
app.get("/api/shipments/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.execute("SELECT * FROM shipments WHERE id = ?", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Shipment not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// REST API to add a new shipment
app.post("/api/shipments", async (req, res) => {
  let { device_id, shipment_id, status, current_location, destination_location, notes } = req.body;

  // Generate matching random IDs if not provided
  if (!device_id && !shipment_id) {
    const uniqueNumber = generateRandomIdNumber();
    device_id = `iot-${uniqueNumber}`;
    shipment_id = `SHIP-${uniqueNumber}`;
  }

  if (!device_id || !shipment_id || !status || !current_location || !destination_location) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const created_at = getCurrentISTTimestamp(); // Get IST timestamp

  try {
    await client.execute(
      `INSERT INTO shipments 
      (device_id, shipment_id, status, current_location, destination_location, notes, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [device_id, shipment_id, status, current_location, destination_location, notes, created_at]
    );

    const lastId = await client.execute("SELECT last_insert_rowid() AS id");
    const insertedId = lastId.rows[0].id;

    const insertedShipment = await client.execute("SELECT * FROM shipments WHERE id = ?", [insertedId]);
    res.status(201).json(insertedShipment.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// REST API to update a shipment
app.put("/api/shipments/:id", async (req, res) => {
  const { id } = req.params;
  const { device_id, shipment_id, status, current_location, destination_location, notes } = req.body;

  if (!device_id || !shipment_id || !status || !current_location || !destination_location) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await client.execute(
      `UPDATE shipments SET 
      device_id = ?, shipment_id = ?, status = ?, current_location = ?, destination_location = ?, notes = ? 
      WHERE id = ?`,
      [device_id, shipment_id, status, current_location, destination_location, notes, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    const updatedShipment = await client.execute("SELECT * FROM shipments WHERE id = ?", [id]);
    res.json(updatedShipment.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// REST API to delete a shipment
app.delete("/api/shipments/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const shipment = await client.execute("SELECT * FROM shipments WHERE id = ?", [id]);
    if (shipment.rows.length === 0) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    await client.execute("DELETE FROM shipments WHERE id = ?", [id]);
    res.status(204).send(); // Return 204 No Content on successful delete
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// REST API to handle IoT device data exchange
app.post("/api/iot-data", async (req, res) => {
  const { device_id, current_location, status } = req.body;

  if (!device_id || !current_location || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await client.execute(
      "UPDATE shipments SET current_location = ?, status = ? WHERE device_id = ?",
      [current_location, status, device_id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "No shipment found for the given device ID" });
    }

    const updatedShipment = await client.execute("SELECT * FROM shipments WHERE device_id = ?", [device_id]);
    res.json(updatedShipment.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Initialize and start server
(async () => {
  await createTableIfNotExists();

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
})();
