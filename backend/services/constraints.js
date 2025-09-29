// Manhattan distance
export const manhattan = (a, b) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col);

export const violatesSubjectDist = (seatMap, seat, student, studentsById, minDist, avoidDiag) => {
  if (minDist <= 0) return false;
  for (const s of seatMap) {
    if (s.studentId == null) continue;
    const other = studentsById.get(s.studentId);
    if (!other || other.subject !== student.subject) continue;
    if (manhattan(seat, s) <= minDist) return true;
    if (avoidDiag) {
      const diagClose = Math.abs(seat.row - s.row) === 1 && Math.abs(seat.col - s.col) === 1;
      if (diagClose) return true;
    }
  }
  return false;
};

export const violatesGroupDist = (seatMap, seat, student, studentsById, dist) => {
  if (!student.group || dist <= 0) return false;
  for (const s of seatMap) {
    if (s.studentId == null) continue;
    const other = studentsById.get(s.studentId);
    if (!other || other.group !== student.group) continue;
    if (manhattan(seat, s) < dist) return true;
  }
  return false;
};
