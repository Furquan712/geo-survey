// app/api/agent/create/route.js
import { getServerSession } from "next-auth/next";
import clientPromise from "../../../../lib/mongodb";
import bcrypt from "bcryptjs";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return new Response(JSON.stringify({ error: "Not authorized" }), { status: 403 });
  }

  const { name, email, password } = await req.json();
  if (!name || !email || !password) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();
  const existingUser = await db.collection("users").findOne({ email });
  if (existingUser) {
    return new Response(JSON.stringify({ error: "User already exists" }), { status: 400 });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    // Add the admin's ID (or email) from the session to create a relation.
    await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      role: "AGENT",
      adminId: session.user.id, // Storing the admin's identifier
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return new Response(JSON.stringify({ message: "Agent account created successfully" }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error creating agent" }), { status: 500 });
  }
}
