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

app.use(
  express.json({
    limit: "50mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  })
);

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
// START LIVE SYNC
// ===============================
app.post("/api/sync/start", async (req, res) => {
  try {
    const { url } = req.body;
    console.log("SYNC URL:", url);

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "Excel URL required",
      });
    }

    res.json({
      success: true,
      message: "Live sync initialized successfully",
      excelUrl: url,
    });
  } catch (err) {
    console.log("SYNC ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
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
// BULK INSERT EXCEL DATA (FIXED COUNT & BLANK ROWS ISSUE)
// ===============================
app.post("/api/items/bulk", async (req, res) => {
  try {
    console.log("TOTAL RAW ITEMS RECEIVED:", req.body.length);

    if (!req.body || !Array.isArray(req.body)) {
      return res.status(400).json({ success: false, error: "Invalid data format" });
    }

    // 1. SMART CLEANING & NORMALIZATION LAYER
    const cleanedData = req.body.map((rawItem, index) => {
      let item = { ...rawItem };

      let rawPartNumber = item.partNumber || item["ITEM CODE"] || item["Item Code"] || "";
      let partNumber = String(rawPartNumber).trim();
      
      let description = String(item.description || item["DESCRIPTION"] || item["Description"] || "").trim();
      let remarks = String(item.remarks || item["REMARKS"] || item["Remarks"] || "").trim();
      let unit = String(item.unit || item["UNIT"] || item["Unit"] || "").trim();

      // Agar row bilkul khali hai to skip karein
      if (!partNumber && !description && !unit) return null;
      if (partNumber === "undefined" || description === "undefined") return null;

      // FIX: Agar partNumber blank hai, toh ek temporary unique code generate karein taaki filter use delete na kare
      if (!partNumber || partNumber === "") {
        partNumber = `TEMP-${Date.now()}-${index}`;
      }

      // Rule A: (BLOCKED) string check
      if (partNumber.toUpperCase().includes("(BLOCKED)")) {
        partNumber = partNumber.replace(/\(BLOCKED\)/i, "").trim();
        remarks = remarks ? `${remarks} | Status: BLOCKED` : "Status: BLOCKED";
      }

      // Rule B: Multiple codes split
      if (partNumber.includes("/")) {
        const codes = partNumber.split("/");
        partNumber = codes[0].trim();
        remarks = remarks ? `${remarks} | Alt Code: ${codes[1].trim()}` : `Alt Code: ${codes[1].trim()}`;
      }

      // Rule C: Corrupted text fix
      if (description.includes("Fçe")) {
        description = description.replace(/Fçe/g, "Face");
      }

      // Data assignment
      item.partNumber = partNumber;
      item.description = description;
      item.remarks = remarks;

      if (item["UNIT"]) item.unit = item["UNIT"];
      if (item["EQUIPMENT"]) item.equipment = item["EQUIPMENT"];
      if (item["SUB AREA"]) item.subArea = item["SUB AREA"];
      if (item["ASSEMBLY"]) item.assembly = item["ASSEMBLY"];
      if (item["U.O.M"]) item.uom = item["U.O.M"];
      if (item["INSTALLED QUANTITY"]) item.installedQuantity = item["INSTALLED QUANTITY"];
      if (item["SPARE LOCATION"]) item.spareLocation = item["SPARE LOCATION"];
      if (item["DRG. REF."]) item.drgRef = item["DRG. REF."];

      return item;
    }).filter(item => item !== null);

    // 2. SMART UNIQUE FILTERING (Prevent deleting multiple empty rows)
    const uniqueItems = cleanedData.filter((item, index, self) => {
      // Agar auto-generated code ya dummy code hai toh description ke sath match karke check karein
      if (item.partNumber.startsWith("TEMP-") || item.partNumber === "123456789") {
        return index === self.findIndex((t) => 
          t.partNumber === item.partNumber && t.description === item.description
        );
      }
      return index === self.findIndex((t) => t.partNumber === item.partNumber);
    });

    console.log("FINAL UNIQUE CLEANED ITEMS TO DATABASE:", uniqueItems.length);

    let insertedCount = 0;
    let savedItems = [];

    try {
      // ordered: false se agar beech me duplicate key error aayega toh bhi baki data insert hota rahega
      savedItems = await Item.insertMany(uniqueItems, { ordered: false });
      insertedCount = savedItems.length;
    } catch (bulkError) {
      // Agar kuch items duplicate entries ki wajah se database level par fail hue, toh safely count nikalen
      insertedCount = bulkError.insertedDocs ? bulkError.insertedDocs.length : 0;
      savedItems = bulkError.insertedDocs || [];
      console.log(`Some items skipped due to DB duplicates. Successfully inserted: ${insertedCount}`);
    }

    console.log("BULK DATA PROCESS COMPLETED. SAVED:", insertedCount);

    res.status(201).json({
      success: true,
      count: insertedCount,
      data: savedItems,
    });

  } catch (err) {
    console.log("BULK ROUTE CRITICAL ERROR:", err);
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
    const items = await Item.find().sort({
      createdAt: -1,
    });

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
// UPDATE ITEM
// ===============================
app.put("/api/items/:id", async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      data: updatedItem,
    });
  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ===============================
// DELETE SINGLE ITEM
// ===============================
app.delete("/api/items/:id", async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ===============================
// BULK DELETE ITEMS
// ===============================
app.post("/api/items/bulk-delete", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        success: false,
        error: "Invalid IDs array",
      });
    }

    const result = await Item.deleteMany({
      _id: { $in: ids },
    });

    res.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.log("BULK DELETE ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ===============================
// DELETE ALL ITEMS
// ===============================
app.delete("/api/items", async (req, res) => {
  try {
    const result = await Item.deleteMany({});
    console.log("ALL ITEMS DELETED");

    res.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.log("DELETE ALL ERROR:", err);
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