#!/bin/bash

echo "🔧 Installing Better Auth Pulse locally for testing..."
echo ""

# Check if we're in the right directory
if [ ! -f "bin/better-auth-pulse.js" ]; then
    echo "❌ Error: Please run this script from the better-auth-pulse directory"
    exit 1
fi

# Make CLI executable
echo "📋 Making CLI executable..."
chmod +x bin/better-auth-pulse.js

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Create global link
echo "🔗 Creating global npm link..."
npm link

echo ""
echo "✅ Installation complete!"
echo ""
echo "🎯 You can now test Better Auth Pulse in any project:"
echo ""
echo "  # Navigate to any project with better-auth"
echo "  cd /path/to/your/project"
echo ""
echo "  # Run Better Auth Pulse"
echo "  better-auth-pulse"
echo ""
echo "  # Or use the short alias"
echo "  bap"
echo ""
echo "🧪 Test commands:"
echo "  better-auth-pulse --help"
echo "  better-auth-pulse --version"
echo "  better-auth-pulse --file=lib/auth.ts"
echo ""
echo "🔄 To uninstall later:"
echo "  npm unlink -g better-auth-pulse"