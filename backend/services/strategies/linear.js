import { violatesSubjectDist, violatesGroupDist } from "../constraints.js";

export const linearStrategy = ({ rows, cols, students, blocked, constraints }) => {
  const { minDistSameSubject, avoidDiag, frontRowsForNeeds, keepApartGroupDist } = constraints;
  const blockedKey = new Set(blocked.map(b => `${b.row},${b.col}`));
  const grid = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
    grid.push({ row: r, col: c, studentId: null, blocked: blockedKey.has(`${r},${c}`) });

  const studentsById = new Map(students.map(s => [s.id, s]));
  const frontSeats = grid.filter(s => !s.blocked && s.row < frontRowsForNeeds);
  const otherSeats = grid.filter(s => !s.blocked && s.row >= frontRowsForNeeds);

  const needsFront = students.filter(s => s.needsFront);
  const normal = students.filter(s => !s.needsFront);

  const place = (list, seats) => {
    for (const stu of list) {
      for (const seat of seats) {
        if (seat.studentId != null) continue;
        if (violatesSubjectDist(grid, seat, stu, studentsById, minDistSameSubject, avoidDiag)) continue;
        if (violatesGroupDist(grid, seat, stu, studentsById, keepApartGroupDist)) continue;
        seat.studentId = stu.id;
        break;
      }
    }
  };

  place(needsFront, frontSeats);
  place(normal, [...frontSeats, ...otherSeats]); // fill remaining
  return grid.filter(s => s.studentId != null).map(({ row, col, studentId }) => ({ row, col, studentId }));
};
