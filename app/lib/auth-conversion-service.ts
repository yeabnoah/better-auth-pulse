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
    additionalFields?: Record<string, unknown>;
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
    config?: Record<string, unknown>;
    [key: string]: unknown; // Allow any additional properties
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
    const provider =
      databaseNode.data.config?.provider ||
      databaseNode.data.provider ||
      "postgresql";

    authConfig.database = {
      provider: String(provider),
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
      requireEmailVerification:
        Boolean(emailAuthNode.data.requireEmailVerification) || false,
      minLength: Number(emailAuthNode.data.minLength) || 8,
      maxLength: Number(emailAuthNode.data.maxLength) || 128,
      autoSignIn: Boolean(emailAuthNode.data.autoSignIn) || false,
      resetTokenExpiresIn:
        Number(emailAuthNode.data.resetTokenExpiresIn) || 3600,
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
      sendOnSignUp: Boolean(emailVerificationNode.data.sendOnSignUp) || true,
      sendOnSignIn: Boolean(emailVerificationNode.data.sendOnSignIn) || false,
      autoSignInAfterVerification:
        Boolean(emailVerificationNode.data.autoSignInAfterVerification) || true,
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
      encryptOAuthTokens: Boolean(accountNode.data.encryptOAuthTokens) || true,
      updateOnSignIn: Boolean(accountNode.data.updateOnSignIn) || true,
      trustedProviders: Array.isArray(accountNode.data.trustedProviders)
        ? (accountNode.data.trustedProviders as string[])
        : [],
      allowDifferentEmails:
        Boolean(accountNode.data.allowDifferentEmails) || false,
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
      customRules:
        (rateLimitNode.data.customRules as Record<
          string,
          { window: number; max: number }
        >) || {},
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

// Function to extract environment variables from node configurations
export function extractEnvironmentVariables(
  nodes: GraphNode[]
): Record<string, string> {
  const envVars: Record<string, string> = {};

  // Database configuration
  const databaseNode = nodes.find(
    (node) => node.type === "prismaDatabase" || node.type === "database"
  );
  if (databaseNode && databaseNode.data.config) {
    if (
      databaseNode.data.config.databaseUrl &&
      typeof databaseNode.data.config.databaseUrl === "string"
    ) {
      envVars.DATABASE_URL = databaseNode.data.config.databaseUrl;
    }
  }

  // OAuth providers
  const oauthNodes = nodes.filter((node) => node.type.startsWith("oauth"));
  oauthNodes.forEach((node) => {
    if (node.data.config) {
      const provider = node.type.replace("oauth", "").toUpperCase();
      if (
        node.data.config.clientId &&
        typeof node.data.config.clientId === "string"
      ) {
        envVars[`${provider}_CLIENT_ID`] = node.data.config.clientId;
      }
      if (
        node.data.config.clientSecret &&
        typeof node.data.config.clientSecret === "string"
      ) {
        envVars[`${provider}_CLIENT_SECRET`] = node.data.config.clientSecret;
      }
    }
  });

  // Email configuration
  const emailNode = nodes.find((node) => node.type === "emailResend");
  if (emailNode && emailNode.data.config) {
    if (
      emailNode.data.config.apiKey &&
      typeof emailNode.data.config.apiKey === "string"
    ) {
      envVars.RESEND_API_KEY = emailNode.data.config.apiKey;
    }
    if (
      emailNode.data.config.fromEmail &&
      typeof emailNode.data.config.fromEmail === "string"
    ) {
      envVars.FROM_EMAIL = emailNode.data.config.fromEmail;
    }
  }

  // Session configuration
  const sessionNode = nodes.find((node) => node.type === "session");
  if (sessionNode && sessionNode.data.config) {
    if (
      sessionNode.data.config.secret &&
      typeof sessionNode.data.config.secret === "string"
    ) {
      envVars.BETTER_AUTH_SECRET = sessionNode.data.config.secret;
    }
  }

  // Advanced configuration
  const advancedNode = nodes.find((node) => node.type === "advanced");
  if (advancedNode && advancedNode.data.config) {
    if (
      advancedNode.data.config.baseUrl &&
      typeof advancedNode.data.config.baseUrl === "string"
    ) {
      envVars.NEXT_PUBLIC_APP_URL = advancedNode.data.config.baseUrl;
    }
    if (
      advancedNode.data.config.secret &&
      typeof advancedNode.data.config.secret === "string"
    ) {
      envVars.BETTER_AUTH_SECRET = advancedNode.data.config.secret;
    }
  }

  // Polar plugin configuration
  const polarNode = nodes.find((node) => node.type === "polar");
  if (polarNode && polarNode.data.config) {
    if (
      polarNode.data.config.apiKey &&
      typeof polarNode.data.config.apiKey === "string"
    ) {
      envVars.POLAR_API_KEY = polarNode.data.config.apiKey;
    }
    if (
      polarNode.data.config.webhookSecret &&
      typeof polarNode.data.config.webhookSecret === "string"
    ) {
      envVars.POLAR_WEBHOOK_SECRET = polarNode.data.config.webhookSecret;
    }
  }

  return envVars;
}

// Function to generate .env file content
export function generateEnvFile(envVars: Record<string, string>): string {
  let envContent = `# Better Auth Environment Variables
# Generated by Better Auth Pulse Studio

`;

  // Add required variables with comments
  const requiredVars = [
    { key: "DATABASE_URL", comment: "Database connection string" },
    {
      key: "BETTER_AUTH_SECRET",
      comment:
        "Secret key for Better Auth (generate with: openssl rand -base64 32)",
    },
    {
      key: "NEXT_PUBLIC_APP_URL",
      comment: "Your app URL (e.g., http://localhost:3000)",
    },
  ];

  requiredVars.forEach(({ key, comment }) => {
    if (envVars[key]) {
      envContent += `${key}=${envVars[key]}  # ${comment}\n`;
    } else {
      envContent += `${key}=  # ${comment} - REQUIRED\n`;
    }
  });

  envContent += `\n# OAuth Provider Credentials\n`;

  // Add OAuth variables
  const oauthVars = Object.keys(envVars).filter(
    (key) => key.includes("_CLIENT_ID") || key.includes("_CLIENT_SECRET")
  );

  if (oauthVars.length > 0) {
    oauthVars.forEach((key) => {
      const provider = key.split("_")[0];
      const type = key.includes("CLIENT_ID") ? "Client ID" : "Client Secret";
      envContent += `${key}=${envVars[key]}  # ${provider} OAuth ${type}\n`;
    });
  } else {
    envContent += `# Add your OAuth provider credentials here
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# GITHUB_CLIENT_ID=
# GITHUB_CLIENT_SECRET=
`;
  }

  envContent += `\n# Email Configuration\n`;

  // Add email variables
  const emailVars = ["RESEND_API_KEY", "FROM_EMAIL"];
  emailVars.forEach((key) => {
    if (envVars[key]) {
      const comment =
        key === "RESEND_API_KEY"
          ? "Resend API key for sending emails"
          : "From email address";
      envContent += `${key}=${envVars[key]}  # ${comment}\n`;
    } else {
      const comment =
        key === "RESEND_API_KEY"
          ? "Resend API key for sending emails"
          : "From email address";
      envContent += `${key}=  # ${comment} - OPTIONAL\n`;
    }
  });

  envContent += `\n# Plugin Configuration\n`;

  // Add plugin variables
  const pluginVars = ["POLAR_API_KEY", "POLAR_WEBHOOK_SECRET"];
  pluginVars.forEach((key) => {
    if (envVars[key]) {
      const comment =
        key === "POLAR_API_KEY" ? "Polar API key" : "Polar webhook secret";
      envContent += `${key}=${envVars[key]}  # ${comment}\n`;
    } else {
      const comment =
        key === "POLAR_API_KEY" ? "Polar API key" : "Polar webhook secret";
      envContent += `${key}=  # ${comment} - OPTIONAL\n`;
    }
  });

  return envContent;
}
