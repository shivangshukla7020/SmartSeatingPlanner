import "dotenv/config";
import { connectDB } from "./connectDB.js";
import CSVStudents from "../models/CSVStudents.js";
import BlockedSeat from "../models/BlockedSeat.js";

const students = [
  { id: 101, name: "Ana", subject: "Math", needsFront: false, group: "" },
  { id: 102, name: "Bob", subject: "Physics", needsFront: true, group: "grp1" },
  { id: 103, name: "Cam", subject: "Math", needsFront: false, group: "grp2" },
  { id: 104, name: "Dia", subject: "Chemistry", needsFront: false, group: "grp1" },
  { id: 105, name: "Eli", subject: "Math", needsFront: true, group: "" },
  { id: 106, name: "Fay", subject: "Physics", needsFront: false, group: "grp3" }
];

const blocked = [
  { row: 0, col: 0, reason: "projector" },
  { row: 0, col: 1, reason: "invigilator" }
];

const run = async () => {
  await connectDB(process.env.MONGODB_URI);

  // Clear previous data
  await CSVStudents.deleteMany();
  await BlockedSeat.deleteMany();

  // Create a single CSV group with these students
  await CSVStudents.create({
    title: "Seed Group",
    students
  });

  await BlockedSeat.insertMany(blocked);

  console.log("Seeded CSVStudents and BlockedSeats");
  process.exit(0);
};

run();
