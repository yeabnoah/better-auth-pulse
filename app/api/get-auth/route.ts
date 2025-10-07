import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { join } from "path";

export async function GET() {
  try {
    // Try to read root auth.ts first (the one CLI detects first)
    let authPath = join(process.cwd(), "auth.ts");
    let authContent: string;

    try {
      authContent = await readFile(authPath, "utf8");
    } catch {
      // Fallback to utils/auth.ts
      authPath = join(process.cwd(), "utils", "auth.ts");
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
