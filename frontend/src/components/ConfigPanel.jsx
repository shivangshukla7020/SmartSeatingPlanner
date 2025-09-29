import React, { useState } from "react";

const ConfigPanel = ({ onGenerate }) => {
  const [strategy, setStrategy] = useState("linear");
  const [rows, setRows] = useState("6");
  const [cols, setCols] = useState("8");
  const [minDist, setMinDist] = useState("1");
  const [avoidDiag, setAvoidDiag] = useState(true);
  const [frontRows, setFrontRows] = useState("1");
  const [groupDist, setGroupDist] = useState("0");

  const handleGenerate = () => {
    onGenerate({
      strategy,
      rows: Number(rows),
      cols: Number(cols),
      minDistSameSubject: Number(minDist),
      avoidDiag,
      frontRowsForNeeds: Number(frontRows),
      keepApartGroupDist: Number(groupDist),
    });
  };

  return (
    <div className="panel">
      <h3>Strategy & Constraints</h3>

      <label>
        Strategy
        <select value={strategy} onChange={e => setStrategy(e.target.value)}>
          <option value="linear">Linear</option>
          <option value="mixed">Mixed</option>
        </select>
      </label>

      <label>
        Rows
        <input type="number" value={rows} onChange={e => setRows(e.target.value)} />
      </label>

      <label>
        Cols
        <input type="number" value={cols} onChange={e => setCols(e.target.value)} />
      </label>

      <label>
        Min Dist (same subject)
        <input type="number" value={minDist} onChange={e => setMinDist(e.target.value)} />
      </label>

      <label>
        <input type="checkbox" checked={avoidDiag} onChange={e => setAvoidDiag(e.target.checked)} /> 
        Avoid Diagonal
      </label>

      <label>
        Front Rows for Needs
        <input type="number" value={frontRows} onChange={e => setFrontRows(e.target.value)} />
      </label>

      <label>
        Keep Apart Group Dist
        <input type="number" value={groupDist} onChange={e => setGroupDist(e.target.value)} />
      </label>

      <button onClick={handleGenerate}>Generate</button>
    </div>
  );
}

export default ConfigPanel;