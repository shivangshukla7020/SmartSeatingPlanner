import React from "react";

export default function AnalysisCards({ metrics }) {
  if (!metrics) return null;
  return (
    <div className="analysis">
      <div className="card">Needs Front Satisfied: <b>{metrics.needsFrontPct}%</b></div>
      <div className="card">Avg Same-Subject Distance: <b>{metrics.avgSameSubjectDist}</b></div>
      <div className="card">Violations (adjacent-like): <b>{metrics.violations}</b></div>
    </div>
  );
}
