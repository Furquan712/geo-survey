"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

function SurveyCard({ survey, onFillSurvey, onDayReport }) {
  const [submissionCount, setSubmissionCount] = useState(0);

  useEffect(() => {
    async function fetchCount() {
      const res = await fetch(
        `/api/survey-template/submission-count?templateId=${survey.templateId}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (res.ok) {
        setSubmissionCount(data.count);
      }
    }
    fetchCount();
  }, [survey.templateId]);

  return (
    <div className="bg-gray-800 p-4 rounded shadow hover:shadow-lg cursor-pointer">
      <h2 className="text-xl font-semibold">{survey.name}</h2>
      <p className="text-sm">Template ID: {survey.templateId}</p>
      <p className="text-sm mt-2">Submissions: {submissionCount}</p>
      <div className="flex space-x-2 mt-4">
        <button
          className="bg-blue-600 px-3 py-1 text-sm rounded hover:bg-blue-700 transition"
          onClick={() => onFillSurvey(survey)}
        >
          Fill Survey
        </button>
        <button
          className="bg-green-600 px-3 py-1 text-sm rounded hover:bg-green-700 transition"
          onClick={() => onDayReport(survey)}
        >
          Day Report
        </button>
      </div>
    </div>
  );
}

export default function AgentDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [surveys, setSurveys] = useState([]);
  const [error, setError] = useState("");
  // State for survey form modal
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [surveyFormData, setSurveyFormData] = useState({});
  // State for day report modal
  const [selectedDayReportSurvey, setSelectedDayReportSurvey] = useState(null);
  const [dayReportData, setDayReportData] = useState("");
  const [dayReportLoading, setDayReportLoading] = useState(false);

  // Protect route: only allow AGENT users.
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "AGENT") {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  // Fetch assigned surveys.
  useEffect(() => {
    async function fetchSurveys() {
      const res = await fetch("/api/survey-template/assigned");
      const data = await res.json();
      if (res.ok) {
        setSurveys(data.surveys);
      } else {
        setError(data.error || "Error fetching surveys");
      }
    }
    fetchSurveys();
  }, []);

  /* ----- Survey Form Modal Handlers ----- */
  const openSurveyModal = (survey) => {
    // Check if survey has questions
    if (!survey.questions) {
      console.error("Survey template missing questions", survey);
      return;
    }
    setSelectedSurvey(survey);
    // IMPORTANT: Use question.text as the key instead of the entire object.
    const initData = {};
    survey.questions.forEach((q) => {
      initData[q.text] = "";
    });
    setSurveyFormData(initData);
  };

  function getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            reject(error);
          }
        );
      } else {
        reject(new Error('Geolocation is not supported.'));
      }
    });
  }
  

  const closeSurveyModal = () => {
    setSelectedSurvey(null);
    setSurveyFormData({});
  };

  const handleSurveyFieldChange = (questionText, value) => {
    setSurveyFormData((prev) => ({ ...prev, [questionText]: value }));
  };

  const handleSurveySubmit = async (e) => {
    e.preventDefault();

    let location = {};
    try {
      location = await getCurrentLocation();
    } catch (error) {
      console.error("Location access denied or not available:", error);
      // Optionally, handle the error or proceed without location data.
    }

    const submissionData = {
      adminId: selectedSurvey.adminId,
      agentId: session.user.id,
      formName: selectedSurvey.name,
      templateId: selectedSurvey.templateId,
      date: new Date().toISOString(),
      formData: surveyFormData,
      location,
    };

    const res = await fetch("/api/survey-template/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submissionData),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Survey submitted successfully!");
      closeSurveyModal();
    } else {
      alert("Submission failed: " + (data.error || "Unknown error"));
    }
  };

  /* ----- Day Report Modal Handlers ----- */
  // Helper: Get today's date in YYYY-MM-DD format.
  const getTodayString = () => new Date().toISOString().slice(0, 10);

  const openDayReportModal = async (survey) => {
    setSelectedDayReportSurvey(survey);
    setDayReportLoading(true);
    const today = getTodayString();
    const res = await fetch(
      `/api/survey-template/day-report?templateId=${survey.templateId}&date=${today}`,
      { credentials: "include" }
    );
    const data = await res.json();
    if (res.ok && data.report) {
      setDayReportData(data.report.reportData);
    } else {
      setDayReportData("");
    }
    setDayReportLoading(false);
  };

  const closeDayReportModal = () => {
    setSelectedDayReportSurvey(null);
    setDayReportData("");
  };

  const handleDayReportChange = (value) => {
    setDayReportData(value);
  };

  const handleDayReportSubmit = async (e) => {
    e.preventDefault();
    const today = getTodayString();
    const reportData = {
      adminId: selectedDayReportSurvey.adminId,
      agentId: session.user.id,
      templateId: selectedDayReportSurvey.templateId,
      formName: selectedDayReportSurvey.name,
      date: today,
      reportData: dayReportData,
    };
    const res = await fetch("/api/survey-template/day-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reportData),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Day report saved successfully!");
      closeDayReportModal();
    } else {
      alert("Error saving report: " + (data.error || "Unknown error"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 relative">
      <h1 className="text-3xl font-bold mb-4">Agent Dashboard</h1>
      <button
         onClick={() => signOut({ callbackUrl: "/auth/signin" })}
        className="bg-black px-4 py-2 rounded mb-8 hover:bg-gray-800 transition"
      >
        Sign Out
      </button>

      {error && <p className="text-red-400 mb-4">{error}</p>}
      {surveys.length === 0 ? (
        <p className="text-gray-300">No surveys assigned.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {surveys.map((survey) => (
            <SurveyCard
              key={survey.templateId}
              survey={survey}
              onFillSurvey={openSurveyModal}
              onDayReport={openDayReportModal}
            />
          ))}
        </div>
      )}

      {/* Survey Form Modal (Popup) */}
      {selectedSurvey && selectedSurvey.questions && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={closeSurveyModal}
          ></div>
          {/* Modal Content */}
          <div className="bg-gray-800 p-6 rounded z-10 w-11/12 md:w-1/2 lg:w-1/3 relative">
            <button
              className="text-white font-bold absolute top-2 right-2"
              onClick={closeSurveyModal}
            >
              X
            </button>
            <h2 className="text-2xl font-bold mb-4">
              {selectedSurvey.name} Survey Form
            </h2>
            <form onSubmit={handleSurveySubmit}>
              {selectedSurvey.questions.map((question, idx) => (
                <div key={idx} className="mb-4">
                  <label className="block text-sm mb-1">
                    {question.text}
                  </label>
                  {question.type === "short" && (
                    <input
                      type="text"
                      value={surveyFormData[question.text] || ""}
                      onChange={(e) =>
                        handleSurveyFieldChange(question.text, e.target.value)
                      }
                      className="w-full p-2 rounded bg-gray-700 focus:outline-none"
                      required
                    />
                  )}
                  {question.type === "long" && (
                    <textarea
                      value={surveyFormData[question.text] || ""}
                      onChange={(e) =>
                        handleSurveyFieldChange(question.text, e.target.value)
                      }
                      className="w-full p-2 rounded bg-gray-700 focus:outline-none"
                      required
                    ></textarea>
                  )}
                  {question.type === "multiple" && (
                    <div>
                      {question.options.map((option, i) => (
                        <label key={i} className="block">
                          <input
                            type="radio"
                            name={question.text}
                            value={option}
                            checked={surveyFormData[question.text] === option}
                            onChange={(e) =>
                              handleSurveyFieldChange(
                                question.text,
                                e.target.value
                              )
                            }
                            className="mr-2"
                            required
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  )}
                  {question.type === "checkbox" && (
                    <div>
                      {question.options.map((option, i) => (
                        <label key={i} className="block">
                          <input
                            type="checkbox"
                            value={option}
                            checked={
                              surveyFormData[question.text]
                                ? surveyFormData[question.text].includes(
                                    option
                                  )
                                : false
                            }
                            onChange={(e) => {
                              const current =
                                surveyFormData[question.text] || [];
                              if (e.target.checked) {
                                handleSurveyFieldChange(question.text, [
                                  ...current,
                                  option,
                                ]);
                              } else {
                                handleSurveyFieldChange(
                                  question.text,
                                  current.filter((o) => o !== option)
                                );
                              }
                            }}
                            className="mr-2"
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  )}
                  {question.type === "dropdown" && (
                    <select
                      value={surveyFormData[question.text] || ""}
                      onChange={(e) =>
                        handleSurveyFieldChange(question.text, e.target.value)
                      }
                      className="w-full p-2 rounded bg-gray-700 focus:outline-none"
                      required
                    >
                      <option value="">-- Select an option --</option>
                      {question.options.map((option, i) => (
                        <option key={i} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                  {question.type === "date" && (
                    <input
                      type="date"
                      value={surveyFormData[question.text] || ""}
                      onChange={(e) =>
                        handleSurveyFieldChange(question.text, e.target.value)
                      }
                      className="w-full p-2 rounded bg-gray-700 focus:outline-none"
                      required
                    />
                  )}
                </div>
              ))}
              <button
                type="submit"
                className="w-full bg-black text-white py-2 rounded hover:bg-gray-600 transition"
              >
                Submit Survey
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Day Report Modal */}
      {selectedDayReportSurvey && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={closeDayReportModal}
          ></div>
          <div className="bg-gray-800 p-6 rounded z-10 w-11/12 md:w-1/2 lg:w-1/3 relative">
            <button
              className="text-white font-bold absolute top-2 right-2"
              onClick={closeDayReportModal}
            >
              X
            </button>
            <h2 className="text-2xl font-bold mb-4">
              {selectedDayReportSurvey.name} – Day Report ({getTodayString()})
            </h2>
            {dayReportLoading ? (
              <p>Loading report data...</p>
            ) : (
              <form onSubmit={handleDayReportSubmit}>
                <div className="mb-4">
                  <label className="block text-sm mb-1">
                    Report Details
                  </label>
                  <textarea
                    value={dayReportData}
                    onChange={(e) => handleDayReportChange(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 focus:outline-none"
                    rows="4"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-black text-white py-2 rounded hover:bg-gray-600 transition"
                >
                  Save Report
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
