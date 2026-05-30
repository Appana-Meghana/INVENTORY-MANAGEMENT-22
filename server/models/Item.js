import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    make: {
      type: String,
      default: "",
      trim: true,
    },

    partNumber: {
      type: String,
      default: "",
      trim: true,
    },

    quantity: {
      type: Number,
      default: 0,
    },

    rack: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Item = mongoose.model("Item", itemSchema);

export default Item;