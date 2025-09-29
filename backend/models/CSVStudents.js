import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  id: Number,
  name: String,
  subject: String,
  needsFront: Boolean,
  group: String
});

const csvStudentsSchema = new mongoose.Schema({
  title: { type: String, required: true }, // group name
  students: [studentSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("CSVStudents", csvStudentsSchema);
