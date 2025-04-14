"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FaUserPlus, FaClipboardList, FaChartBar } from "react-icons/fa";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  if (status === "loading") return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold mb-4">Admin</h1>
        <button onClick={() => signOut()} className="bg-black px-4 py-2 rounded">
          Sign Out
        </button>
      </div>

      {/* Grid for the three buttons */}
      <div className="flex flex-col ">
        {/* Button 1: Create Agent Account */}
        <a
          href="/admin/create-agent"
          className="flex flex-col mt-8 items-center justify-center bg-black px-4 py-2 rounded-full hover:bg-gray-800 transition"
        >
          <FaUserPlus size={24} className="mb-2" />
          <span>Create Agent Account</span>
        </a>

        {/* Button 2: Create Survey */}
        <a
          href="/admin/create-survey-template"
          className="flex flex-col  mt-8  items-center justify-center bg-black px-4 py-2 rounded-full hover:bg-gray-800 transition"
        >
          <FaClipboardList size={24} className="mb-2" />
          <span>Create Survey</span>
        </a>

        {/* Button 3: See Survey Data */}
        <a
          href="/admin/reports"
          className="flex flex-col  mt-8   items-center justify-center bg-black px-4 py-2 rounded-full hover:bg-gray-800 transition col-span-2"
        >
          <FaChartBar size={24} className="mb-2" />
          <span>See Survey Data</span>
        </a>
      </div>
    </div>
  );
}
