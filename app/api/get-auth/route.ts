import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(request: NextRequest) {
  try {
    // Try to read utils/auth.ts first (the one CLI detects)
    let authPath = join(process.cwd(), "utils", "auth.ts");
    let authContent: string;

    try {
      authContent = await readFile(authPath, "utf8");
    } catch (error) {
      // Fallback to root auth.ts
      authPath = join(process.cwd(), "auth.ts");
      authContent = await readFile(authPath, "utf8");
    }

    return new NextResponse(authContent, {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("Error reading auth.ts:", error);
    return NextResponse.json(
      { error: "Failed to read auth.ts" },
      { status: 404 }
    );
  }
}
