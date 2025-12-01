import mongoose, { Schema, Document, Model } from "mongoose";
import { Product } from "../types";

// --- Correct TypeScript model typing ---
export interface ProductDocument extends Document, Product {}

// --- Schema definition ---
const ProductSchema = new Schema<ProductDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,          // Prevent duplicate product names
    },
    price: {
      type: Schema.Types.Decimal128,   // high-precision currency
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,     // optional: remove __v
  }
);

// Convert Decimal128 → number/float on output
ProductSchema.set("toJSON", {
  transform: (_doc, ret) => {
    if (ret.price && ret.price.toString) {
      ret.price = parseFloat(ret.price.toString());
    }
    return ret;
  },
});

// --- Use correct model naming convention ---
export const ProductModel: Model<ProductDocument> =
  mongoose.models.Product || mongoose.model<ProductDocument>("Product", ProductSchema);
