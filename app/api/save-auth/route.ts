import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    // Write to utils/auth.ts (the one CLI detects)
    const authPath = join(process.cwd(), "utils", "auth.ts");
    await writeFile(authPath, code, "utf8");

    return NextResponse.json({
      success: true,
      message: "Auth configuration saved to utils/auth.ts",
      path: authPath,
    });
  } catch (error) {
    console.error("Error saving auth.ts:", error);
    return NextResponse.json(
      { error: "Failed to save auth.ts" },
      { status: 500 }
    );
  }
}
