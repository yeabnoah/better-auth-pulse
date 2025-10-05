#!/bin/bash

echo "🚀 Better Auth Pulse CLI - Installation & Testing"
echo "=================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "bin/cli.js" ]; then
    echo "❌ Error: Please run this script from the better-auth-pulse directory"
    exit 1
fi

# Make CLI executable
echo "📋 Making CLI executable..."
chmod +x bin/cli.js

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Test CLI commands
echo ""
echo "🧪 Testing CLI commands..."
echo ""

echo "1️⃣  Testing --help flag:"
./bin/cli.js --help
echo ""

echo "2️⃣  Testing --version flag:"
./bin/cli.js --version
echo ""

echo "3️⃣  Testing with existing auth.ts file:"
echo "   Command: ./bin/cli.js --file=utils/auth.ts --port=3003"
echo "   (This will start the studio - press Ctrl+C to stop)"
echo ""

# Create npm link for global testing
echo "🔗 Creating npm link for global testing..."
npm link

echo ""
echo "✅ Installation and testing complete!"
echo ""
echo "🎯 You can now test Better Auth Pulse in any project:"
echo ""
echo "  # Navigate to any project with better-auth"
echo "  cd /path/to/your/project"
echo ""
echo "  # Run Better Auth Pulse"
echo "  better-auth-pulse"
echo ""
echo "  # Or use specific flags"
echo "  better-auth-pulse --file=lib/auth.ts"
echo "  better-auth-pulse --scan --auto"
echo "  better-auth-pulse --port=4000"
echo ""
echo "🔄 To uninstall later:"
echo "  npm unlink -g better-auth-pulse"
echo ""
echo "📚 Documentation:"
echo "  • README.md - Main documentation"
echo "  • CLACK-CLI-SUCCESS.md - Implementation details"
echo "  • INSTALLATION.md - Installation guide"