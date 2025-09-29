import CSVStudents from "../models/CSVStudents.js";

export const analyze = async (arrangement) => {
  const { seats, constraints, rows, groupId } = arrangement;
  const { minDistSameSubject, avoidDiag, frontRowsForNeeds } = constraints;

  // Fetch students based on groupId if present
  let students = [];
  if (groupId) {
    const group = await CSVStudents.findById(groupId).lean();
    if (group) students = group.students;
  } else {
    // fallback: use seats info to create demo students
    students = seats.map(s => ({
      id: s.studentId,
      name: s.name || `#${s.studentId}`,
      subject: s.subject || "?",
      needsFront: s.needsFront || false,
      group: s.group || ""
    }));
  }

  const byId = new Map(students.map(s => [s.id, s]));
  const seatById = new Map(seats.map(s => [s.studentId, s]));

  // needsFront % satisfied
  const needs = students.filter(s => s.needsFront);
  const satisfied = needs.filter(s => (seatById.get(s.id)?.row ?? rows) < frontRowsForNeeds).length;
  const needsFrontPct = needs.length ? Math.round((satisfied / needs.length) * 100) : 100;

  // average distance between same-subject seated pairs
  const samePairs = [];
  for (let i = 0; i < seats.length; i++) {
    for (let j = i + 1; j < seats.length; j++) {
      const a = byId.get(seats[i].studentId), b = byId.get(seats[j].studentId);
      if (!a || !b || a.subject !== b.subject) continue;
      const d = Math.abs(seats[i].row - seats[j].row) + Math.abs(seats[i].col - seats[j].col);
      samePairs.push(d);
    }
  }
  const avgSameSubjectDist = samePairs.length
    ? (samePairs.reduce((x,y)=>x+y,0) / samePairs.length).toFixed(2)
    : "N/A";

  // simple violation count (adjacent same-subject if minDistSameSubject >=1, plus optional diagonal)
  let violations = 0;
  const key = new Map(seats.map(s => [`${s.row},${s.col}`, s]));
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const diags = [[1,1],[1,-1],[-1,1],[-1,-1]];
  for (const s of seats) {
    const A = byId.get(s.studentId);
    for (const [dr, dc] of dirs) {
      const nb = key.get(`${s.row+dr},${s.col+dc}`);
      if (!nb) continue;
      const B = byId.get(nb.studentId);
      if (A && B && A.subject === B.subject && minDistSameSubject >= 1) violations++;
    }
    if (avoidDiag) {
      for (const [dr, dc] of diags) {
        const nb = key.get(`${s.row+dr},${s.col+dc}`);
        if (!nb) continue;
        const B = byId.get(nb.studentId);
        if (A && B && A.subject === B.subject) violations++;
      }
    }
  }

  return { needsFrontPct, avgSameSubjectDist, violations };
};
