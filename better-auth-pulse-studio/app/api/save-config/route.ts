import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json(
        { error: "Config data is required" },
        { status: 400 }
      );
    }

    // Check if we have a config file path from environment
    const envConfigPath = process.env.BETTER_AUTH_PULSE_CONFIG;
    const configPath =
      envConfigPath || join(process.cwd(), ".better-auth-pulse.config.json");
    const configJson = JSON.stringify(config, null, 2);

    await writeFile(configPath, configJson, "utf8");

    return NextResponse.json({
      success: true,
      message: "Config saved successfully",
      path: configPath,
    });
  } catch (error) {
    console.error("Error saving config:", error);
    return NextResponse.json(
      { error: "Failed to save config" },
      { status: 500 }
    );
  }
}
