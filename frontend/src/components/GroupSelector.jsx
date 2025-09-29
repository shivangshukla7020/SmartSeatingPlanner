import React, { useEffect, useState } from "react";
import { getCSVGroups } from "../lib/api";

const GroupSelector = ({ setSelectedGroupId }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getCSVGroups();
        setGroups(res.data.groups || []);
      } catch (err) {
        console.error("Error fetching groups:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <label>Select Group: </label>
      {loading ? (
        <span>Loading...</span>
      ) : (
        <select onChange={(e) => setSelectedGroupId(e.target.value)}>
          <option value="">-- Choose a group --</option>
          {groups.map((g) => (
            <option key={g._id} value={g._id}>
              {g.name} ({g._id})
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default GroupSelector;