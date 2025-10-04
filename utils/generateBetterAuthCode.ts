import { Node, Edge } from "./convertPulseConfigToFlowNodes";

interface AuthConfig {
  database?: {
    adapter: string;
    provider: string;
  };
  emailPassword?: {
    enabled: boolean;
    minLength?: number;
    maxLength?: number;
    requireVerification?: boolean;
    autoSignIn?: boolean;
    resetTokenExpiresIn?: number;
  };
  emailVerification?: {
    sendOnSignUp?: boolean;
    sendOnSignIn?: boolean;
    autoSignInAfterVerification?: boolean;
    tokenExpiresIn?: number;
  };
  socialProviders?: string[];
  accountLinking?: {
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
  advanced?: {
    useSecureCookies?: boolean;
    httpOnlyCookies?: boolean;
    secureCookies?: boolean;
  };
}

function analyzeFlowNodes(nodes: Node[], edges: Edge[]): AuthConfig {
  const config: AuthConfig = {};
  
  // Find connected nodes (only process nodes connected to authStarter)
  const authStarterNode = nodes.find(n => n.type === "authStarter");
  if (!authStarterNode) return config;
  
  const connectedNodeIds = new Set<string>();
  const visited = new Set<string>();
  
  function traverse(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    connectedNodeIds.add(nodeId);
    
    edges.forEach(edge => {
      if (edge.source === nodeId && !visited.has(edge.target)) {
        traverse(edge.target);
      }
      if (edge.target === nodeId && !visited.has(edge.source)) {
        traverse(edge.source);
      }
    });
  }
  
  traverse(authStarterNode.id);
  const connectedNodes = nodes.filter(n => connectedNodeIds.has(n.id));
  
  // Analyze database configuration
  const databaseNode = connectedNodes.find(n => n.type === "database");
  const prismaNode = connectedNodes.find(n => n.type === "prisma");
  const sqliteNode = connectedNodes.find(n => n.type === "sqlite");
  
  if (databaseNode && prismaNode) {
    config.database = {
      adapter: "prisma",
      provider: sqliteNode ? "sqlite" : "postgresql"
    };
  }
  
  // Analyze email authentication
  const emailAuthNode = connectedNodes.find(n => n.type === "emailAuth");
  if (emailAuthNode) {
    config.emailPassword = {
      enabled: true,
      minLength: emailAuthNode.data.minLength || 8,
      maxLength: emailAuthNode.data.maxLength || 128,
      requireVerification: emailAuthNode.data.requireVerification || false,
      autoSignIn: emailAuthNode.data.autoSignIn || true,
      resetTokenExpiresIn: emailAuthNode.data.resetTokenExpiresIn || 3600
    };
  }
  
  // Analyze email verification
  const emailVerificationNode = connectedNodes.find(n => n.type === "emailVerification");
  if (emailVerificationNode) {
    config.emailVerification = {
      sendOnSignUp: emailVerificationNode.data.sendOnSignUp || true,
      sendOnSignIn: emailVerificationNode.data.sendOnSignIn || false,
      autoSignInAfterVerification: emailVerificationNode.data.autoSignInAfterVerification || true,
      tokenExpiresIn: emailVerificationNode.data.tokenExpiresIn || 3600
    };
  }
  
  // Analyze social providers
  const socialProviders: string[] = [];
  const googleNode = connectedNodes.find(n => n.type === "oauthGoogle");
  const githubNode = connectedNodes.find(n => n.type === "oauthGithub");
  
  if (googleNode) socialProviders.push("google");
  if (githubNode) socialProviders.push("github");
  
  if (socialProviders.length > 0) {
    config.socialProviders = socialProviders;
  }
  
  // Analyze account linking
  const accountNode = connectedNodes.find(n => n.type === "account");
  if (accountNode) {
    config.accountLinking = {
      encryptOAuthTokens: accountNode.data.encryptOAuthTokens || true,
      updateOnSignIn: accountNode.data.updateOnSignIn || true,
      trustedProviders: accountNode.data.trustedProviders || [],
      allowDifferentEmails: accountNode.data.allowDifferentEmails || false
    };
  }
  
  // Analyze rate limiting
  const rateLimitNode = connectedNodes.find(n => n.type === "rateLimit");
  if (rateLimitNode) {
    config.rateLimit = {
      window: rateLimitNode.data.window || 60,
      maxRequests: rateLimitNode.data.maxRequests || 100,
      customRules: rateLimitNode.data.customRules || {}
    };
  }
  
  // Analyze advanced options
  const advancedNode = connectedNodes.find(n => n.type === "advanced");
  if (advancedNode) {
    config.advanced = {
      useSecureCookies: advancedNode.data.useSecureCookies || true,
      httpOnlyCookies: advancedNode.data.httpOnlyCookies || true,
      secureCookies: advancedNode.data.secureCookies || true
    };
  }
  
  return config;
}

export function generateBetterAuthCode(nodes: Node[], edges: Edge[]): string {
  const config = analyzeFlowNodes(nodes, edges);
  
  let imports = ['import { betterAuth } from "better-auth";'];
  let adapters = [];
  let plugins = [];
  let authConfig = [];
  
  // Database configuration
  if (config.database?.adapter === "prisma") {
    imports.push('import { prismaAdapter } from "better-auth/adapters/prisma";');
    imports.push('import { PrismaClient } from "@prisma/client";');
    adapters.push('const prisma = new PrismaClient();');
    authConfig.push(`  database: prismaAdapter(prisma, {
    provider: "${config.database.provider}",
  })`);
  }
  
  // Email and password configuration
  if (config.emailPassword?.enabled) {
    authConfig.push(`  emailAndPassword: {
    enabled: true,
    minPasswordLength: ${config.emailPassword.minLength},
    maxPasswordLength: ${config.emailPassword.maxLength},
    requireEmailVerification: ${config.emailPassword.requireVerification},
    autoSignIn: ${config.emailPassword.autoSignIn},
    resetPasswordTokenExpiresIn: ${config.emailPassword.resetTokenExpiresIn},
  }`);
  }
  
  // Email verification
  if (config.emailVerification) {
    authConfig.push(`  emailVerification: {
    sendOnSignUp: ${config.emailVerification.sendOnSignUp},
    sendOnSignIn: ${config.emailVerification.sendOnSignIn},
    autoSignInAfterVerification: ${config.emailVerification.autoSignInAfterVerification},
    tokenExpiresIn: ${config.emailVerification.tokenExpiresIn},
  }`);
  }
  
  // Social providers
  if (config.socialProviders && config.socialProviders.length > 0) {
    const socialConfig = config.socialProviders.map(provider => {
      if (provider === "google") {
        return `    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }`;
      }
      if (provider === "github") {
        return `    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }`;
      }
      return "";
    }).filter(Boolean).join(",\n");
    
    authConfig.push(`  socialProviders: {
${socialConfig}
  }`);
  }
  
  // Account linking
  if (config.accountLinking) {
    authConfig.push(`  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ${JSON.stringify(config.accountLinking.trustedProviders)},
      allowDifferentEmails: ${config.accountLinking.allowDifferentEmails},
    }
  }`);
  }
  
  // Rate limiting
  if (config.rateLimit) {
    authConfig.push(`  rateLimit: {
    window: ${config.rateLimit.window},
    max: ${config.rateLimit.maxRequests},
    customRules: ${JSON.stringify(config.rateLimit.customRules, null, 4)},
  }`);
  }
  
  // Advanced options
  if (config.advanced) {
    authConfig.push(`  advanced: {
    useSecureCookies: ${config.advanced.useSecureCookies},
    cookiePrefix: "better-auth",
    crossSubDomainCookies: {
      enabled: true,
      domain: process.env.COOKIE_DOMAIN,
    }
  }`);
  }
  
  // Base URL and secret
  authConfig.unshift(`  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000"`);
  authConfig.unshift(`  secret: process.env.BETTER_AUTH_SECRET!`);
  
  // Combine everything
  const code = [
    ...imports,
    "",
    ...adapters,
    "",
    "export const auth = betterAuth({",
    authConfig.join(",\n"),
    "});",
    "",
    "export type Session = typeof auth.$Infer.Session;",
    "export type User = typeof auth.$Infer.User;"
  ].join("\n");
  
  return code;
}

export function generateEnvTemplate(nodes: Node[], edges: Edge[]): string {
  const config = analyzeFlowNodes(nodes, edges);
  
  const envVars = [
    "# Better Auth Configuration",
    "BETTER_AUTH_SECRET=your-secret-key-here",
    "BETTER_AUTH_URL=http://localhost:3000",
    ""
  ];
  
  if (config.database?.adapter === "prisma") {
    envVars.push("# Database");
    if (config.database.provider === "sqlite") {
      envVars.push('DATABASE_URL="file:./dev.db"');
    } else {
      envVars.push('DATABASE_URL="postgresql://username:password@localhost:5432/database"');
    }
    envVars.push("");
  }
  
  if (config.socialProviders?.includes("google")) {
    envVars.push("# Google OAuth");
    envVars.push("GOOGLE_CLIENT_ID=your-google-client-id");
    envVars.push("GOOGLE_CLIENT_SECRET=your-google-client-secret");
    envVars.push("");
  }
  
  if (config.socialProviders?.includes("github")) {
    envVars.push("# GitHub OAuth");
    envVars.push("GITHUB_CLIENT_ID=your-github-client-id");
    envVars.push("GITHUB_CLIENT_SECRET=your-github-client-secret");
    envVars.push("");
  }
  
  if (config.advanced) {
    envVars.push("# Advanced Options");
    envVars.push("COOKIE_DOMAIN=.yourdomain.com");
    envVars.push("");
  }
  
  return envVars.join("\n");
}