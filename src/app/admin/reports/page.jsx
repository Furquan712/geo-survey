"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [agents, setAgents] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedSurvey, setSelectedSurvey] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState("");

  // Protect route: only allow admin
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  // Fetch agent list
  useEffect(() => {
    async function fetchAgents() {
      const res = await fetch("/api/reports/agents");
      const data = await res.json();
      if (res.ok) {
        setAgents(data.agents);
      } else {
        setError(data.error || "Error fetching agents.");
      }
    }
    fetchAgents();
  }, []);

  // Fetch survey list
  useEffect(() => {
    async function fetchSurveys() {
      const res = await fetch("/api/reports/surveys");
      const data = await res.json();
      if (res.ok) {
        setSurveys(data.surveys);
      } else {
        setError(data.error || "Error fetching surveys.");
      }
    }
    fetchSurveys();
  }, []);

  // Fetch submissions based on selected agent and survey
  const fetchSubmissions = async () => {
    if (!selectedSurvey || selectedAgent === "") {
      console.error("Survey or agent not selected", { selectedSurvey, selectedAgent });
      setError("Please select both an agent and a survey");
      return;
    }
    
    // Log the values and constructed URL for debugging.
    const queryParams = new URLSearchParams({
      templateId: selectedSurvey,
      agentId: selectedAgent,
    });
    const url = `/api/reports/submissions?${queryParams.toString()}`;
    console.log("Fetching submissions from:", url);
  
    const res = await fetch(url);
    const data = await res.json();
    if (res.ok) {
      setSubmissions(data.submissions);
    } else {
      setError(data.error || "Error fetching submissions.");
    }
  };
  
  

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Survey Data</h1>
        <button
           onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          className="bg-black px-4 py-2 rounded hover:bg-gray-800 transition"
        >
          Sign Out
        </button>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 mb-8">
        <div>
          <label className="block text-sm mb-1">Select Agent</label>
          <select
  value={selectedAgent}
  onChange={(e) => setSelectedAgent(e.target.value)}
  className="w-full p-2 rounded bg-gray-700"
>
  <option value="">-- Select Agent --</option>
  <option value="all">All Agents</option>
  {agents.map((agent) => (
    <option key={agent.agentId} value={agent.agentId}>
      {agent.name} ({agent.email})
    </option>
  ))}
</select>

        </div>
        <div>
          <label className="block text-sm mb-1">Select Survey</label>
          <select
            value={selectedSurvey}
            onChange={(e) => setSelectedSurvey(e.target.value)}
            className="w-full p-2 rounded bg-gray-700"
          >
            <option value="">-- Select Survey --</option>
            {surveys.map((survey) => (
              <option key={survey.templateId} value={survey.templateId}>
                {survey.formName} (ID: {survey.templateId})
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={fetchSubmissions}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Fetch Reports
          </button>
        </div>
      </div>

      {submissions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 rounded">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b border-gray-600 text-left">Date</th>
                <th className="px-4 py-2 border-b border-gray-600 text-left">Form Data</th>
                <th className="px-4 py-2 border-b border-gray-600 text-left">Location</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub._id}>
                  <td className="px-4 py-2 border-b border-gray-700">
                    {new Date(sub.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-700">
                    {Object.entries(sub.formData).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-semibold">{key}:</span> {value}
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-700">
                    {sub.location ? (
                      <>
                        <div>Lat: {sub.location.latitude}</div>
                        <div>Lng: {sub.location.longitude}</div>
                      </>
                    ) : (
                      "N/A"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-300">No submissions found for selected filters.</p>
      )}
    </div>
  );
}
