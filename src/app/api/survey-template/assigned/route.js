// app/api/survey-template/assigned/route.js
import { getServerSession } from "next-auth/next";
import clientPromise from "../../../../lib/mongodb";
import { authOptions } from "../../../api/auth/[...nextauth]/route";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "AGENT") {
    return new Response(JSON.stringify({ error: "Not authorized" }), { status: 403 });
  }
  
  try {
    const client = await clientPromise;
    const db = client.db();
    // Filter templates where the logged-in agent's ID exists in assignedAgents
    const surveys = await db.collection("surveyTemplates").find({ assignedAgents: session.user.id }).toArray();
    return new Response(JSON.stringify({ surveys }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error fetching assigned surveys" }), { status: 500 });
  }
}
