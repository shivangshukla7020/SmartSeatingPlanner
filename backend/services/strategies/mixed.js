// Greedy graph coloring + checkerboard mapping with front-row needs
import { manhattan } from "../constraints.js";

export const mixedStrategy = ({ rows, cols, students, blocked, constraints }) => {
  const { minDistSameSubject, keepApartGroupDist, frontRowsForNeeds } = constraints;

  const n = students.length;
  const adj = Array.from({ length: n }, () => new Set());

  // Build conflict graph
  const conflict = (a, b) => {
    if (a.subject === b.subject && minDistSameSubject >= 1) return true;
    if (keepApartGroupDist > 0 && a.group && a.group === b.group) return true;
    return false;
  };

  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      if (conflict(students[i], students[j])) { adj[i].add(j); adj[j].add(i); }

  // Greedy coloring
  const color = Array(n).fill(-1);
  const order = [...Array(n).keys()].sort((a, b) => adj[b].size - adj[a].size);
  for (const u of order) {
    const used = new Set();
    for (const v of adj[u]) if (color[v] !== -1) used.add(color[v]);
    let c = 0;
    while (used.has(c)) c++;
    color[u] = c;
  }

  const colors = Math.max(...color) + 1;

  // Checkerboard-like mapping of seats
  const blockedKey = new Set(blocked.map(b => `${b.row},${b.col}`));
  let seats = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (!blockedKey.has(`${r},${c}`)) seats.push({ row: r, col: c });

  // Snake order for spacing
  seats.sort((a, b) => (a.row % 2 === 0 ? a.col : -a.col) - (b.row % 2 === 0 ? b.col : -b.col));

  // Split seats: front rows reserved for needsFront students
  const frontSeats = seats.filter(s => s.row < frontRowsForNeeds);
  const backSeats = seats.filter(s => s.row >= frontRowsForNeeds);

  const needsFrontStudents = students.filter(s => s.needsFront);
  const regularStudents = students.filter(s => !s.needsFront);

  // Combine students back with coloring
  const byColor = Array.from({ length: colors }, () => []);
  needsFrontStudents.concat(regularStudents).forEach((s, i) => byColor[color[i]].push(s));

  // Interleave students from all colors
  const placement = [];
  const colorPointers = Array(colors).fill(0);

  const assignSeats = (seatList) => {
    for (let si = 0; si < seatList.length; si++) {
      let placed = false;
      for (let offset = 0; offset < colors; offset++) {
        const c = (si + offset) % colors;
        if (colorPointers[c] < byColor[c].length) {
          const stu = byColor[c][colorPointers[c]++];
          placement.push({ ...seatList[si], studentId: stu.id });
          placed = true;
          break;
        }
      }
      if (!placed) break;
    }
  };

  assignSeats(frontSeats); // fill front rows first
  assignSeats(backSeats);  // fill remaining seats

  return placement;
};
