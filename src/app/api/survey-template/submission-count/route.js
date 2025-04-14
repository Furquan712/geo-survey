// app/api/survey-template/submission-count/route.js
import { getServerSession } from "next-auth/next";
import clientPromise from "../../../../lib/mongodb";
import { authOptions } from "../../../api/auth/[...nextauth]/route";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "AGENT") {
    return new Response(JSON.stringify({ error: "Not authorized" }), { status: 403 });
  }
  
  // Get the templateId from URL search params
  const { searchParams } = new URL(req.url);
  const templateId = searchParams.get("templateId");
  if (!templateId) {
    return new Response(JSON.stringify({ error: "Missing templateId" }), { status: 400 });
  }
  
  try {
    const client = await clientPromise;
    const db = client.db();
    const count = await db
      .collection("surveySubmissions")
      .countDocuments({ 
        templateId: templateId,
        agentId: session.user.id
      });
      
    return new Response(JSON.stringify({ count }), { status: 200 });
  } catch (error) {
    console.error("Error fetching submission count:", error);
    return new Response(JSON.stringify({ error: "Error getting count" }), { status: 500 });
  }
}
