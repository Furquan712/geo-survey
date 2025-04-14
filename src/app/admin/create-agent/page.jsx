"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CreateAgentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [agentData, setAgentData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  const handleChange = (e) => {
    setAgentData({ ...agentData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/agent/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(agentData),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Agent created successfully!");
      setAgentData({ name: "", email: "", password: "" });
    } else {
      setMessage(data.error || "An error occurred.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-8">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Create Agent Account</h2>
        {message && <p className="mb-4 text-green-400">{message}</p>}
        <div className="mb-4">
          <label className="block mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={agentData.name}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={agentData.email}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={agentData.password}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
            required
          />
        </div>
        <button type="submit" className="w-full bg-black py-2 rounded hover:bg-gray-600 transition">
          Create Agent
        </button>
      </form>
    </div>
  );
}
