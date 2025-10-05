# Better Auth Pulse - Installation & Usage Guide

## 🚀 Installation Options

### Option 1: Global Installation (Recommended)

Install Better Auth Pulse globally to use it in any project:

```bash
# Using npm
npm install -g better-auth-pulse

# Using pnpm (recommended)
pnpm add -g better-auth-pulse

# Using yarn
yarn global add better-auth-pulse
```

After installation, you can use it anywhere:
```bash
better-auth-pulse
# or the short alias
bap
```

### Option 2: NPX (No Installation)

Run directly without installing:

```bash
# Using npx
npx better-auth-pulse

# Using pnpm
pnpm dlx better-auth-pulse

# Using yarn
yarn dlx better-auth-pulse
```

### Option 3: Local Development

For contributing or local development:

```bash
# Clone the repository
git clone https://github.com/better-auth/better-auth-pulse
cd better-auth-pulse

# Install dependencies
pnpm install

# Make CLI executable
chmod +x bin/better-auth-pulse.js

# Test locally
node bin/better-auth-pulse.js --help
```

## 🎯 Usage Examples

### Basic Usage

Navigate to your project directory and run:

```bash
cd /path/to/your/better-auth/project
better-auth-pulse
```

**What happens:**
1. 📁 Scans for better-auth configuration files
2. 📖 Shows detected files for selection
3. 🎯 Analyzes your auth configuration
4. 🌐 Launches visual studio in browser

### Advanced Usage

#### Specify File Directly
```bash
better-auth-pulse --file=lib/auth.ts
```

#### Deep Project Scan
```bash
better-auth-pulse --scan --auto
```

#### Custom Port
```bash
better-auth-pulse --port=4000
```

#### Combine Flags
```bash
better-auth-pulse --file=src/lib/auth.ts --port=3002
```

## 📁 Project Structure Examples

Better Auth Pulse works with various project structures:

### Next.js App Router
```
my-app/
├── app/
├── lib/
│   └── auth.ts          ← Detected
└── package.json
```

### Next.js Pages Router
```
my-app/
├── pages/
├── utils/
│   └── auth.ts          ← Detected
└── package.json
```

### Custom Structure
```
my-project/
├── src/
│   ├── config/
│   │   └── auth.ts      ← Detected
│   └── lib/
├── server/
│   └── auth.ts          ← Also detected
└── package.json
```

## 🔍 File Detection

### Automatic Detection
The CLI automatically scans these locations:
- `lib/auth.ts`
- `src/lib/auth.ts`
- `utils/auth.ts`
- `src/utils/auth.ts`
- `auth.ts`
- `src/auth.ts`
- `lib/better-auth.ts`
- `src/lib/better-auth.ts`
- `config/auth.ts`
- `src/config/auth.ts`
- `server/auth.ts`
- `src/server/auth.ts`
- `app/lib/auth.ts`
- `app/utils/auth.ts`

### Deep Scanning
Use `--scan` flag to search the entire project:
```bash
better-auth-pulse --scan
```

This will find auth files in any location, including:
- Nested directories
- Custom folder structures
- Monorepo packages

## 🎨 Studio Features

Once the studio launches, you can:

### Visual Flow Editor
- **Drag & Drop**: Add auth components visually
- **Auto Layout**: Organize components automatically
- **Real-time Updates**: See changes instantly
- **Connection Management**: Link components with lines

### Code Generation
- **Export auth.ts**: Download updated configuration
- **Generate UI**: Create authentication forms
- **Environment Files**: Generate .env templates
- **TypeScript Types**: Export type definitions

### Configuration Management
- **Import/Export**: Save and load configurations
- **JSON Config**: Export as JSON for version control
- **Team Sharing**: Share configurations with teammates

## 🛠️ Troubleshooting

### Common Issues

#### "No auth files found"
**Solutions:**
- Ensure your file contains `betterAuth` configuration
- Use `--scan` flag for deep project scanning
- Specify file directly: `--file=path/to/auth.ts`
- Check file naming conventions

#### "Permission denied"
**Solutions:**
- Check file permissions: `ls -la path/to/auth.ts`
- Ensure file is readable
- Try running with sudo (not recommended)
- Copy file content and paste manually in studio

#### "Server failed to start"
**Solutions:**
- Check if port is in use: `lsof -i :3001`
- Try different port: `--port=4000`
- Check Node.js version: `node --version` (requires >=16)
- Ensure dependencies are installed

#### "Invalid configuration"
**Solutions:**
- Verify better-auth syntax
- Check for TypeScript errors
- Ensure proper imports
- Validate JSON syntax if using config files

### Debug Information

Get detailed debug information:
```bash
DEBUG=better-auth-pulse* better-auth-pulse
```

Check CLI version and dependencies:
```bash
better-auth-pulse --version
```

## 📋 Workflow Examples

### Scenario 1: New Project Setup
```bash
# 1. Navigate to project
cd my-new-project

# 2. Run CLI (no auth.ts exists yet)
better-auth-pulse

# 3. CLI will start with empty configuration
# 4. Use visual editor to build auth flow
# 5. Export auth.ts when done
```

### Scenario 2: Existing Project
```bash
# 1. Navigate to existing project
cd my-existing-project

# 2. Run CLI (auto-detects auth.ts)
better-auth-pulse

# 3. CLI loads existing configuration
# 4. Modify visually in studio
# 5. Export updated configuration
```

### Scenario 3: Multiple Auth Files
```bash
# 1. Deep scan to find all auth files
better-auth-pulse --scan

# 2. Select specific file from list
# 3. Or specify directly
better-auth-pulse --file=packages/auth/src/config.ts
```

## 🔧 Configuration

### Environment Variables

Set these in your project's `.env` file:

```env
# Server port (optional)
PORT=3001

# Better Auth configuration (auto-set by CLI)
BETTER_AUTH_PULSE_CONFIG=/path/to/config.json

# Debug mode (optional)
DEBUG=better-auth-pulse*
```

### CLI Configuration

Create `.better-auth-pulse.json` in your project root:

```json
{
  "defaultPort": 3001,
  "autoOpen": true,
  "scanDepth": 3,
  "excludeDirs": ["node_modules", ".git", "dist"],
  "preferredFile": "lib/auth.ts"
}
```

## 🚀 Next Steps

After installation:

1. **Test Installation**
   ```bash
   better-auth-pulse --version
   ```

2. **Run in Your Project**
   ```bash
   cd /path/to/your/project
   better-auth-pulse
   ```

3. **Explore Features**
   - Visual flow editor
   - Code generation
   - UI component creation
   - Configuration export

4. **Share with Team**
   - Export configurations as JSON
   - Share generated auth.ts files
   - Document your auth flow visually

## 📚 Additional Resources

- **Documentation**: [Better Auth Pulse Docs](https://better-auth-pulse.dev)
- **Better Auth**: [Official Documentation](https://better-auth.com)
- **Examples**: [GitHub Examples](https://github.com/better-auth/better-auth-pulse/examples)
- **Community**: [Discord Server](https://discord.gg/better-auth)

---

**Need help?** Open an issue on [GitHub](https://github.com/better-auth/better-auth-pulse/issues) or join our [Discord](https://discord.gg/better-auth).