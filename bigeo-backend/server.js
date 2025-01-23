// server.js
require('dotenv').config(); // Load environment variables from .env file

const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 5000; // Use environment variable for port

// Middleware
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL connection using environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the BiGeo Backend!");
});

// REST API to get all shipments
app.get("/api/shipments", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM shipments ORDER BY id ASC");
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
    const result = await pool.query("SELECT * FROM shipments WHERE id = $1", [id]);
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
  const { device_id, shipment_id, status, current_location, destination_location, notes } = req.body;

  if (!device_id || !shipment_id || !status || !current_location || !destination_location) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO shipments (device_id, shipment_id, status, current_location, destination_location, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [device_id, shipment_id, status, current_location, destination_location, notes]
    );
    res.status(201).json(result.rows[0]);
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
    const result = await pool.query(
      "UPDATE shipments SET device_id = $1, shipment_id = $2, status = $3, current_location = $4, destination_location = $5, notes = $6 WHERE id = $7 RETURNING *",
      [device_id, shipment_id, status, current_location, destination_location, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// REST API to delete a shipment
app.delete("/api/shipments/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM shipments WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    res.json({ message: "Shipment deleted successfully", deletedShipment: result.rows[0] });
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
    const result = await pool.query(
      "UPDATE shipments SET current_location = $1, status = $2 WHERE device_id = $3 RETURNING *",
      [current_location, status, device_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No shipment found for the given device ID" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});