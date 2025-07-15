import React from "react";
import Papa from "papaparse";

export default function CSVUpload({ onStudentsLoaded }) {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data.map((s) => ({
          ...s,
          id: Number(s.id),
          needsFront: s.needsFront === "true"
        }));
        onStudentsLoaded(parsed); // update App.jsx state
      },
    });
  };

  return (
    <div>
      <label>Upload Students CSV: </label>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
    </div>
  );
}
