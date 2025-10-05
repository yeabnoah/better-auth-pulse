#!/bin/bash

echo "🔧 Setting up Better Auth Pulse for local testing..."

# Make CLI executable
chmod +x bin/better-auth-pulse.js

# Create npm link for local testing
echo "📦 Creating npm link..."
npm link

echo "✅ Setup complete!"
echo ""
echo "📋 Now you can test in any project:"
echo "  1. cd /path/to/your/project"
echo "  2. better-auth-pulse"
echo ""
echo "🔗 To unlink later: npm unlink -g better-auth-pulse"
echo ""
echo "🚀 To test right here:"
echo "  node bin/better-auth-pulse.js --file=utils/auth.ts"