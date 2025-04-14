import { getServerSession } from "next-auth/next";
import clientPromise from "../../../../lib/mongodb";
import { authOptions } from "../../../api/auth/[...nextauth]/route";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return new Response(JSON.stringify({ error: "Not authorized" }), { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("agentId");
  const templateId = searchParams.get("templateId");

  // We require templateId. The agentId will always be provided (even for "all")
  if (!agentId || !templateId) {
    return new Response(JSON.stringify({ error: "Missing agentId or templateId" }), { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    // Build the query filter: if agentId is "all" then omit that filter.
    const filter = {
      adminId: session.user.id,
      templateId: templateId,
      ...(agentId !== "all" && { agentId: agentId }),
    };

    // Only return the formData, location fields, and date if desired.
    const submissions = await db.collection("surveySubmissions")
      .find(filter)
      .project({ formData: 1, location: 1, date: 1 })
      .toArray();
    return new Response(JSON.stringify({ submissions }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error fetching submissions" }), { status: 500 });
  }
}
