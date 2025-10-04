import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { rateLimit } from "better-auth/plugins/rate-limit";
import { organization } from "better-auth/plugins/organization";

const prisma = new PrismaClient();

export const auth = betterAuth({
  adapter: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minLength: 8,
    maxLength: 128,
    autoSignIn: true,
    resetTokenExpiresIn: 3600,
    sendResetPassword: async ({ user, url }) => {
      console.log(`Reset password email for ${user.email}: ${url}`);
    },
    sendVerificationEmail: async ({ user, url }) => {
      console.log(`Verification email for ${user.email}: ${url}`);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: false,
    autoSignInAfterVerification: true,
    tokenExpiresIn: 3600,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  account: {
    encryptOAuthTokens: true,
    updateOnSignIn: true,
    trustedProviders: ["google", "github", "email-password"],
    allowDifferentEmails: false,
  },
  plugins: [
    rateLimit({
      window: "60m",
      max: 100,
      skipSuccessfulRequests: false,
    }),
    organization({
      allowUserToCreateOrganization: true,
      allowUserToJoinOrganization: true,
      allowUserToLeaveOrganization: true,
      allowUserToDeleteOrganization: true,
      allowUserToInviteMembers: true,
      allowUserToRemoveMembers: true,
      allowUserToUpdateMemberRole: true,
      allowUserToUpdateOrganization: true,
    }),
  ],
  session: {
    expiresIn: 604800, // 7 days
    updateAge: 86400, // 1 day
  },
  user: {
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
  },
  trustedOrigins: [
    'process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"',
  ],
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET!,
});
