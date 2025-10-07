import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import {
  extractEnvironmentVariables,
  generateEnvFile,
} from "../../lib/auth-conversion-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, nodes } = body;

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    // Write to root auth.ts (the one CLI detects first)
    const authPath = join(process.cwd(), "auth.ts");
    await writeFile(authPath, code, "utf8");

    let envPath = null;
    let envContent = null;

    // Generate .env file if nodes are provided
    if (nodes && Array.isArray(nodes)) {
      const envVars = extractEnvironmentVariables(nodes);
      envContent = generateEnvFile(envVars);

      // Write .env file
      envPath = join(process.cwd(), ".env");
      await writeFile(envPath, envContent, "utf8");
    }

    return NextResponse.json({
      success: true,
      message:
        "Auth configuration saved to auth.ts" + (envPath ? " and .env" : ""),
      paths: {
        auth: authPath,
        env: envPath,
      },
      envVars: envContent
        ? Object.keys(extractEnvironmentVariables(nodes || [])).length
        : 0,
    });
  } catch (error) {
    console.error("Error saving auth.ts:", error);
    return NextResponse.json(
      { error: "Failed to save auth.ts" },
      { status: 500 }
    );
  }
}
