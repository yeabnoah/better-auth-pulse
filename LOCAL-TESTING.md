# Better Auth Pulse - Local Testing Guide

Since the package isn't published to npm yet, here are several ways to test it locally:

## 🧪 **Method 1: Direct Node Execution (Simplest)**

Navigate to the Better Auth Pulse directory and run:

```bash
# Test CLI help
node bin/better-auth-pulse.js --help

# Test with existing auth file
node bin/better-auth-pulse.js --file=utils/auth.ts

# Test version
node bin/better-auth-pulse.js --version

# Test in another project
node /path/to/better-auth-pulse/bin/better-auth-pulse.js --file=lib/auth.ts
```

## 🔗 **Method 2: NPM Link (Recommended for Testing)**

Create a global symlink for testing:

```bash
# In the better-auth-pulse directory
npm link

# Now you can use it globally
better-auth-pulse --help

# Test in any project
cd /path/to/your/project
better-auth-pulse

# When done testing, unlink
npm unlink -g better-auth-pulse
```

## 📦 **Method 3: Local Package Installation**

Install directly from the local directory:

```bash
# In your test project
npm install /path/to/better-auth-pulse

# Or with pnpm
pnpm add /path/to/better-auth-pulse

# Then run
npx better-auth-pulse
```

## 🚀 **Method 4: Create Alias (Quick Testing)**

Add to your shell profile (`.bashrc`, `.zshrc`, etc.):

```bash
alias better-auth-pulse="node /path/to/better-auth-pulse/bin/better-auth-pulse.js"
alias bap="node /path/to/better-auth-pulse/bin/better-auth-pulse.js"
```

Then reload your shell and use:
```bash
better-auth-pulse --help
bap --version
```

## 🧪 **Testing Scenarios**

### Test 1: Basic Functionality
```bash
node bin/better-auth-pulse.js --help
node bin/better-auth-pulse.js --version
```

### Test 2: File Detection
```bash
# Test with existing auth file
node bin/better-auth-pulse.js --file=utils/auth.ts

# Test scanning
node bin/better-auth-pulse.js --scan
```

### Test 3: Different Project Structures

Create test projects with different structures:

```bash
# Test project 1: lib/auth.ts
mkdir test-project-1
cd test-project-1
mkdir lib
echo 'export const auth = betterAuth({});' > lib/auth.ts
node /path/to/better-auth-pulse/bin/better-auth-pulse.js

# Test project 2: src/utils/auth.ts  
mkdir test-project-2
cd test-project-2
mkdir -p src/utils
echo 'export const auth = betterAuth({});' > src/utils/auth.ts
node /path/to/better-auth-pulse/bin/better-auth-pulse.js --scan
```

## 📋 **Expected Behavior**

When working correctly, you should see:

1. **CLI Help**: Displays usage information and options
2. **File Detection**: Finds auth.ts files automatically
3. **Configuration Analysis**: Shows detected features
4. **Server Launch**: Starts Next.js development server
5. **Browser Opening**: Opens studio in default browser

## 🐛 **Troubleshooting Local Testing**

### "Command not found"
- Use full path: `node /full/path/to/better-auth-pulse/bin/better-auth-pulse.js`
- Check file permissions: `chmod +x bin/better-auth-pulse.js`
- Verify Node.js installation: `node --version`

### "Module not found"
- Ensure dependencies are installed: `npm install`
- Check relative paths in CLI script
- Verify all required files exist

### "Server won't start"
- Check if port is available: `lsof -i :3001`
- Try different port: `--port=4000`
- Check Next.js dependencies: `npm list next`

## 🚀 **Preparing for NPM Publishing**

Once local testing is complete, prepare for publishing:

### 1. Update Package Info
```json
{
  "name": "better-auth-pulse",
  "version": "1.0.0",
  "description": "Visual authentication flow builder for better-auth",
  "keywords": ["better-auth", "authentication", "visual-builder", "cli"],
  "repository": "https://github.com/better-auth/better-auth-pulse",
  "homepage": "https://better-auth-pulse.dev"
}
```

### 2. Build for Production
```bash
npm run build
```

### 3. Test Package
```bash
npm pack
npm install -g better-auth-pulse-1.0.0.tgz
better-auth-pulse --help
```

### 4. Publish to NPM
```bash
npm login
npm publish
```

## 📝 **Testing Checklist**

- [ ] CLI help displays correctly
- [ ] Version information shows
- [ ] File detection works in various project structures
- [ ] Configuration parsing handles different auth setups
- [ ] Server starts successfully
- [ ] Browser opens to studio
- [ ] Visual editor loads and functions
- [ ] Code export works
- [ ] Error handling is graceful

## 🎯 **Next Steps**

After successful local testing:

1. **Fix any issues** found during testing
2. **Update documentation** based on testing feedback
3. **Prepare for publishing** to npm registry
4. **Create release notes** with features and usage
5. **Set up CI/CD** for automated testing and publishing

---

**Ready to test?** Start with Method 1 (Direct Node Execution) for the quickest test!