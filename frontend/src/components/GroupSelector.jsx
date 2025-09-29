import React, { useEffect, useState } from "react";
import { getCSVGroups } from "../lib/api";

const GroupSelector = ({ setSelectedGroupId }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null); // track selected group

  useEffect(() => {
    (async () => {
      try {
        const res = await getCSVGroups();
        setGroups(res.data || []); // res.data is an array of groups
      } catch (err) {
        console.error("Error fetching groups:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelect = (groupId) => {
    setSelectedGroup(groupId);
    setSelectedGroupId(groupId); // notify parent
  };

  if (loading) return <p>Loading groups...</p>;
  if (groups.length === 0) return <p>No previous groups found.</p>;

  return (
    <div>
      <h3>Choose from previous groups</h3>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {groups.map((g) => (
          <button
            key={g._id}
            onClick={() => handleSelect(g._id)}
            style={{
              padding: "8px 12px",
              cursor: "pointer",
              borderRadius: "4px",
              border: selectedGroup === g._id ? "2px solid #007BFF" : "1px solid #ccc",
              background: selectedGroup === g._id ? "#cce5ff" : "#f0f0f0",
              fontWeight: selectedGroup === g._id ? "bold" : "normal"
            }}
          >
            {g.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GroupSelector;
