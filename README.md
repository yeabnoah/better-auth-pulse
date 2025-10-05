# Better Auth Pulse

> Visual authentication flow builder for better-auth

[![npm version](https://badge.fury.io/js/better-auth-pulse.svg)](https://badge.fury.io/js/better-auth-pulse)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Better Auth Pulse is a visual studio for building and managing [better-auth](https://better-auth.com) authentication flows. It automatically detects your existing better-auth configuration and provides a visual interface to edit, extend, and generate authentication code.

## 🚀 Quick Start

### Global Installation

```bash
# Install globally with npm
npm install -g better-auth-pulse

# Or with pnpm
pnpm add -g better-auth-pulse

# Or with yarn
yarn global add better-auth-pulse
```

### Usage

```bash
# Run in your project directory
better-auth-pulse

# Or use the short alias
bap
```

### NPX (No Installation Required)

```bash
# Run directly with npx
npx better-auth-pulse

# Or with pnpm
pnpm dlx better-auth-pulse
```

## 🎯 Features

- **🔍 Auto-Detection**: Automatically finds better-auth configuration files
- **📊 Visual Editor**: Drag-and-drop interface for auth flow design
- **🎨 UI Generator**: Creates authentication forms based on your config
- **📁 File Management**: Import/export auth.ts files seamlessly
- **🔧 Configuration**: Supports all better-auth features and plugins
- **🌐 Web Studio**: Full-featured browser-based editor

## 📋 CLI Options

```bash
better-auth-pulse [options]

OPTIONS:
  --file=<path>        Specify auth.ts file path directly
  --port=<number>      Set server port (default: 3001)
  --scan, -s          Deep scan entire project for auth files
  --auto, -a          Auto-select file if only one found
  --help, -h          Show help message
  --version, -v       Show version information

EXAMPLES:
  better-auth-pulse                    # Interactive mode
  better-auth-pulse --file=lib/auth.ts # Specify file directly
  better-auth-pulse --scan --auto     # Deep scan and auto-select
  better-auth-pulse --port=4000       # Use custom port
  bap -s -a                           # Short flags
```

## 🔄 Workflow

1. **📁 Detection**: Scans your project for better-auth configuration files
2. **📖 Extraction**: Reads and parses your authentication setup
3. **🎯 Analysis**: Identifies configured features and providers
4. **🔄 Visualization**: Generates interactive visual flow
5. **🌐 Studio**: Opens browser-based editor for modifications
6. **💾 Export**: Download updated auth.ts and UI components

## 📁 Supported File Locations

Better Auth Pulse automatically scans these common locations:

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
app/lib/auth.ts
app/utils/auth.ts
```

## 🎯 Detected Features

The visual editor automatically detects and represents:

### Database Configuration
- Prisma adapter
- Drizzle adapter  
- Database providers (SQLite, PostgreSQL, MySQL)

### Authentication Methods
- Email & Password authentication
- Email verification settings
- Magic link authentication
- Phone number authentication

### Social Providers
- Google OAuth
- GitHub OAuth
- Discord OAuth
- Facebook OAuth
- Apple OAuth
- And many more...

### Security Features
- Account linking
- Rate limiting
- Session management
- Cookie configuration
- CORS settings
- CSRF protection

### Advanced Features
- Organization management
- Role-based access control
- Custom middleware
- Event handlers
- Webhooks

## 🎨 Visual Studio Features

Once the studio opens, you can:

### Visual Flow Editor
- **Drag & Drop**: Add authentication components visually
- **Auto Layout**: Automatically organize your auth flow
- **Real-time Preview**: See changes instantly
- **Connection Management**: Link components with visual connections

### Code Generation
- **Auth.ts Export**: Generate updated better-auth configuration
- **UI Components**: Create authentication forms and pages
- **Environment Templates**: Generate .env files with required variables
- **TypeScript Types**: Export type definitions

### Configuration Management
- **Import/Export**: Save and load configurations
- **Version Control**: Track changes to your auth setup
- **Team Sharing**: Share configurations with team members

## 🛠️ Development

### Local Development

```bash
# Clone the repository
git clone https://github.com/better-auth/better-auth-pulse
cd better-auth-pulse

# Install dependencies
pnpm install

# Run development server
pnpm dev

# Test CLI locally
pnpm cli
```

### Building

```bash
# Build for production
pnpm build

# Test production build
pnpm start
```

## 📖 Examples

### Basic Setup

```typescript
// Your existing lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }
  }
});
```

**Result**: Visual flow with Database → Prisma → SQLite and Social → Google OAuth nodes.

### Advanced Configuration

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

**Result**: Comprehensive visual flow with all features connected and configurable.

## 🔧 Troubleshooting

### Common Issues

**"No auth files found"**
- Ensure your file contains `betterAuth` configuration
- Try using `--scan` flag for deep project scanning
- Specify file directly with `--file=path/to/auth.ts`

**"Permission denied"**
- Check file permissions in your project
- Ensure the file is readable
- Try running with appropriate permissions

**"Server failed to start"**
- Check if port is already in use
- Try a different port with `--port=4000`
- Ensure Node.js version >= 16

**"Invalid configuration"**
- Verify better-auth syntax in your file
- Check for missing imports
- Ensure proper TypeScript/JavaScript syntax

### Debug Mode

Run with verbose output:
```bash
DEBUG=better-auth-pulse* better-auth-pulse
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Documentation**: [https://better-auth-pulse.dev](https://better-auth-pulse.dev)
- **Better Auth**: [https://better-auth.com](https://better-auth.com)
- **GitHub**: [https://github.com/better-auth/better-auth-pulse](https://github.com/better-auth/better-auth-pulse)
- **Issues**: [https://github.com/better-auth/better-auth-pulse/issues](https://github.com/better-auth/better-auth-pulse/issues)

## 🙏 Acknowledgments

- [Better Auth](https://better-auth.com) - The authentication library this tool is built for
- [React Flow](https://reactflow.dev) - Visual node editor
- [Next.js](https://nextjs.org) - Web framework
- [Tailwind CSS](https://tailwindcss.com) - Styling

---

**Made with ❤️ for the Better Auth community**