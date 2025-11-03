import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Milestone from "@/lib/models/Milestone";

// GET: Fetch milestones (internal)
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = auth.replace("Bearer ", "");
  const payload = verifyJwt(token);
  if (!payload || typeof payload !== "object" || !("userId" in payload)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  await connectToDB();

  const user = await User.findById(payload.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get milestones from Milestone collection
  const milestones = await Milestone.find({ userId: payload.userId })
    .sort({ achievedAt: -1 })
    .lean();

  return NextResponse.json(milestones || []);
}

// POST: Update milestones (internal)
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = auth.replace("Bearer ", "");
  const payload = verifyJwt(token);
  if (!payload || typeof payload !== "object" || !("userId" in payload)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  await connectToDB();
  const body = await req.json();

  const user = await User.findById(payload.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Delete existing milestones and create new ones
  await Milestone.deleteMany({ userId: payload.userId });

  if (Array.isArray(body.milestones)) {
    const milestonesToCreate = body.milestones.map((m: any) => ({
      userId: payload.userId,
      badge: m.badge,
      achieved: m.achieved,
      achievedAt: m.achievedAt,
      criteria: m.criteria,
    }));

    await Milestone.insertMany(milestonesToCreate);
  }

  return NextResponse.json({ success: true });
}
