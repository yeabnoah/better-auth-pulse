import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { rateLimit } from "better-auth/plugins/rate-limit";
import { polar } from "better-auth/plugins/polar";

const prisma = new PrismaClient();

export const auth = betterAuth({
  adapter: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL,
    // url: "postgresql://localhost:5432/mydb", // Uncomment if you want to hardcode the URL
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minLength: 8,
    maxLength: 128,
    autoSignIn: false,
    resetTokenExpiresIn: 3600,
    sendResetPassword: async ({ user, url }) => { console.log(`Reset password email for ${user.email}: ${url}`); },
    sendVerificationEmail: async ({ user, url }) => { console.log(`Verification email for ${user.email}: ${url}`); },
  },
  plugins: [
    rateLimit({
      window: "60m",
      max: 10,
      skipSuccessfulRequests: false,
    }),
    polar({
      apiKey: process.env.POLAR_API_KEY!,
      webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
    }),
  ],
  session: {
    expiresIn: 604800, // 7 days
    updateAge: 86400, // 1 day
  },
  user: {
    additionalFields: {
    "role": {
        "type": "string",
        "defaultValue": "user",
        "required": false
    },
    "organizationId": {
        "type": "string",
        "required": false
    }
},
  },
  trustedOrigins: ["http://localhost:3000"],
  baseURL: "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET!,
});
