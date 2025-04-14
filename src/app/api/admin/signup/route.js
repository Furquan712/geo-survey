// app/api/admin/signup/route.js
import clientPromise from "../../../../lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { name, email, Phone_No, Organisation_Name, Organisation_type, password } = await req.json();
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
    await db.collection("users").insertOne({
      name,
      email,
      Phone_No,
      Organisation_Name,
      Organisation_type,
      password: hashedPassword,
      role: "ADMIN", // explicitly assign the ADMIN role
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return new Response(JSON.stringify({ message: "Admin account created successfully" }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error creating admin account" }), { status: 500 });
  }
}
