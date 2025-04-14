"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateSurveyTemplate() {
  const [templateName, setTemplateName] = useState("");
  const [questions, setQuestions] = useState([]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionType, setNewQuestionType] = useState("short");
  const [newQuestionOptions, setNewQuestionOptions] = useState("");
  const [assignedAgents, setAssignedAgents] = useState([]); // Selected agents for assignment
  const [agents, setAgents] = useState([]); // Agents list for this admin
  const [message, setMessage] = useState("");
  const router = useRouter();

  // Fetch agents belonging to the current admin
  useEffect(() => {
    async function fetchAgents() {
      const res = await fetch("/api/agent/list", { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setAgents(data.agents);
      }
    }
    fetchAgents();
  }, []);

  // Add a new question to the list
  const addQuestion = () => {
    if (!newQuestionText.trim()) return;
    const question = {
      text: newQuestionText.trim(),
      type: newQuestionType,
      options:
        (newQuestionType === "multiple" ||
          newQuestionType === "checkbox" ||
          newQuestionType === "dropdown")
          ? newQuestionOptions.split(",").map((opt) => opt.trim()).filter(Boolean)
          : []
    };
    setQuestions([...questions, question]);
    // Reset inputs for new question
    setNewQuestionText("");
    setNewQuestionOptions("");
  };

  // Remove a question by index
  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  // Handler for multi-select agent assignment
  const handleAgentSelection = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((option) => option.value);
    setAssignedAgents(selected);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Build payload including template name, dynamic questions, and assigned agents
    const payload = {
      name: templateName,
      questions,
      assignedAgents  // Should be an array of agent IDs selected in the dropdown
    };
    const res = await fetch("/api/survey-template/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Survey template created successfully!");
      // Optionally clear form fields or redirect
      setTemplateName("");
      setQuestions([]);
      setAssignedAgents([]);
      router.push("/admin/dashboard");
    } else {
      setMessage(data.error || "Error creating template.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded shadow-md w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-4 text-center">Create Survey Template</h2>

        {/* Template Name */}
        <div className="mb-4">
          <label className="block mb-1 text-sm">Template Name</label>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 focus:outline-none"
            required
          />
        </div>

        {/* Assign Agents Multi-select */}
        <div className="mb-4">
          <label className="block mb-1 text-sm">Assign to Agents</label>
          <select
  multiple
  value={assignedAgents}
  onChange={handleAgentSelection}
  className="w-full p-2 rounded bg-gray-700 focus:outline-none"
>
  {agents.map((agent) => (
    <option key={agent._id} value={agent._id}>
  {agent.name} ({agent.email})
</option>

  ))}
</select>

          <p className="mt-1 text-sm text-gray-400">Hold Ctrl (Windows) or Command (Mac) to select multiple.</p>
        </div>

        <hr className="border-gray-700 my-4" />

        {/* New Question Input */}
        <div className="mb-4">
          <label className="block mb-1 text-sm">Question Text</label>
          <input
            type="text"
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 focus:outline-none"
            placeholder="Enter your question"
          />
        </div>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 text-sm">Question Type</label>
            <select
              value={newQuestionType}
              onChange={(e) => setNewQuestionType(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 focus:outline-none"
            >
              <option value="short">Short Answer</option>
              <option value="long">Long Answer</option>
              <option value="multiple">Multiple Choice</option>
              <option value="checkbox">Check Box</option>
              <option value="dropdown">Drop Down</option>
              <option value="date">Date</option>
            </select>
          </div>
          {(newQuestionType === "multiple" ||
            newQuestionType === "checkbox" ||
            newQuestionType === "dropdown") && (
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm">Options (comma separated)</label>
              <input
                type="text"
                value={newQuestionOptions}
                onChange={(e) => setNewQuestionOptions(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 focus:outline-none"
                placeholder="e.g., Option 1, Option 2, Option 3"
              />
            </div>
          )}
        </div>
        <div className="mb-4">
          <button
            type="button"
            onClick={addQuestion}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Add Question
          </button>
        </div>

        {/* Display Added Questions */}
        {questions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">Questions Added</h3>
            <ul className="space-y-2">
              {questions.map((q, index) => (
                <li
                  key={index}
                  className="bg-gray-700 p-2 rounded flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{q.text}</p>
                    <p className="text-sm text-gray-300">Type: {q.type}</p>
                    {(q.type === "multiple" ||
                      q.type === "checkbox" ||
                      q.type === "dropdown") && (
                      <p className="text-sm text-gray-300">
                        Options: {q.options.join(", ")}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="text-red-400 hover:text-red-600 transition"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {message && (
          <p className="mb-4 text-center text-green-400">{message}</p>
        )}

        <button
          type="submit"
          className="w-full bg-black py-2 rounded hover:bg-gray-600 transition"
        >
          Save Survey Template
        </button>
      </form>
    </div>
  );
}
