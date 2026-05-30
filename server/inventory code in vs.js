 import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Item from "./models/Item.js";

// ===============================
// FIX __dirname
// ===============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===============================
// LOAD ENV
// ===============================
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

// ===============================
// EXPRESS APP
// ===============================
const app = express();

// ===============================
// MIDDLEWARE
// ===============================
app.use(cors());

app.use(express.json({
  limit: "50mb",
}));

app.use(express.urlencoded({
  extended: true,
  limit: "50mb",
}));

// ===============================
// DEBUG
// ===============================
console.log("MONGO_URI =", process.env.MONGO_URI);

// ===============================
// DATABASE CONNECTION
// ===============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.log("DB Error:", err);
  });

// ===============================
// HOME ROUTE
// ===============================
app.get("/", (req, res) => {
  res.send("Inventory Backend Running");
});

// ===============================
// CREATE SINGLE ITEM
// ===============================
app.post("/api/items", async (req, res) => {
  try {

    console.log("DATA RECEIVED:", req.body);

    const item = await Item.create(req.body);

    console.log("DATA SAVED");

    res.status(201).json({
      success: true,
      data: item,
    });

  } catch (err) {

    console.log("ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });

  }
});

// ===============================
// BULK INSERT EXCEL DATA
// ===============================
app.post("/api/items/bulk", async (req, res) => {
  try {

    console.log("TOTAL ITEMS:", req.body.length);

    const items = await Item.insertMany(req.body);

    console.log("BULK DATA SAVED");

    res.status(201).json({
      success: true,
      count: items.length,
    });

  } catch (err) {

    console.log("BULK ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });

  }
});

// ===============================
// GET ALL ITEMS
// ===============================
app.get("/api/items", async (req, res) => {
  try {

    const items = await Item.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: items.length,
      data: items,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      error: err.message,
    });

  }
});

// ===============================
// DELETE ITEM
// ===============================
app.delete("/api/items/:id", async (req, res) => {
  try {

    await Item.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Deleted successfully",
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      error: err.message,
    });

  }
});

// ===============================
// SERVER START
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});