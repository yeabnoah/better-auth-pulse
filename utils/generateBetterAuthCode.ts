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
    cookiePrefix?: string;
    crossSubDomainCookies?: {
      enabled: boolean;
      domain?: string;
    };
  };
  emailService?: {
    provider: string;
    apiKey?: string;
    fromEmail?: string;
  };
  security?: {
    cors?: {
      origin?: string[];
      credentials?: boolean;
    };
    csrf?: {
      enabled: boolean;
      secret?: string;
    };
  };
  session?: {
    maxAge?: number;
    updateAge?: number;
    generateSessionId?: boolean;
  };
  cookies?: {
    name?: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: string;
  };
  plugins?: string[];
  middleware?: string[];
  hooks?: string[];
  organization?: {
    enabled: boolean;
    allowUserToCreateOrganization?: boolean;
    allowUserToJoinOrganization?: boolean;
    allowUserToLeaveOrganization?: boolean;
    allowUserToDeleteOrganization?: boolean;
    allowUserToUpdateOrganization?: boolean;
    allowUserToInviteUserToOrganization?: boolean;
    allowUserToRemoveUserFromOrganization?: boolean;
    allowUserToUpdateUserRoleInOrganization?: boolean;
    allowUserToUpdateOrganizationRole?: boolean;
    allowUserToDeleteOrganizationRole?: boolean;
    allowUserToCreateOrganizationRole?: boolean;
    allowUserToUpdateUserPermissionInOrganization?: boolean;
    allowUserToUpdateOrganizationPermission?: boolean;
    allowUserToDeleteOrganizationPermission?: boolean;
    allowUserToCreateOrganizationPermission?: boolean;
    allowUserToUpdateUserRoleInOrganization?: boolean;
    allowUserToUpdateOrganizationRole?: boolean;
    allowUserToDeleteOrganizationRole?: boolean;
    allowUserToCreateOrganizationRole?: boolean;
    allowUserToUpdateUserPermissionInOrganization?: boolean;
    allowUserToUpdateOrganizationPermission?: boolean;
    allowUserToDeleteOrganizationPermission?: boolean;
    allowUserToCreateOrganizationPermission?: boolean;
  };
}

function analyzeFlowNodes(nodes: Node[], edges: Edge[]): AuthConfig {
  const config: AuthConfig = {};

  // Find connected nodes (only process nodes connected to authStarter)
  const authStarterNode = nodes.find((n) => n.type === "authStarter");
  if (!authStarterNode) return config;

  const connectedNodeIds = new Set<string>();
  const visited = new Set<string>();

  function traverse(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    connectedNodeIds.add(nodeId);

    edges.forEach((edge) => {
      if (edge.source === nodeId && !visited.has(edge.target)) {
        traverse(edge.target);
      }
      if (edge.target === nodeId && !visited.has(edge.source)) {
        traverse(edge.source);
      }
    });
  }

  traverse(authStarterNode.id);
  const connectedNodes = nodes.filter((n) => connectedNodeIds.has(n.id));

  // Analyze database configuration
  const databaseNode = connectedNodes.find((n) => n.type === "database");
  const prismaNode = connectedNodes.find((n) => n.type === "prisma");
  const drizzleNode = connectedNodes.find((n) => n.type === "drizzle");
  const providerNode = connectedNodes.find((n) => n.type === "provider");
  const sqliteNode = connectedNodes.find((n) => n.type === "sqlite");
  const postgresqlNode = connectedNodes.find((n) => n.type === "postgresql");
  const mysqlNode = connectedNodes.find((n) => n.type === "mysql");

  if (databaseNode && (prismaNode || drizzleNode)) {
    let provider = "sqlite"; // default
    if (sqliteNode) provider = "sqlite";
    else if (postgresqlNode) provider = "postgresql";
    else if (mysqlNode) provider = "mysql";

    config.database = {
      adapter: prismaNode ? "prisma" : "drizzle",
      provider: provider,
    };
  }

  // Analyze email authentication
  const emailAuthNode = connectedNodes.find((n) => n.type === "emailAuth");
  if (emailAuthNode) {
    config.emailPassword = {
      enabled: true,
      minLength: emailAuthNode.data.minLength || 8,
      maxLength: emailAuthNode.data.maxLength || 128,
      requireVerification: emailAuthNode.data.requireVerification || false,
      autoSignIn: emailAuthNode.data.autoSignIn || true,
      resetTokenExpiresIn: emailAuthNode.data.resetTokenExpiresIn || 3600,
    };
  }

  // Analyze email verification
  const emailVerificationNode = connectedNodes.find(
    (n) => n.type === "emailVerification"
  );
  if (emailVerificationNode) {
    config.emailVerification = {
      sendOnSignUp: emailVerificationNode.data.sendOnSignUp || true,
      sendOnSignIn: emailVerificationNode.data.sendOnSignIn || false,
      autoSignInAfterVerification:
        emailVerificationNode.data.autoSignInAfterVerification || true,
      tokenExpiresIn: emailVerificationNode.data.tokenExpiresIn || 3600,
    };
  }

  // Analyze social providers
  const socialProviders: string[] = [];
  const googleNode = connectedNodes.find((n) => n.type === "oauthGoogle");
  const githubNode = connectedNodes.find((n) => n.type === "oauthGithub");

  if (googleNode) socialProviders.push("google");
  if (githubNode) socialProviders.push("github");

  if (socialProviders.length > 0) {
    config.socialProviders = socialProviders;
  }

  // Analyze account linking
  const accountNode = connectedNodes.find((n) => n.type === "account");
  if (accountNode) {
    config.accountLinking = {
      encryptOAuthTokens: accountNode.data.encryptOAuthTokens || true,
      updateOnSignIn: accountNode.data.updateOnSignIn || true,
      trustedProviders: accountNode.data.trustedProviders || [],
      allowDifferentEmails: accountNode.data.allowDifferentEmails || false,
    };
  }

  // Analyze rate limiting
  const rateLimitNode = connectedNodes.find((n) => n.type === "rateLimit");
  if (rateLimitNode) {
    config.rateLimit = {
      window: rateLimitNode.data.window || 60,
      maxRequests: rateLimitNode.data.maxRequests || 100,
      customRules: rateLimitNode.data.customRules || {},
    };
  }

  // Analyze advanced options
  const advancedNode = connectedNodes.find((n) => n.type === "advanced");
  if (advancedNode) {
    config.advanced = {
      useSecureCookies: advancedNode.data.useSecureCookies || true,
      httpOnlyCookies: advancedNode.data.httpOnlyCookies || true,
      secureCookies: advancedNode.data.secureCookies || true,
      cookiePrefix: advancedNode.data.cookiePrefix || "better-auth",
      crossSubDomainCookies: {
        enabled: advancedNode.data.crossSubDomainCookies?.enabled || true,
        domain: advancedNode.data.crossSubDomainCookies?.domain,
      },
    };
  }

  // Analyze email service
  const emailResendNode = connectedNodes.find((n) => n.type === "emailResend");
  const emailSendGridNode = connectedNodes.find(
    (n) => n.type === "emailSendGrid"
  );
  const emailNodemailerNode = connectedNodes.find(
    (n) => n.type === "emailNodemailer"
  );

  if (emailResendNode) {
    config.emailService = {
      provider: "resend",
      apiKey: emailResendNode.data.apiKey || "RESEND_API_KEY",
      fromEmail: emailResendNode.data.fromEmail || "noreply@yourdomain.com",
    };
  } else if (emailSendGridNode) {
    config.emailService = {
      provider: "sendgrid",
      apiKey: emailSendGridNode.data.apiKey || "SENDGRID_API_KEY",
      fromEmail: emailSendGridNode.data.fromEmail || "noreply@yourdomain.com",
    };
  } else if (emailNodemailerNode) {
    config.emailService = {
      provider: "nodemailer",
      apiKey: emailNodemailerNode.data.apiKey || "NODEMAILER_API_KEY",
      fromEmail: emailNodemailerNode.data.fromEmail || "noreply@yourdomain.com",
    };
  }

  // Analyze security features
  const corsNode = connectedNodes.find((n) => n.type === "cors");
  const csrfNode = connectedNodes.find((n) => n.type === "csrf");

  if (corsNode || csrfNode) {
    config.security = {};

    if (corsNode) {
      config.security.cors = {
        origin: corsNode.data.origin || ["http://localhost:3000"],
        credentials: corsNode.data.credentials || true,
      };
    }

    if (csrfNode) {
      config.security.csrf = {
        enabled: csrfNode.data.enabled || true,
        secret: csrfNode.data.secret || "CSRF_SECRET",
      };
    }
  }

  // Analyze session configuration
  const sessionNode = connectedNodes.find((n) => n.type === "session");
  if (sessionNode) {
    config.session = {
      maxAge: sessionNode.data.maxAge || 30 * 24 * 60 * 60, // 30 days
      updateAge: sessionNode.data.updateAge || 24 * 60 * 60, // 1 day
      generateSessionId: sessionNode.data.generateSessionId || true,
    };
  }

  // Analyze cookie configuration
  const cookiesNode = connectedNodes.find((n) => n.type === "cookies");
  if (cookiesNode) {
    config.cookies = {
      name: cookiesNode.data.name || "better-auth.session",
      httpOnly: cookiesNode.data.httpOnly || true,
      secure: cookiesNode.data.secure || true,
      sameSite: cookiesNode.data.sameSite || "lax",
    };
  }

  // Analyze plugins and middleware
  const middlewareNode = connectedNodes.find((n) => n.type === "middleware");
  const hooksNode = connectedNodes.find((n) => n.type === "hooks");
  const eventHandlerNode = connectedNodes.find(
    (n) => n.type === "eventHandler"
  );
  const organizationNode = connectedNodes.find(
    (n) => n.type === "organization"
  );

  const plugins: string[] = [];
  const middleware: string[] = [];
  const hooks: string[] = [];

  if (middlewareNode) {
    middleware.push("customMiddleware");
  }
  if (hooksNode) {
    hooks.push("customHooks");
  }
  if (eventHandlerNode) {
    plugins.push("eventHandler");
  }
  if (organizationNode) {
    plugins.push("organization");
    config.organization = {
      enabled: true,
      allowUserToCreateOrganization:
        organizationNode.data.allowUserToCreateOrganization ?? true,
      allowUserToJoinOrganization:
        organizationNode.data.allowUserToJoinOrganization ?? true,
      allowUserToLeaveOrganization:
        organizationNode.data.allowUserToLeaveOrganization ?? true,
      allowUserToDeleteOrganization:
        organizationNode.data.allowUserToDeleteOrganization ?? false,
      allowUserToUpdateOrganization:
        organizationNode.data.allowUserToUpdateOrganization ?? true,
      allowUserToInviteUserToOrganization:
        organizationNode.data.allowUserToInviteUserToOrganization ?? true,
      allowUserToRemoveUserFromOrganization:
        organizationNode.data.allowUserToRemoveUserFromOrganization ?? true,
      allowUserToUpdateUserRoleInOrganization:
        organizationNode.data.allowUserToUpdateUserRoleInOrganization ?? true,
      allowUserToUpdateOrganizationRole:
        organizationNode.data.allowUserToUpdateOrganizationRole ?? true,
      allowUserToDeleteOrganizationRole:
        organizationNode.data.allowUserToDeleteOrganizationRole ?? false,
      allowUserToCreateOrganizationRole:
        organizationNode.data.allowUserToCreateOrganizationRole ?? true,
      allowUserToUpdateUserPermissionInOrganization:
        organizationNode.data.allowUserToUpdateUserPermissionInOrganization ??
        true,
      allowUserToUpdateOrganizationPermission:
        organizationNode.data.allowUserToUpdateOrganizationPermission ?? true,
      allowUserToDeleteOrganizationPermission:
        organizationNode.data.allowUserToDeleteOrganizationPermission ?? false,
      allowUserToCreateOrganizationPermission:
        organizationNode.data.allowUserToCreateOrganizationPermission ?? true,
    };
  }

  if (middleware.length > 0) config.middleware = middleware;
  if (hooks.length > 0) config.hooks = hooks;
  if (plugins.length > 0) config.plugins = plugins;

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
    imports.push(
      'import { prismaAdapter } from "better-auth/adapters/prisma";'
    );
    imports.push('import { PrismaClient } from "@prisma/client";');
    adapters.push("const prisma = new PrismaClient();");
    authConfig.push(`  database: prismaAdapter(prisma, {
    provider: "${config.database.provider}",
  })`);
  } else if (config.database?.adapter === "drizzle") {
    imports.push(
      'import { drizzleAdapter } from "better-auth/adapters/drizzle";'
    );
    imports.push('import { drizzle } from "drizzle-orm/libsql";');
    imports.push('import { createClient } from "@libsql/client";');

    if (config.database.provider === "sqlite") {
      adapters.push("const client = createClient({");
      adapters.push("  url: process.env.DATABASE_URL!");
      adapters.push("});");
      adapters.push("const db = drizzle(client);");
    } else if (config.database.provider === "postgresql") {
      imports.push('import { drizzle } from "drizzle-orm/postgres-js";');
      imports.push('import postgres from "postgres";');
      adapters.push("const client = postgres(process.env.DATABASE_URL!);");
      adapters.push("const db = drizzle(client);");
    } else if (config.database.provider === "mysql") {
      imports.push('import { drizzle } from "drizzle-orm/mysql2";');
      imports.push('import mysql from "mysql2/promise";');
      adapters.push(
        "const connection = await mysql.createConnection(process.env.DATABASE_URL!);"
      );
      adapters.push("const db = drizzle(connection);");
    }

    authConfig.push(`  database: drizzleAdapter(db, {
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
    const socialConfig = config.socialProviders
      .map((provider) => {
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
      })
      .filter(Boolean)
      .join(",\n");

    authConfig.push(`  socialProviders: {
${socialConfig}
  }`);
  }

  // Account linking
  if (config.accountLinking) {
    authConfig.push(`  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ${JSON.stringify(
        config.accountLinking.trustedProviders
      )},
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
    cookiePrefix: "${config.advanced.cookiePrefix || "better-auth"}",
    crossSubDomainCookies: {
      enabled: ${config.advanced.crossSubDomainCookies?.enabled || true},
      domain: process.env.COOKIE_DOMAIN,
    }
  }`);
  }

  // Email service configuration
  if (config.emailService) {
    if (config.emailService.provider === "resend") {
      imports.push('import { resend } from "better-auth/plugins/resend";');
      plugins.push("resend({");
      plugins.push("  apiKey: process.env.RESEND_API_KEY!,");
      plugins.push(
        '  from: "' +
          (config.emailService.fromEmail || "noreply@yourdomain.com") +
          '",'
      );
      plugins.push("})");
    } else if (config.emailService.provider === "sendgrid") {
      imports.push('import { sendgrid } from "better-auth/plugins/sendgrid";');
      plugins.push("sendgrid({");
      plugins.push("  apiKey: process.env.SENDGRID_API_KEY!,");
      plugins.push(
        '  from: "' +
          (config.emailService.fromEmail || "noreply@yourdomain.com") +
          '",'
      );
      plugins.push("})");
    } else if (config.emailService.provider === "nodemailer") {
      imports.push(
        'import { nodemailer } from "better-auth/plugins/nodemailer";'
      );
      plugins.push("nodemailer({");
      plugins.push("  host: process.env.SMTP_HOST,");
      plugins.push("  port: process.env.SMTP_PORT,");
      plugins.push("  auth: {");
      plugins.push("    user: process.env.SMTP_USER,");
      plugins.push("    pass: process.env.SMTP_PASS,");
      plugins.push("  },");
      plugins.push("})");
    }
  }

  // Security configuration
  if (config.security) {
    if (config.security.cors) {
      authConfig.push(`  cors: {
    origin: ${JSON.stringify(config.security.cors.origin)},
    credentials: ${config.security.cors.credentials},
  }`);
    }

    if (config.security.csrf) {
      authConfig.push(`  csrf: {
    enabled: ${config.security.csrf.enabled},
    secret: process.env.CSRF_SECRET || "${config.security.csrf.secret}",
  }`);
    }
  }

  // Session configuration
  if (config.session) {
    authConfig.push(`  session: {
    maxAge: ${config.session.maxAge},
    updateAge: ${config.session.updateAge},
    generateSessionId: ${config.session.generateSessionId},
  }`);
  }

  // Cookie configuration
  if (config.cookies) {
    authConfig.push(`  cookies: {
    name: "${config.cookies.name}",
    httpOnly: ${config.cookies.httpOnly},
    secure: ${config.cookies.secure},
    sameSite: "${config.cookies.sameSite}",
  }`);
  }

  // Base URL and secret
  authConfig.unshift(
    `  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000"`
  );
  authConfig.unshift(`  secret: process.env.BETTER_AUTH_SECRET!`);

  // Organization plugin configuration
  if (config.organization?.enabled) {
    imports.push('import { organization } from "better-auth/plugins";');

    const orgConfig = [];
    if (config.organization.allowUserToCreateOrganization !== undefined) {
      orgConfig.push(
        `    allowUserToCreateOrganization: ${config.organization.allowUserToCreateOrganization}`
      );
    }
    if (config.organization.allowUserToJoinOrganization !== undefined) {
      orgConfig.push(
        `    allowUserToJoinOrganization: ${config.organization.allowUserToJoinOrganization}`
      );
    }
    if (config.organization.allowUserToLeaveOrganization !== undefined) {
      orgConfig.push(
        `    allowUserToLeaveOrganization: ${config.organization.allowUserToLeaveOrganization}`
      );
    }
    if (config.organization.allowUserToDeleteOrganization !== undefined) {
      orgConfig.push(
        `    allowUserToDeleteOrganization: ${config.organization.allowUserToDeleteOrganization}`
      );
    }
    if (config.organization.allowUserToUpdateOrganization !== undefined) {
      orgConfig.push(
        `    allowUserToUpdateOrganization: ${config.organization.allowUserToUpdateOrganization}`
      );
    }
    if (config.organization.allowUserToInviteUserToOrganization !== undefined) {
      orgConfig.push(
        `    allowUserToInviteUserToOrganization: ${config.organization.allowUserToInviteUserToOrganization}`
      );
    }
    if (
      config.organization.allowUserToRemoveUserFromOrganization !== undefined
    ) {
      orgConfig.push(
        `    allowUserToRemoveUserFromOrganization: ${config.organization.allowUserToRemoveUserFromOrganization}`
      );
    }
    if (
      config.organization.allowUserToUpdateUserRoleInOrganization !== undefined
    ) {
      orgConfig.push(
        `    allowUserToUpdateUserRoleInOrganization: ${config.organization.allowUserToUpdateUserRoleInOrganization}`
      );
    }
    if (config.organization.allowUserToUpdateOrganizationRole !== undefined) {
      orgConfig.push(
        `    allowUserToUpdateOrganizationRole: ${config.organization.allowUserToUpdateOrganizationRole}`
      );
    }
    if (config.organization.allowUserToDeleteOrganizationRole !== undefined) {
      orgConfig.push(
        `    allowUserToDeleteOrganizationRole: ${config.organization.allowUserToDeleteOrganizationRole}`
      );
    }
    if (config.organization.allowUserToCreateOrganizationRole !== undefined) {
      orgConfig.push(
        `    allowUserToCreateOrganizationRole: ${config.organization.allowUserToCreateOrganizationRole}`
      );
    }
    if (
      config.organization.allowUserToUpdateUserPermissionInOrganization !==
      undefined
    ) {
      orgConfig.push(
        `    allowUserToUpdateUserPermissionInOrganization: ${config.organization.allowUserToUpdateUserPermissionInOrganization}`
      );
    }
    if (
      config.organization.allowUserToUpdateOrganizationPermission !== undefined
    ) {
      orgConfig.push(
        `    allowUserToUpdateOrganizationPermission: ${config.organization.allowUserToUpdateOrganizationPermission}`
      );
    }
    if (
      config.organization.allowUserToDeleteOrganizationPermission !== undefined
    ) {
      orgConfig.push(
        `    allowUserToDeleteOrganizationPermission: ${config.organization.allowUserToDeleteOrganizationPermission}`
      );
    }
    if (
      config.organization.allowUserToCreateOrganizationPermission !== undefined
    ) {
      orgConfig.push(
        `    allowUserToCreateOrganizationPermission: ${config.organization.allowUserToCreateOrganizationPermission}`
      );
    }

    if (orgConfig.length > 0) {
      plugins.push(`organization({
${orgConfig.join(",\n")}
  })`);
    } else {
      plugins.push("organization()");
    }
  }

  // Add plugins to auth config if any
  if (plugins.length > 0) {
    authConfig.push(`  plugins: [
    ${plugins.join(",\n    ")}
  ]`);
  }

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
    "export type User = typeof auth.$Infer.User;",
  ].join("\n");

  return code;
}

export function generateEnvTemplate(nodes: Node[], edges: Edge[]): string {
  const config = analyzeFlowNodes(nodes, edges);

  const envVars = [
    "# Better Auth Configuration",
    "BETTER_AUTH_SECRET=your-secret-key-here",
    "BETTER_AUTH_URL=http://localhost:3000",
    "",
  ];

  if (config.database?.adapter === "prisma") {
    envVars.push("# Database (Prisma)");
    if (config.database.provider === "sqlite") {
      envVars.push('DATABASE_URL="file:./dev.db"');
    } else if (config.database.provider === "postgresql") {
      envVars.push(
        'DATABASE_URL="postgresql://username:password@localhost:5432/database"'
      );
    } else if (config.database.provider === "mysql") {
      envVars.push(
        'DATABASE_URL="mysql://username:password@localhost:3306/database"'
      );
    } else {
      envVars.push(
        'DATABASE_URL="postgresql://username:password@localhost:5432/database"'
      );
    }
    envVars.push("");
  } else if (config.database?.adapter === "drizzle") {
    envVars.push("# Database (Drizzle)");
    if (config.database.provider === "sqlite") {
      envVars.push('DATABASE_URL="file:./dev.db"');
      envVars.push("# For libsql (recommended for SQLite with Drizzle)");
      envVars.push('# DATABASE_URL="libsql://your-database.turso.io"');
    } else if (config.database.provider === "postgresql") {
      envVars.push(
        'DATABASE_URL="postgresql://username:password@localhost:5432/database"'
      );
    } else if (config.database.provider === "mysql") {
      envVars.push(
        'DATABASE_URL="mysql://username:password@localhost:3306/database"'
      );
    } else {
      envVars.push(
        'DATABASE_URL="postgresql://username:password@localhost:5432/database"'
      );
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

  if (config.emailService) {
    envVars.push("# Email Service");
    if (config.emailService.provider === "resend") {
      envVars.push("RESEND_API_KEY=your-resend-api-key");
    } else if (config.emailService.provider === "sendgrid") {
      envVars.push("SENDGRID_API_KEY=your-sendgrid-api-key");
    } else if (config.emailService.provider === "nodemailer") {
      envVars.push("SMTP_HOST=smtp.gmail.com");
      envVars.push("SMTP_PORT=587");
      envVars.push("SMTP_USER=your-email@gmail.com");
      envVars.push("SMTP_PASS=your-app-password");
    }
    envVars.push("");
  }

  if (config.security?.csrf) {
    envVars.push("# Security");
    envVars.push("CSRF_SECRET=your-csrf-secret-key");
    envVars.push("");
  }

  if (config.advanced) {
    envVars.push("# Advanced Options");
    envVars.push("COOKIE_DOMAIN=.yourdomain.com");
    envVars.push("");
  }

  return envVars.join("\n");
}

export function generateOrganizationClient(
  nodes: Node[],
  edges: Edge[]
): string {
  const config = analyzeFlowNodes(nodes, edges);

  if (!config.organization?.enabled) {
    return "// Organization plugin not enabled";
  }

  const clientCode = `import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [organizationClient()],
});

// Organization client methods
export const {
  // Organization management
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganization,
  getOrganizations,
  
  // User management in organizations
  inviteUserToOrganization,
  removeUserFromOrganization,
  updateUserRoleInOrganization,
  getUsersInOrganization,
  
  // Role management
  createOrganizationRole,
  updateOrganizationRole,
  deleteOrganizationRole,
  getOrganizationRoles,
  
  // Permission management
  createOrganizationPermission,
  updateOrganizationPermission,
  deleteOrganizationPermission,
  getOrganizationPermissions,
  updateUserPermissionInOrganization,
  
  // User organization operations
  joinOrganization,
  leaveOrganization,
  getUserOrganizations,
} = authClient;

// Types
export type Organization = typeof authClient.$Infer.Organization;
export type OrganizationRole = typeof authClient.$Infer.OrganizationRole;
export type OrganizationPermission = typeof authClient.$Infer.OrganizationPermission;
export type UserOrganization = typeof authClient.$Infer.UserOrganization;
`;

  return clientCode;
}
