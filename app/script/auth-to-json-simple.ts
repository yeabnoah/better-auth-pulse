#!/usr/bin/env tsx

import fs from "fs";
import path from "path";

interface AuthConfig {
  database?: {
    provider: string;
    url?: string;
  };
  emailAndPassword?: {
    enabled: boolean;
  };
  socialProviders?: {
    [key: string]: {
      clientId: string;
      clientSecret: string;
    };
  };
}

function extractConfigFromFile(filePath: string): AuthConfig {
  const content = fs.readFileSync(filePath, "utf-8");
  const config: AuthConfig = {};

  // Extract database configuration
  const databaseMatch = content.match(
    /database:\s*\{[^}]*provider:\s*["']([^"']+)["'][^}]*\}/s
  );
  if (databaseMatch) {
    config.database = {
      provider: databaseMatch[1],
    };

    // Extract URL if present
    const urlMatch = content.match(/url:\s*process\.env\.DATABASE_URL/);
    if (urlMatch) {
      config.database.url =
        process.env.DATABASE_URL || "postgresql://localhost:5432/mydb";
    }
  }

  // Extract email and password configuration
  const emailMatch = content.match(
    /emailAndPassword:\s*\{[^}]*enabled:\s*(true|false)[^}]*\}/s
  );
  if (emailMatch) {
    config.emailAndPassword = {
      enabled: emailMatch[1] === "true",
    };
  }

  // Extract social providers
  const socialProvidersMatch = content.match(/socialProviders:\s*\{([^}]+)\}/s);
  if (socialProvidersMatch) {
    config.socialProviders = {};

    // Extract Google
    const googleMatch = content.match(
      /google:\s*\{[^}]*clientId:\s*process\.env\.GOOGLE_CLIENT_ID[^}]*\}/s
    );
    if (googleMatch) {
      config.socialProviders.google = {
        clientId: process.env.GOOGLE_CLIENT_ID || "mock-google-client-id",
        clientSecret:
          process.env.GOOGLE_CLIENT_SECRET || "mock-google-client-secret",
      };
    }

    // Extract GitHub
    const githubMatch = content.match(
      /github:\s*\{[^}]*clientId:\s*process\.env\.GITHUB_CLIENT_ID[^}]*\}/s
    );
    if (githubMatch) {
      config.socialProviders.github = {
        clientId: process.env.GITHUB_CLIENT_ID || "mock-github-client-id",
        clientSecret:
          process.env.GITHUB_CLIENT_SECRET || "mock-github-client-secret",
      };
    }
  }

  return config;
}

function authConfigToGraphDynamic(authConfig: any) {
  const nodes: any[] = [];
  const edges: any[] = [];
  let id = 1;

  // 1️⃣ Auth Starter
  nodes.push({
    id: String(id),
    type: "authStarter",
    position: { x: 0, y: 0 },
    data: { label: "Auth Starter" },
  });
  const authStarterId = id;
  id++;

  // 2️⃣ Prisma Database
  if (authConfig.database) {
    nodes.push({
      id: String(id),
      type: "prismaDatabase",
      position: { x: 200, y: 150 },
      data: {
        label: "Prisma Database",
        provider: authConfig.database.provider,
      },
    });
    edges.push({
      id: `e${id}-${authStarterId}`,
      source: String(id),
      target: String(authStarterId),
      animated: true,
    });
    id++;
  }

  // 3️⃣ Social Providers
  const socialProviders = authConfig.socialProviders
    ? Object.keys(authConfig.socialProviders)
    : [];
  socialProviders.forEach((provider, index) => {
    const type = `oauth${provider.charAt(0).toUpperCase() + provider.slice(1)}`;
    const positionX = 400 + index * 200; // dynamically spread horizontally
    const positionY = 300;
    nodes.push({
      id: String(id),
      type,
      position: { x: positionX, y: positionY },
      data: {
        label: `${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth`,
      },
    });
    edges.push({
      id: `e${id}-${authStarterId}`,
      source: String(id),
      target: String(authStarterId),
      animated: true,
    });
    id++;
  });

  // 4️⃣ Email Resend Node
  if (authConfig.emailAndPassword?.enabled) {
    const positionX = 400 + socialProviders.length * 200; // place after last social provider
    nodes.push({
      id: String(id),
      type: "emailResend",
      position: { x: positionX, y: 300 },
      data: { label: "Resend Email Provider" },
    });
    edges.push({
      id: `e${id}-${authStarterId}`,
      source: String(id),
      target: String(authStarterId),
      animated: true,
    });
    id++;
  }

  // 5️⃣ Event Handler Node
  const lastX = nodes[nodes.length - 1].position.x;
  nodes.push({
    id: String(id),
    type: "eventHandler",
    position: { x: lastX + 200, y: 450 }, // position after last node
    data: { label: "onLoginSuccess" },
  });
  edges.push({
    id: `e${id}-${authStarterId}`,
    source: String(id),
    target: String(authStarterId),
    animated: false,
  });

  return { nodes, edges };
}

function main() {
  const authFilePath =
    process.argv[2] || path.join(process.cwd(), "app/script/auth.ts");

  if (!fs.existsSync(authFilePath)) {
    console.error("Error: auth.ts file not found at:", authFilePath);
    process.exit(1);
  }

  const authConfig = extractConfigFromFile(authFilePath);
  const graph = authConfigToGraphDynamic(authConfig);
  console.log(JSON.stringify(graph, null, 2));
}

// Run the script
if (require.main === module) {
  main();
}

export { extractConfigFromFile, authConfigToGraphDynamic };
