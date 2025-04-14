// app/api/survey-template/day-report/route.js
import { getServerSession } from "next-auth/next";
import clientPromise from "../../../../lib/mongodb";
import { authOptions } from "../../../api/auth/[...nextauth]/route";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "AGENT") {
    return new Response(JSON.stringify({ error: "Not authorized" }), { status: 403 });
  }
  
  const { searchParams } = new URL(req.url);
  const templateId = searchParams.get("templateId");
  const date = searchParams.get("date"); // expecting YYYY-MM-DD
  if (!templateId || !date) {
    return new Response(JSON.stringify({ error: "Missing templateId or date" }), { status: 400 });
  }
  
  try {
    const client = await clientPromise;
    const db = client.db();
    // Find the day report for this agent, template, and date.
    const report = await db.collection("dayReports").findOne({
      templateId,
      agentId: session.user.id,
      date, // stored as a string in YYYY-MM-DD format
    });
    return new Response(JSON.stringify({ report }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error fetching day report" }), { status: 500 });
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "AGENT") {
    return new Response(JSON.stringify({ error: "Not authorized" }), { status: 403 });
  }
  
  const { adminId, agentId, templateId, formName, date, reportData } = await req.json();
  if (!adminId || !agentId || !templateId || !date || reportData === undefined) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }
  
  try {
    const client = await clientPromise;
    const db = client.db();
    // Upsert: If a day report for today exists, update it; otherwise, insert a new document.
    await db.collection("dayReports").updateOne(
      {
        templateId,
        agentId,
        date,
      },
      {
        $set: {
          adminId,
          formName,
          reportData,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
    return new Response(JSON.stringify({ message: "Day report saved successfully" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error saving day report" }), { status: 500 });
  }
}
