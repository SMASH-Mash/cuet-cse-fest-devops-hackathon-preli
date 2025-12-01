import { Types } from "mongoose";

/**
 * Strong, safe, API-friendly product type.
 * This matches the JSON returned by your Express API.
 */
export interface Product {
  _id?: string; // string because API returns serialized ObjectId

  name: string;

  /**
   * Price is Decimal128 in MongoDB, but converted to number in toJSON().
   */
  price: number;

  /**
   * Timestamps automatically added by Mongoose.
   * Returned as ISO strings in JSON.
   */
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Internal type for database-only usage.
 * Never exposed to API level.
 */
export interface ProductDB {
  _id: Types.ObjectId;
  name: string;
  price: number; // still a number because price is converted in model.toJSON()
  createdAt: Date;
  updatedAt: Date;
}
