export interface NodeTypeDefinition {
  type: string;
  label: string;
  category: string;
  description: string;
}

export const NODE_TYPES_FOR_SIDEBAR: NodeTypeDefinition[] = [
  // Authentication Core
  {
    type: "authStarter",
    label: "Auth Start",
    category: "authentication",
    description: "Authentication starter",
  },
  {
    type: "emailAuth",
    label: "Email + Password",
    category: "authentication",
    description: "Email and password authentication",
  },
  {
    type: "emailVerification",
    label: "Email Verification",
    category: "authentication",
    description: "Email verification settings",
  },
  {
    type: "socialLogin",
    label: "Social Login",
    category: "authentication",
    description: "Social login providers container",
  },
  {
    type: "oauthGoogle",
    label: "Google OAuth",
    category: "authentication",
    description: "Google OAuth provider",
  },
  {
    type: "oauthGithub",
    label: "GitHub OAuth",
    category: "authentication",
    description: "GitHub OAuth provider",
  },
  {
    type: "account",
    label: "Account Linking",
    category: "authentication",
    description: "Account linking configuration",
  },

  // Database & Storage
  {
    type: "database",
    label: "Database",
    category: "database",
    description: "Database configuration",
  },
  {
    type: "prisma",
    label: "Prisma Adapter",
    category: "database",
    description: "Prisma database adapter",
  },
  {
    type: "drizzle",
    label: "Drizzle Adapter",
    category: "database",
    description: "Drizzle database adapter",
  },
  {
    type: "provider",
    label: "DB Provider",
    category: "database",
    description: "Database provider selection",
  },
  {
    type: "sqlite",
    label: "SQLite",
    category: "database",
    description: "SQLite database",
  },
  {
    type: "postgresql",
    label: "PostgreSQL",
    category: "database",
    description: "PostgreSQL database",
  },
  {
    type: "mysql",
    label: "MySQL",
    category: "database",
    description: "MySQL database",
  },

  // Security & Rate Limiting
  {
    type: "rateLimit",
    label: "Rate Limiting",
    category: "security",
    description: "Rate limiting configuration",
  },
  {
    type: "cors",
    label: "CORS",
    category: "security",
    description: "CORS configuration",
  },
  {
    type: "csrf",
    label: "CSRF Protection",
    category: "security",
    description: "CSRF protection settings",
  },

  // Email & Communication
  {
    type: "emailResend",
    label: "Resend Email",
    category: "plugins",
    description: "Resend email service",
  },
  {
    type: "emailSendGrid",
    label: "SendGrid",
    category: "plugins",
    description: "SendGrid email service",
  },
  {
    type: "emailNodemailer",
    label: "Nodemailer",
    category: "plugins",
    description: "Nodemailer email service",
  },

  // Advanced Features
  {
    type: "session",
    label: "Session Config",
    category: "configuration",
    description: "Session configuration",
  },
  {
    type: "cookies",
    label: "Cookie Config",
    category: "configuration",
    description: "Cookie configuration",
  },
  {
    type: "advanced",
    label: "Advanced Config",
    category: "configuration",
    description: "Advanced authentication settings",
  },
  {
    type: "middleware",
    label: "Middleware",
    category: "plugins",
    description: "Custom middleware",
  },
  {
    type: "eventHandler",
    label: "Event Handler",
    category: "plugins",
    description: "Custom event handler",
  },
  {
    type: "hooks",
    label: "Hooks",
    category: "plugins",
    description: "Authentication hooks",
  },
  {
    type: "organization",
    label: "Organization Plugin",
    category: "plugins",
    description: "User access and permissions management",
  },
  {
    type: "organizationClient",
    label: "Organization Client",
    category: "plugins",
    description: "Organization client for frontend",
  },
];

export const NODE_DIMENSIONS = {
  width: 150,
  height: 50,
} as const;

export const CATEGORY_COLORS = {
  database: "border-blue-500 bg-blue-900/20",
  authentication: "border-green-500 bg-green-900/20",
  plugins: "border-purple-500 bg-purple-900/20",
  security: "border-red-500 bg-red-900/20",
  configuration: "border-yellow-500 bg-yellow-900/20",
  default: "border-gray-600 bg-gray-800",
} as const;

export const CATEGORY_DOT_COLORS = {
  authentication: "#10b981",
  database: "#3b82f6",
  plugins: "#8b5cf6",
  security: "#ef4444",
  configuration: "#eab308",
  default: "#6b7280",
} as const;
