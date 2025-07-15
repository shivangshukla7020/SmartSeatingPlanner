import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/" });

// POST: generate arrangement (with CSV students or MongoDB/default students)
export const createArrangement = (payload) => API.post("/arrangement", payload);

// GET: students from a specific CSV group
export const getStudents = async (groupId) => {
  if (!groupId) throw new Error("groupId is required to fetch students");
  const res = await API.get(`/csv/group/${groupId}`);
  return { data: res.data.students };
};

// POST: swap two seats
export const postSwap = (payload) => API.post("/swap", payload);

// GET: analysis metrics for a given arrangement
export const getAnalysis = (id) => API.get(`/analysis/${id}`);

// CSV Upload
export const uploadCSV = (formData) => API.post("/csv/upload", formData);

// GET: previously uploaded CSV groups
export const getCSVGroups = () => API.get("/csv/groups");
