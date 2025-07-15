// Greedy graph coloring + checkerboard mapping
import { manhattan } from "../constraints.js";

export const mixedStrategy = ({ rows, cols, students, blocked, constraints }) => {
  const { minDistSameSubject, keepApartGroupDist } = constraints;
  // Build conflict graph (edge if same subject close or same group)
  const n = students.length, adj = Array.from({ length: n }, () => new Set());
  const byIdx = new Map(students.map((s, i) => [s.id, i]));

  const conflict = (a, b) => {
    if (a.subject === b.subject && minDistSameSubject >= 1) return true;
    if (keepApartGroupDist > 0 && a.group && a.group === b.group) return true;
    return false;
  };

  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      if (conflict(students[i], students[j])) { adj[i].add(j); adj[j].add(i); }

  // Greedy coloring (DSATUR-ish lite)
  const color = Array(n).fill(-1);
  const order = [...Array(n).keys()].sort((a, b) => adj[b].size - adj[a].size);
  for (const u of order) {
    const used = new Set(); for (const v of adj[u]) if (color[v] !== -1) used.add(color[v]);
    let c = 0; while (used.has(c)) c++; color[u] = c;
  }
  const colors = Math.max(...color) + 1;

  // Checkerboard-like mapping of color classes onto grid cells
  const blockedKey = new Set(blocked.map(b => `${b.row},${b.col}`));
  const seats = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
    if (!blockedKey.has(`${r},${c}`)) seats.push({ row: r, col: c });
  seats.sort((a,b)=> (a.row%2===0 ? a.col : -a.col) - (b.row%2===0 ? b.col : -b.col)); // snake order

  const byColor = Array.from({ length: colors }, () => []);
  students.forEach((s,i)=> byColor[color[i]].push(s));
  const placement = [];
  let si = 0;
  for (let k = 0; k < colors; k++) {
    for (const stu of byColor[k]) {
      if (si >= seats.length) break;
      placement.push({ ...seats[si++], studentId: stu.id });
    }
  }
  return placement;
};
