// app/api/survey-template/create/route.js
import { getServerSession } from "next-auth/next";
import clientPromise from "../../../../lib/mongodb";
import { authOptions } from "../../../api/auth/[...nextauth]/route";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return new Response(JSON.stringify({ error: "Not authorized" }), { status: 403 });
  }

  // Expect JSON with name and optional questions array
  const { name, questions, assignedAgents } = await req.json();
  if (!name) {
    return new Response(JSON.stringify({ error: "Template name is required" }), { status: 400 });
  }
  
  const client = await clientPromise;
  const db = client.db();
  
  // Check for uniqueness of template name
  const existing = await db.collection("surveyTemplates").findOne({ name });
  if (existing) {
    return new Response(JSON.stringify({ error: "Template name already exists" }), { status: 400 });
  }
  
  // Create unique templateId (using ObjectId’s string or any UUID generator)
  const templateId = new Date().getTime().toString(); // simplified unique id, for production use UUIDs
  
  try {
    const newTemplate = {
      templateId,
      name,
      questions: questions || [],
      adminId: session.user.id,
      assignedAgents: assignedAgents || [], // use the provided array or default to empty
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("surveyTemplates").insertOne(newTemplate);
    return new Response(JSON.stringify({ message: "Template created", template: newTemplate }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error creating template" }), { status: 500 });
  }
}
