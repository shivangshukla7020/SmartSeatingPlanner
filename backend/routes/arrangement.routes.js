import express from "express";
import BlockedSeat from "../models/BlockedSeat.js";
import Arrangement from "../models/Arrangement.js";
import { linearStrategy } from "../services/strategies/linear.js";
import { mixedStrategy } from "../services/strategies/mixed.js";
import { analyze } from "../services/analysis.js";
import CSVStudents from "../models/CSVStudents.js"

const router = express.Router();

router.post("/swap", async (req, res) => {
  // { arrangementId, a: {row,col}, b: {row,col} }
  const { arrangementId, a, b } = req.body;
  const arr = await Arrangement.findById(arrangementId);
  if (!arr) return res.status(404).json({ error: "Arrangement not found" });

  const key = (x) => arr.seats.find(s => s.row === x.row && s.col === x.col);
  const A = key(a), B = key(b);
  if (!A || !B) return res.status(400).json({ error: "Invalid seats" });

  [A.studentId, B.studentId] = [B.studentId, A.studentId];
  await arr.save();

  // This is the new, more detailed update logic:
  const metrics = await analyze(arr.toObject());
  const room = String(arr._id);
  req.app.locals.io.to(room).emit("arrangementUpdated", arr);
  req.app.locals.io.to(room).emit("analysisUpdated", { arrangementId: arr._id, ...metrics });

  res.json(arr);
});


router.get("/analysis/:id", async (req, res) => {
  const arr = await Arrangement.findById(req.params.id).lean();
  if (!arr) return res.status(404).json({ error: "Arrangement not found" });
  const metrics = await analyze(arr);
  res.json({ arrangementId: arr._id, ...metrics });
});


router.get('/arrangement/:id/full', async (req, res) => {
  try {
    const arrangement = await Arrangement.findById(req.params.id);
    if (!arrangement) return res.status(404).json({ error: 'Arrangement not found' });

    let students = [];
    if (arrangement.groupId) {
      const group = await CSVStudents.findById(arrangement.groupId);
      if (group) students = group.students;
    }

    const studentMap = {};
    students.forEach(s => { studentMap[s.id] = s; });

    const enrichedSeats = arrangement.seats.map(seat => {
      const student = studentMap[seat.studentId];
      return {
        row: seat.row,
        col: seat.col,
        ...(student ? {
          name: student.name,
          subject: student.subject,
          needsFront: student.needsFront,
          group: student.group
        } : {})
      };
    });

    res.json({ ...arrangement.toObject(), seats: enrichedSeats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post("/arrangement", async (req, res) => {
  console.log("POST /arrangement payload received:", req.body);

  try {
    const {
      strategy,
      rows,
      cols,
      minDistSameSubject,
      avoidDiag,
      frontRowsForNeeds,
      keepApartGroupDist,
      students: uploadedStudents,
      groupId,
      groupName // optional: name for uploaded CSV group
    } = req.body;

    let students = [];
    let finalGroupId = groupId || null;

    // Case 1: User selected an existing group
    if (groupId) {
      const group = await CSVStudents.findById(groupId);
      if (!group) return res.status(404).json({ error: "CSV group not found" });
      students = group.students;

    // Case 2: User uploaded new students CSV
    } else if (uploadedStudents && uploadedStudents.length > 0) {
      if (!groupName || groupName.trim() === "") {
        return res.status(400).json({ error: "Group name is required when uploading new students" });
      }

      // Store uploaded students as a new CSV group
      const newGroup = await CSVStudents.create({
        title: groupName.trim(),
        students: uploadedStudents.map(s => ({
          ...s,
          id: Number(s.id),
          needsFront: s.needsFront === true || s.needsFront === "true",
          group: groupName.trim()
        }))
      });

      students = newGroup.students;
      finalGroupId = newGroup._id;
    }

    if (students.length === 0) {
      return res.status(400).json({ error: "No students provided or selected" });
    }

    // Prepare input for seating algorithm
    const input = {
      rows: +rows,
      cols: +cols,
      students,
      blocked: [],
      constraints: {
        minDistSameSubject,
        avoidDiag,
        frontRowsForNeeds,
        keepApartGroupDist
      }
    };

    const seats = strategy === "mixed" ? mixedStrategy(input) : linearStrategy(input);

    // Save arrangement
    const arrangement = await Arrangement.create({
      strategy,
      rows: +rows,
      cols: +cols,
      seats,
      constraints: input.constraints,
      groupId: finalGroupId
    });

    // Emit updates via Socket.IO
    req.app.locals.io.to(String(arrangement._id)).emit("arrangementUpdated", arrangement);

    res.json(arrangement);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate arrangement" });
  }
});




export default router;
