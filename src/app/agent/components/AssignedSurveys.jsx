"use client";

import { useEffect, useState } from "react";

export default function AgentAssignedSurveys() {
  const [surveys, setSurveys] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSurveys = async () => {
      const res = await fetch("/api/survey-template/assigned");
      const data = await res.json();
      if (res.ok) {
        setSurveys(data.surveys);
      } else {
        setError(data.error || "Failed to load surveys.");
      }
    };
    fetchSurveys();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-white mb-4">Assigned Surveys</h2>
      {error && <p className="text-red-400">{error}</p>}
      {surveys.length === 0 && <p className="text-gray-300">No surveys assigned.</p>}
      <ul className="text-white">
        {surveys.map((survey) => (
          <li key={survey.templateId} className="mb-2 p-2 border-b border-gray-700">
            <p className="font-semibold">{survey.name}</p>
            <p className="text-sm">Template ID: {survey.templateId}</p>
            {survey.questions && survey.questions.length > 0 && (
              <ul className="list-disc ml-4">
                {survey.questions.map((q, idx) => (
                  <li key={idx} className="text-sm">{q}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
