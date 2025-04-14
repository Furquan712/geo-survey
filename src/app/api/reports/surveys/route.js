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
    // Group submissions by templateId and get the survey name (formName)
    const surveys = await db.collection("surveySubmissions").aggregate([
      { $match: { adminId: session.user.id } },
      { $group: { _id: "$templateId", formName: { $first: "$formName" } } },
      { $project: { templateId: "$_id", formName: 1, _id: 0 } }
    ]).toArray();
    return new Response(JSON.stringify({ surveys }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error fetching surveys" }), { status: 500 });
  }
}
