export const baseCode = {
  code: `
import { betterAuth } from "better-auth";

export const auth = betterAuth({
});
`,
};

export const prismaInit = {
  code: `const prisma = new PrismaClient();`,
  import: `import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";`,
};

export const prismaSetup = {
  code: `  database: prismaAdapter(prisma, {
  }),`,
};

export const provider = {
  code: `    provider: "sqlite",`,
};

// OAuth provider configurations
export const oauthProviders = {
  github: {
    import: `import { github } from "better-auth/plugins";`,
    config: `    github({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),`,
  },
  google: {
    import: `import { google } from "better-auth/plugins";`,
    config: `    google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),`,
  },
};

// Email provider configurations
export const emailProviders = {
  resend: {
    import: `import { resend } from "better-auth/plugins";`,
    config: `  email: resend({
    apiKey: process.env.RESEND_API_KEY!,
    from: process.env.RESEND_FROM_EMAIL!,
  }),`,
  },
};

// Event handler configurations
export const eventHandlers = {
  onLoginSuccess: {
    config: `  callbacks: {
    onLoginSuccess: async (user) => {
      console.log("User logged in:", user);
      // Add your custom logic here
    },
  },`,
  },
};

// Node type definitions for the flow editor
export const nodeTypeDefinitions = {
  authStarter: {
    label: "Auth Starter",
    description: "Empty auth.ts setup",
    color: "blue",
  },
  prismaDatabase: {
    label: "Prisma Database",
    description: "Database adapter",
    color: "green",
  },
  oauthGithub: {
    label: "GitHub OAuth",
    description: "OAuth Provider",
    color: "gray",
  },
  oauthGoogle: {
    label: "Google OAuth",
    description: "OAuth Provider",
    color: "red",
  },
  emailResend: {
    label: "Resend Email Provider",
    description: "Email Service",
    color: "purple",
  },
  eventHandler: {
    label: "onLoginSuccess",
    description: "Event Handler",
    color: "yellow",
  },
};
