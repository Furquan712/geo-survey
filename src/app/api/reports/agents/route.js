// app/api/reports/agents/route.js
import { getServerSession } from "next-auth/next";
import clientPromise from "../../../../lib/mongodb";
import { authOptions } from "../../../api/auth/[...nextauth]/route";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return new Response(JSON.stringify({ error: "Not authorized" }), { status: 403 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    // Aggregate unique agent IDs from surveySubmissions, and lookup corresponding user info
    const agents = await db
      .collection("surveySubmissions")
      .aggregate([
        { $match: { adminId: session.user.id } },
        { $group: { _id: "$agentId" } },
        { 
          $lookup: {
            from: "users",
            let: { agentIdString: "$_id" },
            pipeline: [
              { $addFields: { idStr: { $toString: "$_id" } } },
              { $match: { $expr: { $eq: ["$idStr", "$$agentIdString"] } } },
              { $project: { name: 1, email: 1 } }
            ],
            as: "agentInfo"
          }
        },
        { $unwind: "$agentInfo" },
        { 
          $project: {
            agentId: "$_id",
            name: "$agentInfo.name",
            email: "$agentInfo.email",
            _id: 0
          }
        }
      ])
      .toArray();
      
    return new Response(JSON.stringify({ agents }), { status: 200 });
  } catch (error) {
    console.error("Error fetching agents:", error);
    return new Response(JSON.stringify({ error: "Error fetching agents" }), { status: 500 });
  }
}
