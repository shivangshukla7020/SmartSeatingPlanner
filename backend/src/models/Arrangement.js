import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
  row: Number,
  col: Number,
  studentId: Number
});

const arrangementSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "CSVStudents", required: false },
  strategy: { type: String, default: "linear" },
  rows: Number,
  cols: Number,
  constraints: {
    minDistSameSubject: Number,
    avoidDiag: Boolean,
    frontRowsForNeeds: Number,
    keepApartGroupDist: Number
  },
  seats: [seatSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Arrangement", arrangementSchema);
