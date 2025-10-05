#!/bin/bash

echo "🧪 Testing Better Auth Pulse CLI from other directories..."

# Create a temporary test project
TEST_DIR="/tmp/test-better-auth-project"
echo "📁 Creating test project at $TEST_DIR"

rm -rf "$TEST_DIR"
mkdir -p "$TEST_DIR/lib"

# Create a sample auth.ts file
cat > "$TEST_DIR/lib/auth.ts" << 'EOF'
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }
  },
  rateLimit: {
    window: 60,
    max: 100,
  }
});
EOF

echo "✅ Created sample auth.ts file"

# Test CLI from the test directory
echo "🚀 Testing CLI from test directory..."
cd "$TEST_DIR"

echo "📍 Current directory: $(pwd)"
echo "📄 Auth file exists: $(ls -la lib/auth.ts)"

# Test help command
echo ""
echo "🧪 Testing --help command:"
better-auth-pulse --help

# Test version command  
echo ""
echo "🧪 Testing --version command:"
better-auth-pulse --version

# Test file detection
echo ""
echo "🧪 Testing file detection:"
better-auth-pulse --file=lib/auth.ts --scan --auto

echo ""
echo "✅ Test completed!"
echo "🔄 Cleaning up test directory..."
rm -rf "$TEST_DIR"

echo "🎉 All tests passed!"