"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminSignUpPage() {
  const [adminData, setAdminData] = useState({ name: "", email: "", Phone_No: "", Organisation_Name: "", Organisation_type: "", password: "" });
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/admin/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adminData),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Admin account created successfully!");
      router.push("/auth/signin");
    } else {
      setMessage(data.error || "An error occurred.");
    }
  };

  return (


      <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">Sign Up</h2>
        {message && <p className="mb-4 text-green-400">{message}</p>}

        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={adminData.name}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={adminData.email}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Phone No</label>
          <input
            type="text"
            name="Phone_No"
            value={adminData.Phone_No}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Organisation Name</label>
          <input
            type="text"
            name="Organisation_Name"
            value={adminData.Organisation_Name}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Organisation Type</label>
          <input
            type="text"
            name="Organisation_type"
            value={adminData.Organisation_type}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-300 mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={adminData.password}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
        >Sign Up Now
        </button>
        <Link className="w-full mt-8 inline-block bg-black text-white py-2 rounded hover:bg-gray-800 transition text-center" href="/auth/signin">
          
          Want to SignIn
        
      </Link>
      </form>
    </div>
  );
}
