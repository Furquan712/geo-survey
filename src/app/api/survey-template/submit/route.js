// app/api/survey-template/submit/route.js
import { getServerSession } from "next-auth/next";
import clientPromise from "../../../../lib/mongodb";
import { authOptions } from "../../../api/auth/[...nextauth]/route";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "AGENT") {
    return new Response(JSON.stringify({ error: "Not authorized" }), { status: 403 });
  }
  
  const { adminId, agentId, formName, date, formData, location, templateId } = await req.json();
  
  if (!adminId || !agentId || !formName || !date || !formData) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }
  
  const client = await clientPromise;
  const db = client.db();
  
  const submission = {
    adminId,
    agentId,
    templateId,
    formName,
    date: new Date(date),
    formData,       // form responses as an object
    location,       // agent's location (can be null)
    createdAt: new Date(),
  };
  
  try {
    await db.collection("surveySubmissions").insertOne(submission);
    return new Response(JSON.stringify({ message: "Survey submitted successfully" }), { status: 201 });
  } catch (error) {
    console.error("Error saving submission:", error);
    return new Response(JSON.stringify({ error: "Error saving submission" }), { status: 500 });
  }
}
