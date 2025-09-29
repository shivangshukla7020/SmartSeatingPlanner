import React, { useState } from "react";
import Papa from "papaparse";
import { uploadCSV } from "../lib/api";

const CSVUpload = ({ onStudentsLoaded, setSelectedGroupId }) =>{
  const [groupName, setGroupName] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !groupName.trim()) {
      alert("Please provide a group name and CSV file!");
      return;
    }

    // Parse CSV file first
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsed = results.data.map((s) => ({
          ...s,
          id: Number(s.id),
          needsFront: s.needsFront === "true",
        }));

        onStudentsLoaded(parsed);

        // send file + groupName to backend
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", groupName);

        try {
          const res = await uploadCSV(formData);
          // backend returns saved group (_id + name)
          setSelectedGroupId(res.data.group._id);
          alert(`CSV uploaded successfully for group: ${res.data.group.name}`);
        } catch (err) {
          console.error("Error uploading CSV:", err);
          alert("Upload failed. Check console.");
        }
      },
    });
  };

  return (
    <div>
      <label>Group Name: </label>
      <input
        type="text"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        placeholder="Enter group name"
      />
      <br />

      <label>Upload Students CSV: </label>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
    </div>
  );
}

export default CSVUpload;