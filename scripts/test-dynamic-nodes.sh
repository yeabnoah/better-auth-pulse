#!/bin/bash

echo "🧪 Testing Dynamic Node Generation..."

# Create test directory
TEST_DIR="/tmp/better-auth-test-$(date +%s)"
mkdir -p "$TEST_DIR/lib"

echo "📁 Created test directory: $TEST_DIR"

# Test 1: Simple configuration
echo ""
echo "🧪 Test 1: Simple Email + Password Auth"
cat > "$TEST_DIR/lib/auth.ts" << 'EOF'
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  emailAndPassword: { enabled: true }
});
EOF

cd "$TEST_DIR"
echo "📍 Testing from: $(pwd)"
better-auth-pulse --file=lib/auth.ts --auto

if [ -f ".better-auth-pulse.config.json" ]; then
  NODES_COUNT=$(cat .better-auth-pulse.config.json | grep -o '"id":' | wc -l)
  echo "✅ Generated $NODES_COUNT nodes"
  
  # Check if specific nodes exist
  if grep -q '"type": "database"' .better-auth-pulse.config.json; then
    echo "✅ Database node detected"
  fi
  if grep -q '"type": "emailAuth"' .better-auth-pulse.config.json; then
    echo "✅ Email auth node detected"
  fi
else
  echo "❌ No config file generated"
fi

# Test 2: Complex configuration
echo ""
echo "🧪 Test 2: Complex Configuration with Drizzle + OAuth + Plugins"
cat > "$TEST_DIR/lib/auth.ts" << 'EOF'
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  emailVerification: { sendOnSignUp: true },
  socialProviders: {
    google: { clientId: "...", clientSecret: "..." },
    github: { clientId: "...", clientSecret: "..." }
  },
  user: {
    additionalFields: {
      role: { type: "string" },
      specialty: { type: "string" }
    }
  },
  plugins: [nextCookies()]
});
EOF

better-auth-pulse --file=lib/auth.ts --auto

if [ -f ".better-auth-pulse.config.json" ]; then
  NODES_COUNT=$(cat .better-auth-pulse.config.json | grep -o '"id":' | wc -l)
  echo "✅ Generated $NODES_COUNT nodes for complex config"
  
  # Check specific features
  if grep -q '"type": "drizzle"' .better-auth-pulse.config.json; then
    echo "✅ Drizzle adapter detected"
  fi
  if grep -q '"type": "pg"' .better-auth-pulse.config.json; then
    echo "✅ PostgreSQL provider detected"
  fi
  if grep -q '"type": "oauthGoogle"' .better-auth-pulse.config.json; then
    echo "✅ Google OAuth detected"
  fi
  if grep -q '"type": "userConfig"' .better-auth-pulse.config.json; then
    echo "✅ User configuration detected"
  fi
  if grep -q '"type": "nextCookies"' .better-auth-pulse.config.json; then
    echo "✅ Next.js cookies detected"
  fi
else
  echo "❌ No config file generated for complex config"
fi

# Cleanup
echo ""
echo "🔄 Cleaning up test directory..."
rm -rf "$TEST_DIR"

echo ""
echo "🎉 Dynamic node generation test completed!"