// Enhanced auth conversion service for the UI
// This brings the improved JSON-to-auth conversion logic to the frontend

export interface AuthConfig {
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
    additionalFields?: Record<string, {
      type: string;
      defaultValue?: string | number | boolean;
      required?: boolean;
    }>;
  };
  plugins?: string[];
  trustedOrigins?: string[];
  baseURL?: string;
  secret?: string;
}

export interface GraphNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    provider?: string;
    [key: string]: string | number | boolean | undefined; // Allow additional properties
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  animated: boolean;
}

export interface GraphConfig {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function convertGraphToAuthConfig(graphConfig: GraphConfig): AuthConfig {
  const authConfig: AuthConfig = {};

  // Database configuration
  const databaseNode = graphConfig.nodes.find(
    (node) => node.type === "prismaDatabase" || node.type === "database"
  );
  if (databaseNode) {
    authConfig.database = {
      provider: String(databaseNode.data.provider) || "postgresql",
      url: "process.env.DATABASE_URL", // Use string for UI display
    };
  }

  // Email and Password configuration
  const emailAuthNode = graphConfig.nodes.find(
    (node) => node.type === "emailAuth"
  );
  if (emailAuthNode) {
    authConfig.emailAndPassword = {
      enabled: true,
      requireEmailVerification: Boolean(emailAuthNode.data.requireVerification) || false,
      minLength: Number(emailAuthNode.data.minLength) || 8,
      maxLength: Number(emailAuthNode.data.maxLength) || 128,
      autoSignIn: Boolean(emailAuthNode.data.autoSignIn) || false,
      resetTokenExpiresIn: Number(emailAuthNode.data.resetTokenExpiresIn) || 3600,
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
      sendOnSignUp: Boolean(emailVerificationNode.data.sendOnSignUp) !== false,
      sendOnSignIn: Boolean(emailVerificationNode.data.sendOnSignIn) || false,
      autoSignInAfterVerification:
        Boolean(emailVerificationNode.data.autoSignInAfterVerification) !== false,
      tokenExpiresIn: Number(emailVerificationNode.data.tokenExpiresIn) || 3600,
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
        clientId: `process.env.${envVarName}_CLIENT_ID!`,
        clientSecret: `process.env.${envVarName}_CLIENT_SECRET!`,
      };
    });
  }

  // Account configuration
  const accountNode = graphConfig.nodes.find((node) => node.type === "account");
  if (accountNode) {
    authConfig.account = {
      encryptOAuthTokens: Boolean(accountNode.data.encryptOAuthTokens) !== false,
      updateOnSignIn: Boolean(accountNode.data.updateOnSignIn) !== false,
      trustedProviders: Array.isArray(accountNode.data.trustedProviders) ? accountNode.data.trustedProviders : [],
      allowDifferentEmails: Boolean(accountNode.data.allowDifferentEmails) || false,
    };
  }

  // Rate limiting configuration
  const rateLimitNode = graphConfig.nodes.find(
    (node) => node.type === "rateLimit"
  );
  if (rateLimitNode) {
    authConfig.rateLimit = {
      window: Number(rateLimitNode.data.window) || 60,
      maxRequests: Number(rateLimitNode.data.maxRequests) || 100,
      customRules: typeof rateLimitNode.data.customRules === 'object' ? rateLimitNode.data.customRules : {},
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
      'process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"',
    ];
    authConfig.baseURL =
      'process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"';
    authConfig.secret = "process.env.BETTER_AUTH_SECRET!";
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

export function generateAuthTs(authConfig: AuthConfig): string {
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
    url: ${authConfig.database.url},`;

    if (
      authConfig.database.url &&
      authConfig.database.url !== "process.env.DATABASE_URL"
    ) {
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
      authTs += `
    ${provider}: {
      clientId: ${config.clientId},
      clientSecret: ${config.clientSecret},
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

    authConfig.plugins.forEach((plugin) => {
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
  baseURL: ${authConfig.baseURL},`;
  }

  // Add secret
  if (authConfig.secret) {
    authTs += `
  secret: ${authConfig.secret},`;
  }

  authTs += `
});`;

  return authTs;
}

// Enhanced function to convert flow nodes to auth config
export function convertFlowNodesToAuthConfig(
  nodes: GraphNode[],
  edges: GraphEdge[]
): AuthConfig {
  const graphConfig: GraphConfig = {
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: edge.animated,
    })),
  };

  return convertGraphToAuthConfig(graphConfig);
}
