// app/api/agent/list/route.js
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
    // Find agents created by this admin using the stored adminId
    const agents = await db.collection("users")
      .find({ role: "AGENT", adminId: session.user.id })
      .toArray();

      const formattedAgents = agents.map((agent) => ({
        _id: agent._id.toString(),
        name: agent.name,
        email: agent.email
      }));
      return new Response(JSON.stringify({ agents: formattedAgents }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error fetching agents" }), { status: 500 });
  }
}
