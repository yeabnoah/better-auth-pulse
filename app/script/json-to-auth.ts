#!/usr/bin/env tsx

import fs from "fs";

interface AuthConfig {
  database?: {
    provider: string;
    url?: string;
  };
  emailAndPassword?: {
    enabled: boolean;
    requireEmailVerification?: boolean;
    minLength?: number;
    maxLength?: number;
    autoSignIn?: boolean;
    resetTokenExpiresIn?: number;
    sendResetPassword?: string;
    sendVerificationEmail?: string;
  };
  emailVerification?: {
    sendOnSignUp?: boolean;
    sendOnSignIn?: boolean;
    autoSignInAfterVerification?: boolean;
    tokenExpiresIn?: number;
  };
  socialProviders?: {
    [key: string]: {
      clientId: string;
      clientSecret: string;
    };
  };
  account?: {
    encryptOAuthTokens?: boolean;
    updateOnSignIn?: boolean;
    trustedProviders?: string[];
    allowDifferentEmails?: boolean;
  };
  rateLimit?: {
    window?: number;
    maxRequests?: number;
    customRules?: Record<string, { window: number; max: number }>;
  };
  session?: {
    expiresIn?: number;
    updateAge?: number;
  };
  user?: {
    additionalFields?: Record<string, any>;
  };
  plugins?: string[];
  trustedOrigins?: string[];
  baseURL?: string;
  secret?: string;
}

interface GraphNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    provider?: string;
    [key: string]: any; // Allow any additional properties
  };
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  animated: boolean;
}

interface GraphConfig {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

function convertGraphToAuthConfig(graphConfig: GraphConfig): AuthConfig {
  const authConfig: AuthConfig = {};

  // Database configuration
  const databaseNode = graphConfig.nodes.find(
    (node) => node.type === "prismaDatabase" || node.type === "database"
  );
  if (databaseNode) {
    authConfig.database = {
      provider: databaseNode.data.provider || "postgresql",
      url: process.env.DATABASE_URL || "postgresql://localhost:5432/mydb",
    };
  }

  // Email and Password configuration
  const emailAuthNode = graphConfig.nodes.find(
    (node) => node.type === "emailAuth"
  );
  if (emailAuthNode) {
    authConfig.emailAndPassword = {
      enabled: true,
      requireEmailVerification: emailAuthNode.data.requireVerification || false,
      minLength: emailAuthNode.data.minLength || 8,
      maxLength: emailAuthNode.data.maxLength || 128,
      autoSignIn: emailAuthNode.data.autoSignIn || false,
      resetTokenExpiresIn: emailAuthNode.data.resetTokenExpiresIn || 3600,
      sendResetPassword:
        "async ({ user, url }) => { console.log(`Reset password email for ${user.email}: ${url}`); }",
      sendVerificationEmail:
        "async ({ user, url }) => { console.log(`Verification email for ${user.email}: ${url}`); }",
    };
  }

  // Email Verification configuration
  const emailVerificationNode = graphConfig.nodes.find(
    (node) => node.type === "emailVerification"
  );
  if (emailVerificationNode) {
    authConfig.emailVerification = {
      sendOnSignUp: emailVerificationNode.data.sendOnSignUp || true,
      sendOnSignIn: emailVerificationNode.data.sendOnSignIn || false,
      autoSignInAfterVerification:
        emailVerificationNode.data.autoSignInAfterVerification || true,
      tokenExpiresIn: emailVerificationNode.data.tokenExpiresIn || 3600,
    };
  }

  // OAuth providers
  const oauthNodes = graphConfig.nodes.filter((node) =>
    node.type.startsWith("oauth")
  );
  if (oauthNodes.length > 0) {
    authConfig.socialProviders = {};

    oauthNodes.forEach((node) => {
      const provider = node.type.replace("oauth", "").toLowerCase();
      const envVarName = provider.toUpperCase();

      authConfig.socialProviders![provider] = {
        clientId:
          process.env[`${envVarName}_CLIENT_ID`] ||
          `mock-${provider}-client-id`,
        clientSecret:
          process.env[`${envVarName}_CLIENT_SECRET`] ||
          `mock-${provider}-client-secret`,
      };
    });
  }

  // Account configuration
  const accountNode = graphConfig.nodes.find((node) => node.type === "account");
  if (accountNode) {
    authConfig.account = {
      encryptOAuthTokens: accountNode.data.encryptOAuthTokens || true,
      updateOnSignIn: accountNode.data.updateOnSignIn || true,
      trustedProviders: accountNode.data.trustedProviders || [],
      allowDifferentEmails: accountNode.data.allowDifferentEmails || false,
    };
  }

  // Rate limiting configuration
  const rateLimitNode = graphConfig.nodes.find(
    (node) => node.type === "rateLimit"
  );
  if (rateLimitNode) {
    authConfig.rateLimit = {
      window: rateLimitNode.data.window || 60,
      maxRequests: rateLimitNode.data.maxRequests || 100,
      customRules: rateLimitNode.data.customRules || {},
    };
  }

  // Advanced configuration
  const advancedNode = graphConfig.nodes.find(
    (node) => node.type === "advanced"
  );
  if (advancedNode) {
    authConfig.session = {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
    };
    authConfig.user = {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "user",
          required: false,
        },
        organizationId: {
          type: "string",
          required: false,
        },
      },
    };
    authConfig.trustedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    ];
    authConfig.baseURL =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    authConfig.secret = process.env.BETTER_AUTH_SECRET || "your-secret-key";
  }

  // Plugins configuration
  const plugins = [];
  if (rateLimitNode) plugins.push("rateLimit");
  if (accountNode) plugins.push("organization");

  // Check for polar plugin (if polar node exists)
  const polarNode = graphConfig.nodes.find((node) => node.type === "polar");
  if (polarNode) plugins.push("polar");

  if (plugins.length > 0) {
    authConfig.plugins = plugins;
  }

  return authConfig;
}

function generateAuthTs(authConfig: AuthConfig): string {
  // Build imports
  let imports = `import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";`;

  // Add plugin imports
  if (authConfig.plugins) {
    if (authConfig.plugins.includes("rateLimit")) {
      imports += `\nimport { rateLimit } from "better-auth/plugins/rate-limit";`;
    }
    if (authConfig.plugins.includes("organization")) {
      imports += `\nimport { organization } from "better-auth/plugins/organization";`;
    }
    if (authConfig.plugins.includes("polar")) {
      imports += `\nimport { polar } from "better-auth/plugins/polar";`;
    }
  }

  let authTs = `${imports}

const prisma = new PrismaClient();

export const auth = betterAuth({
  adapter: prismaAdapter(prisma, {
    provider: "${authConfig.database?.provider || "postgresql"}",
  }),`;

  // Add database configuration
  if (authConfig.database) {
    authTs += `
  database: {
    provider: "${authConfig.database.provider}",
    url: process.env.DATABASE_URL,`;

    if (authConfig.database.url) {
      authTs += `
    // url: "${authConfig.database.url}", // Uncomment if you want to hardcode the URL`;
    }

    authTs += `
  },`;
  }

  // Add email and password configuration
  if (authConfig.emailAndPassword) {
    authTs += `
  emailAndPassword: {
    enabled: ${authConfig.emailAndPassword.enabled},`;

    if (authConfig.emailAndPassword.requireEmailVerification !== undefined) {
      authTs += `
    requireEmailVerification: ${authConfig.emailAndPassword.requireEmailVerification},`;
    }

    if (authConfig.emailAndPassword.minLength !== undefined) {
      authTs += `
    minLength: ${authConfig.emailAndPassword.minLength},`;
    }

    if (authConfig.emailAndPassword.maxLength !== undefined) {
      authTs += `
    maxLength: ${authConfig.emailAndPassword.maxLength},`;
    }

    if (authConfig.emailAndPassword.autoSignIn !== undefined) {
      authTs += `
    autoSignIn: ${authConfig.emailAndPassword.autoSignIn},`;
    }

    if (authConfig.emailAndPassword.resetTokenExpiresIn !== undefined) {
      authTs += `
    resetTokenExpiresIn: ${authConfig.emailAndPassword.resetTokenExpiresIn},`;
    }

    if (authConfig.emailAndPassword.sendResetPassword) {
      authTs += `
    sendResetPassword: ${authConfig.emailAndPassword.sendResetPassword},`;
    }

    if (authConfig.emailAndPassword.sendVerificationEmail) {
      authTs += `
    sendVerificationEmail: ${authConfig.emailAndPassword.sendVerificationEmail},`;
    }

    authTs += `
  },`;
  }

  // Add email verification configuration
  if (authConfig.emailVerification) {
    authTs += `
  emailVerification: {
    sendOnSignUp: ${authConfig.emailVerification.sendOnSignUp || true},
    sendOnSignIn: ${authConfig.emailVerification.sendOnSignIn || false},
    autoSignInAfterVerification: ${
      authConfig.emailVerification.autoSignInAfterVerification || true
    },
    tokenExpiresIn: ${authConfig.emailVerification.tokenExpiresIn || 3600},
  },`;
  }

  // Add social providers
  if (
    authConfig.socialProviders &&
    Object.keys(authConfig.socialProviders).length > 0
  ) {
    authTs += `
  socialProviders: {`;

    Object.entries(authConfig.socialProviders).forEach(([provider, config]) => {
      const envVarName = provider.toUpperCase();
      authTs += `
    ${provider}: {
      clientId: process.env.${envVarName}_CLIENT_ID!,
      clientSecret: process.env.${envVarName}_CLIENT_SECRET!,
    },`;
    });

    authTs += `
  },`;
  }

  // Add account configuration
  if (authConfig.account) {
    authTs += `
  account: {
    encryptOAuthTokens: ${authConfig.account.encryptOAuthTokens || true},
    updateOnSignIn: ${authConfig.account.updateOnSignIn || true},
    trustedProviders: ${JSON.stringify(
      authConfig.account.trustedProviders || []
    )},
    allowDifferentEmails: ${authConfig.account.allowDifferentEmails || false},
  },`;
  }

  // Add plugins
  if (authConfig.plugins && authConfig.plugins.length > 0) {
    authTs += `
  plugins: [`;

    authConfig.plugins.forEach((plugin, index) => {
      if (plugin === "rateLimit" && authConfig.rateLimit) {
        authTs += `
    rateLimit({
      window: "${authConfig.rateLimit.window || 60}m",
      max: ${authConfig.rateLimit.maxRequests || 100},
      skipSuccessfulRequests: false,
    }),`;
      } else if (plugin === "organization") {
        authTs += `
    organization({
      allowUserToCreateOrganization: true,
      allowUserToJoinOrganization: true,
      allowUserToLeaveOrganization: true,
      allowUserToDeleteOrganization: true,
      allowUserToInviteMembers: true,
      allowUserToRemoveMembers: true,
      allowUserToUpdateMemberRole: true,
      allowUserToUpdateOrganization: true,
    }),`;
      } else if (plugin === "polar") {
        authTs += `
    polar({
      apiKey: process.env.POLAR_API_KEY!,
      webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
    }),`;
      }
    });

    authTs += `
  ],`;
  }

  // Add session configuration
  if (authConfig.session) {
    authTs += `
  session: {
    expiresIn: ${
      authConfig.session.expiresIn || 60 * 60 * 24 * 7
    }, // ${Math.floor(
      (authConfig.session.expiresIn || 60 * 60 * 24 * 7) / (60 * 60 * 24)
    )} days
    updateAge: ${authConfig.session.updateAge || 60 * 60 * 24}, // 1 day
  },`;
  }

  // Add user configuration
  if (authConfig.user) {
    authTs += `
  user: {
    additionalFields: ${JSON.stringify(
      authConfig.user.additionalFields || {},
      null,
      4
    )},
  },`;
  }

  // Add trusted origins
  if (authConfig.trustedOrigins) {
    authTs += `
  trustedOrigins: ${JSON.stringify(authConfig.trustedOrigins)},`;
  }

  // Add base URL
  if (authConfig.baseURL) {
    authTs += `
  baseURL: "${authConfig.baseURL}",`;
  }

  // Add secret
  if (authConfig.secret) {
    authTs += `
  secret: process.env.BETTER_AUTH_SECRET!,`;
  }

  authTs += `
});`;

  return authTs;
}

function main() {
  const jsonFilePath = process.argv[2];

  if (!jsonFilePath) {
    console.error("Error: Please provide a JSON file path");
    console.error("Usage: tsx json-to-auth.ts <path-to-json-file>");
    process.exit(1);
  }

  if (!fs.existsSync(jsonFilePath)) {
    console.error("Error: JSON file not found at:", jsonFilePath);
    process.exit(1);
  }

  try {
    const jsonContent = fs.readFileSync(jsonFilePath, "utf-8");
    const jsonData = JSON.parse(jsonContent);

    let authConfig: AuthConfig;

    // Check if it's a graph config (has nodes and edges) or regular auth config
    if (jsonData.nodes && jsonData.edges) {
      // It's a graph config, convert it to auth config
      authConfig = convertGraphToAuthConfig(jsonData as GraphConfig);
    } else {
      // It's a regular auth config
      authConfig = jsonData as AuthConfig;
    }

    const authTsContent = generateAuthTs(authConfig);
    console.log(authTsContent);
  } catch (error) {
    console.error("Error parsing JSON file:", error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { generateAuthTs, convertGraphToAuthConfig };
