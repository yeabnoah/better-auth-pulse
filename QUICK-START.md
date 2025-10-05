# Better Auth Pulse - Quick Start Guide

## 🚀 Getting Started with CLI Integration

The Better Auth Pulse Studio now includes integrated CLI functionality that can automatically import and parse your existing better-auth configuration files.

### Option 1: GUI Import (Recommended for beginners)

1. **Open the Studio** - Navigate to your Better Auth Pulse Studio
2. **Click "Import Auth Config"** - Located in the left sidebar
3. **Auto-detection** - The system will automatically scan for auth files
4. **Select your file** - Choose from detected files or enter a custom path
5. **Preview configuration** - Review the extracted settings
6. **Generate visual flow** - Click to create your visual authentication flow

### Option 2: CLI Mode (For developers who prefer terminal)

1. **Click "CLI Mode"** - Located in the left sidebar below Import Auth Config
2. **Terminal interface** - A terminal-like interface will open
3. **Follow prompts** - The CLI will guide you through file selection
4. **Real-time feedback** - See the extraction process in real-time
5. **Complete setup** - Press Enter when prompted to generate the visual flow

## 📁 Supported File Locations

The system automatically scans these common locations:

```
lib/auth.ts
src/lib/auth.ts
utils/auth.ts
src/utils/auth.ts
auth.ts
src/auth.ts
lib/better-auth.ts
src/lib/better-auth.ts
config/auth.ts
src/config/auth.ts
server/auth.ts
src/server/auth.ts
```

## 🔍 What Gets Detected

The parser automatically detects and visualizes:

- **Database Configuration**
  - Prisma/Drizzle adapters
  - Database providers (SQLite, PostgreSQL, MySQL)

- **Authentication Methods**
  - Email & Password authentication
  - Email verification settings
  - Social OAuth providers (Google, GitHub, Discord, etc.)

- **Security Features**
  - Account linking configuration
  - Rate limiting rules
  - Advanced cookie settings
  - CORS configuration

## 🎯 Example Usage

### Scenario 1: New Project
```typescript
// Your existing auth.ts
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: { clientId: "...", clientSecret: "..." }
  }
});
```

**Result**: Automatically generates visual nodes for:
- Auth Starter → Database → Prisma → SQLite
- Auth Starter → Email Auth
- Auth Starter → Social Login → Google OAuth

### Scenario 2: Complex Configuration
```typescript
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true
  },
  socialProviders: {
    google: { clientId: "...", clientSecret: "..." },
    github: { clientId: "...", clientSecret: "..." }
  },
  accountLinking: {
    enabled: true,
    trustedProviders: ["google", "github"]
  },
  rateLimit: {
    window: 60,
    max: 100
  }
});
```

**Result**: Generates comprehensive visual flow with all features connected.

## 🛠️ Troubleshooting

### "No auth files found"
- Ensure your file contains `betterAuth` or `better-auth` imports
- Check file naming conventions
- Try manual path entry
- Use the paste option in the Load Auth.ts preview mode

### "Permission denied"
- Verify file permissions in your project
- Check that the file is in an allowed directory
- Use the manual paste option as fallback

### "Invalid configuration"
- Ensure proper better-auth syntax
- Check for missing imports
- Verify configuration structure matches better-auth documentation

## 🔄 Workflow

### Import → Edit → Export
1. **Import** existing auth.ts using CLI integration
2. **Edit** visually using the node editor
3. **Export** updated configuration back to auth.ts

### Bidirectional Sync
```
auth.ts file ←→ Visual Flow Editor ←→ Generated Code
```

## 🎨 After Import

Once your configuration is imported:

1. **Visual Editing** - Drag and drop to modify your auth flow
2. **Add Components** - Use the sidebar to add new auth features
3. **Generate Code** - Export updated auth.ts with your changes
4. **Create UI** - Use "Create Auth UI" to generate authentication forms
5. **Download Assets** - Get .env templates and configuration files

## 🚀 Next Steps

After successfully importing your auth configuration:

1. **Explore the Visual Editor** - Modify your auth flow visually
2. **Add New Features** - Drag components from the sidebar
3. **Generate UI Components** - Create authentication forms
4. **Export Configuration** - Download updated auth.ts files
5. **Team Collaboration** - Share visual configurations with your team

## 💡 Pro Tips

- **Auto-save**: The system remembers your last used file paths
- **Multiple Projects**: Each project can have different auth.ts locations
- **Version Control**: Export configurations to track changes over time
- **Team Sharing**: Use the JSON export to share configurations with teammates

## 🔗 Related Features

- **Auth UI Generator**: Create authentication forms based on your configuration
- **Environment Templates**: Generate .env files with required variables
- **Organization Client**: Generate client-side organization management code
- **Code Export**: Download complete auth.ts files with your modifications

---

**Need Help?** Check the full documentation in `README-CLI-Integration.md` for detailed technical information.