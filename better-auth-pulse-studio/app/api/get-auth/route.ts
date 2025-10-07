import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { join } from "path";

export async function GET() {
  try {
    // Check if we have a config file path from environment
    const configPath = process.env.BETTER_AUTH_PULSE_CONFIG;

    if (configPath) {
      // Read the config file
      const configContent = await readFile(configPath, "utf8");
      const config = JSON.parse(configContent);

      // Return the auth content from the config
      if (config.authContent) {
        return new NextResponse(config.authContent, {
          headers: {
            "Content-Type": "text/plain",
          },
        });
      }
    }

    // Fallback: Try to read root auth.ts first (the one CLI detects first)
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
