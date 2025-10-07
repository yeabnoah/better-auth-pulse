import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    // Check if we have a config file path from environment
    const configPath = process.env.BETTER_AUTH_PULSE_CONFIG;

    if (configPath) {
      // Update the config file with new auth content
      const configContent = await readFile(configPath, "utf8");
      const config = JSON.parse(configContent);
      config.authContent = code;
      await writeFile(configPath, JSON.stringify(config, null, 2), "utf8");

      return NextResponse.json({
        success: true,
        message: "Auth configuration saved to config file",
        path: configPath,
      });
    }

    // Fallback: Write to root auth.ts (the one CLI detects first)
    const authPath = join(process.cwd(), "auth.ts");
    await writeFile(authPath, code, "utf8");

    return NextResponse.json({
      success: true,
      message: "Auth configuration saved to auth.ts",
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
