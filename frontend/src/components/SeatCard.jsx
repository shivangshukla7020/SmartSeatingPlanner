import React from "react";

const subjectColor = (sub) => ({
  Math: "#e0f2ff",
  Physics: "#eaf7ea",
  Chemistry: "#fff1e6"
}[sub] || "#f2f2f2");

const SeatCard = ({ row, col, blocked, seat, onSwapStart, onSwapDrop }) => {
  const draggable = !!seat?.studentId && !blocked;

  return (
    <div
      className={`seat ${blocked ? "blocked" : ""}`}
      style={{ background: blocked ? "#333" : subjectColor(seat?.subject) }}
      draggable={draggable}
      onDragStart={(e)=> draggable && onSwapStart(e, { row, col })}
      onDragOver={(e)=> e.preventDefault()}
      onDrop={(e)=> onSwapDrop(e, { row, col })}
      title={seat?.name ? `${seat.name} • ${seat.subject}` : blocked ? "Blocked" : "Empty"}
    >
      <div className="seat-label">
        {blocked ? "X" : seat?.name || "-"}
      </div>
      <div className="seat-sub">{seat?.subject || ""}</div>
    </div>
  );
}

export default SeatCard;
