import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import { getAchievementProgress } from "@/lib/achievement-checker";

// GET: Get all achievements with progress tracking
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

  const progress = await getAchievementProgress(payload.userId);

  // Separate locked and unlocked achievements
  const locked = progress.filter((p) => !p.unlocked);
  const unlocked = progress.filter((p) => p.unlocked);

  // Group by type
  const groupedLocked = {
    passives: locked.filter((p) => p.definition.type === "passive"),
    titles: locked.filter((p) => p.definition.type === "title"),
    badges: locked.filter((p) => p.definition.type === "badge"),
  };

  const groupedUnlocked = {
    passives: unlocked.filter((p) => p.definition.type === "passive"),
    titles: unlocked.filter((p) => p.definition.type === "title"),
    badges: unlocked.filter((p) => p.definition.type === "badge"),
  };

  return NextResponse.json({
    locked: groupedLocked,
    unlocked: groupedUnlocked,
    all: progress,
  });
}
