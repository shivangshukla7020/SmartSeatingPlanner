import express from "express";
import CSVStudents from "../models/CSVStudents.js";
import multer from "multer"; // for file upload
import csvParser from "csv-parser"; // parse CSV
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // temp folder

// POST /csv/upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });
    if (!req.file) return res.status(400).json({ error: "CSV file is required" });

    const students = [];
    fs.createReadStream(req.file.path)
      .pipe(csvParser())
      .on("data", (row) => {
        students.push({
          id: Number(row.id),
          name: row.name,
          subject: row.subject,
          needsFront: row.needsFront === "true",
          group: row.group || title
        });
      })
      .on("end", async () => {
        fs.unlinkSync(req.file.path); // clean temp file
        const group = await CSVStudents.create({ title, students });
        res.json(group);
      });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload CSV" });
  }
});

// GET /csv/groups - list previous uploaded CSV groups
router.get("/groups", async (req, res) => {
  try {
    const groups = await CSVStudents.find().select("_id title createdAt").sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

// GET /csv/group/:id - fetch a CSV group with students
router.get("/group/:id", async (req, res) => {
  try {
    const group = await CSVStudents.findById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });
    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch group" });
  }
});

export default router;
