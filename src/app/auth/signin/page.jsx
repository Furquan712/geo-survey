"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  // When the session becomes authenticated, check the user's role and redirect accordingly.
  useEffect(() => {
    if (status === "authenticated" && session && session.user) {
      if (session.user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (session.user.role === "AGENT") {
        router.push("/agent/dashboard");
      }
    }
  }, [session, status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Set redirect to false to manually handle the redirection based on role.
    const res = await signIn("credentials", { redirect: false, email, password });
    if (res?.error) {
      setError(res.error);
    }
    // If signIn is successful, the session will update and the above useEffect will handle the redirection.
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">Sign In</h2>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-300 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
        >
          Sign In
        </button>
        <Link className="w-full mt-8 inline-block bg-black text-white py-2 rounded hover:bg-gray-800 transition text-center" href="/auth/signup">
          
            Want to SignUp
          
        </Link>
      </form>
    </div>
  );
}
