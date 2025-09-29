import React from "react";
import SeatCard from "./SeatCard";
import "./../styles.css";

const GridView = ({ rows, cols, seats, blocked, onSwapStart, onSwapDrop }) =>{
  const blockedKey = new Set(blocked.map(b => `${b.row},${b.col}`));
  const seatMap = new Map(seats.map(s => [`${s.row},${s.col}`, s]));

  const grid = [];
  for (let r=0; r<rows; r++){
    const row = [];
    for (let c=0; c<cols; c++){
      const key = `${r},${c}`;
      const s = seatMap.get(key);
      row.push(
        <SeatCard
          key={key}
          row={r} col={c}
          blocked={blockedKey.has(key)}
          seat={s}
          onSwapStart={onSwapStart}
          onSwapDrop={onSwapDrop}
        />
      );
    }
    grid.push(<div className="grid-row" key={r}>{row}</div>);
  }
  return <div className="grid">{grid}</div>;
}

export default GridView;
