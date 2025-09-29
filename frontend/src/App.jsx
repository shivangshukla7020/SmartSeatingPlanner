import React, { useState, useEffect, useMemo } from "react";
import GridView from "./components/GridView";
import ConfigPanel from "./components/ConfigPanel";
import AnalysisCards from "./components/AnalysisCards";
import CSVUpload from "./components/CSVupload";
import GroupSelector from "./components/GroupSelector";
import { createArrangement, getStudents, postSwap, getAnalysis } from "./lib/api";

import { socket } from "./lib/socket";

export default function App() {
  const [arr, setArr] = useState(null); // Receives arrangement from backend
  const [metrics, setMetrics] = useState(null);
  const [students, setStudents] = useState([]);
  const [dragFrom, setDragFrom] = useState(null);
  const [uploadedStudents, setUploadedStudents] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null); // group id from CSV


  useEffect(() => {
    if (!selectedGroupId) return; // wait until groupId is chosen
    (async () => {
      const { data } = await getStudents(selectedGroupId);
      setStudents(data);
    })();
  }, [selectedGroupId]);


  useEffect(() => {
    if (!arr?._id) return;
    const room = arr._id;

    socket.emit("joinArrangement", { arrangementId: room });

    const onArrUpdate = (payload) => {
      if (payload?._id === room) setArr(payload);
    };
    const onAnalysis = (payload) => {
      if (payload?.arrangementId === room) setMetrics(payload);
    };

    socket.on("arrangementUpdated", onArrUpdate);
    socket.on("analysisUpdated", onAnalysis);

    (async () => {
      const { data } = await getAnalysis(room);
      setMetrics(data);
    })();

    return () => {
      socket.emit("leaveArrangement", { arrangementId: room });
      socket.off("arrangementUpdated", onArrUpdate);
      socket.off("analysisUpdated", onAnalysis);
    };
  }, [arr?._id]);

  
  const enrichSeats = useMemo(() => {
    if (!arr) return [];
    const allStudents = uploadedStudents.length ? uploadedStudents : students; // students from CSV or DB
    return arr.seats.map((s) => {
      const student = allStudents.find(st => st.id === s.studentId);
      return {
        ...s,
        name: student ? student.name : `#${s.studentId}`,
        subject: student ? student.subject : "?"
      };
    });
  }, [arr, uploadedStudents, students]);


  const onGenerate = async (config) => {
    try {
      const payload = {
        ...config,
        students: uploadedStudents.length ? uploadedStudents : undefined,
        groupId: selectedGroupId || undefined
      };
      console.log("Payload being sent:", uploadedStudents);
      const { data } = await createArrangement(payload); // use POST instead of GET
      setArr(data);
    } catch (err) {
      console.error(err);
    }
  };



  const onSwapStart = (e, seat) => setDragFrom(seat);

  const onSwapDrop = async (e, to) => {
    if (!dragFrom || !arr) return;

    setArr(prev => {
      const next = structuredClone(prev);
      const A = next.seats.find(s => s.row === dragFrom.row && s.col === dragFrom.col);
      const B = next.seats.find(s => s.row === to.row && s.col === to.col);
      if (A && B) [A.studentId, B.studentId] = [B.studentId, A.studentId];
      return next;
    });

    await postSwap({ arrangementId: arr._id, a: dragFrom, b: to });
    setDragFrom(null);
  };

  return (
    <div className="container">
      <h1>Smart Seating Planner</h1>
      <CSVUpload
        onStudentsLoaded={setUploadedStudents}
        setSelectedGroupId={setSelectedGroupId}
      />

      <GroupSelector 
        setSelectedGroupId={setSelectedGroupId} 
      />

      <ConfigPanel onGenerate={onGenerate}/>
      {arr && <AnalysisCards metrics={metrics}/>}
      {arr && (
        <GridView
          rows={arr.rows}
          cols={arr.cols}
          seats={enrichSeats}
          blocked={[]}
          onSwapStart={onSwapStart}
          onSwapDrop={onSwapDrop}
        />
      )}
    </div>
  );
}
