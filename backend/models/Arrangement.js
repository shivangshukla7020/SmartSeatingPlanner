import mongoose from "mongoose";

// Each seat will have a row, column, and a student assigned
const seatSchema = new mongoose.Schema({
  row: Number,        // Row number in the classroom
  col: Number,        // Column number in the classroom
  studentId: Number   // ID of the student sitting here
});

// Main arrangement schema
const arrangementSchema = new mongoose.Schema({
  groupId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "CSVStudents",   // Reference to the CSV group collection
    required: false       // It's optional, you may not always have a CSV group
  },
  groupName: { 
    type: String, 
    default: null         // Store the CSV group name for display purposes
  },
  strategy: { 
    type: String, 
    default: "linear"     // Strategy used for seating (linear or mixed)
  },
  rows: Number,           // Number of rows in the classroom
  cols: Number,           // Number of columns in the classroom
  constraints: {          // Any seating constraints
    minDistSameSubject: Number,   // Minimum distance between students of same subject
    avoidDiag: Boolean,           // Avoid diagonal seating for same subject
    frontRowsForNeeds: Number,    // Number of front rows reserved for "needsFront" students
    keepApartGroupDist: Number    // Minimum distance to keep group members apart
  },
  seats: [seatSchema],     // Array of seats in this arrangement
  createdAt: { 
    type: Date, 
    default: Date.now        // Automatically store creation time
  }
});

// Export the model so we can use it in our API
export default mongoose.model("Arrangement", arrangementSchema);
