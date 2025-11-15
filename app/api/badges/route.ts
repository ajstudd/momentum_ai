import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Badge from "@/lib/models/Badge";

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

  // Get badges from Badge collection
  const badges = await Badge.find({ userId: payload.userId })
    .sort({ awardedAt: -1 })
    .lean();

  return NextResponse.json(badges || []);
}
