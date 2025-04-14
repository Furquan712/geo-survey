"use client";

import { useState } from "react";

export default function AssignSurvey() {
  const [templateId, setTemplateId] = useState("");
  const [agentIds, setAgentIds] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Split and trim agent IDs (entered as comma-separated values)
    const agents = agentIds.split(",").map(id => id.trim()).filter(Boolean);
    const res = await fetch("/api/survey-template/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateId,
        agentIds: agents,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Assigned successfully!");
      setTemplateId("");
      setAgentIds("");
    } else {
      setMessage(data.error || "Error in assignment.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Assign Survey Template to Agents</h2>
        {message && <p className="mb-4">{message}</p>}
        <div className="mb-4">
          <label className="block mb-1">Template ID</label>
          <input
            type="text"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="w-full p-2 rounded bg-gray-700"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1">Agent IDs (comma separated)</label>
          <input
            type="text"
            value={agentIds}
            onChange={(e) => setAgentIds(e.target.value)}
            className="w-full p-2 rounded bg-gray-700"
            required
          />
        </div>
        <button type="submit" className="w-full bg-black py-2 rounded hover:bg-gray-600 transition">
          Assign Template
        </button>
      </form>
    </div>
  );
}
