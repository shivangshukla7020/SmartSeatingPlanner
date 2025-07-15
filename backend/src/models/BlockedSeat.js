import mongoose from "mongoose";
const BlockedSeatSchema = new mongoose.Schema({
  row: Number,
  col: Number,
  reason: String
});
export default mongoose.model("BlockedSeat", BlockedSeatSchema);
