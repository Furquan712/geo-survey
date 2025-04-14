// app/api/survey-template/assign/route.js
import { getServerSession } from "next-auth/next";
import clientPromise from "../../../../lib/mongodb";
import { authOptions } from "../../../api/auth/[...nextauth]/route";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return new Response(JSON.stringify({ error: "Not authorized" }), { status: 403 });
  }

  // Expect JSON with templateId and an array of agentIds (or one agentId)
  const { templateId, agentIds } = await req.json();
  if (!templateId || !agentIds || !Array.isArray(agentIds) || agentIds.length === 0) {
    return new Response(JSON.stringify({ error: "templateId and agentIds are required" }), { status: 400 });
  }
  
  const client = await clientPromise;
  const db = client.db();

  try {
    // Update the survey template by pushing unique agent ids (prevent duplicates with $addToSet)
    const result = await db.collection("surveyTemplates").updateOne(
      { templateId, adminId: session.user.id },
      { $addToSet: { assignedAgents: { $each: agentIds } }, $set: { updatedAt: new Date() } }
    );
    if (result.modifiedCount === 0) {
      return new Response(JSON.stringify({ error: "No update happened. Check if the template exists and belongs to you." }), { status: 400 });
    }
    return new Response(JSON.stringify({ message: "Agents assigned successfully" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error assigning agents" }), { status: 500 });
  }
}
