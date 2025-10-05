<<<<<<< HEAD
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
=======
# 🚀 Better Auth Pulse

> **Visual Studio for Better Auth Configuration** - Drag, drop, and generate production-ready authentication code

[![npm version](https://badge.fury.io/js/better-auth-pulse.svg)](https://badge.fury.io/js/better-auth-pulse)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A powerful visual interface for configuring Better Auth with drag-and-drop simplicity. Generate complete TypeScript authentication code without writing a single line.

## ✨ Features

### 🎨 **Visual Configuration**
- **Drag & Drop Interface** - Build auth flows visually
- **Real-time Preview** - See your configuration as you build
- **Auto Layout** - Automatic node positioning and organization
- **Rich Node Types** - 13+ specialized auth components

### 🔧 **Comprehensive Auth Support**
- **Database Adapters** - Prisma, Drizzle with SQLite/PostgreSQL/MySQL
- **Authentication Methods** - Email/password, social login, magic links
- **Security Features** - Rate limiting, CSRF protection, secure cookies
- **Advanced Options** - Account linking, session management, plugins

### 🚀 **Developer Experience**
- **CLI Tool** - Run anywhere with `npx better-auth-pulse`
- **Auto Detection** - Finds your existing auth configurations
- **Code Generation** - Production-ready TypeScript output
- **Environment Templates** - Auto-generated `.env` files

## 🎯 Quick Start

### Installation

```bash
# Install globally
npm install -g better-auth-pulse

# Or use with npx (recommended)
npx better-auth-pulse
```

### Basic Usage

```bash
# Auto-detect auth file and start studio
npx better-auth-pulse

# Specify custom auth file
npx better-auth-pulse --file=lib/auth.ts

# Deep scan entire project
npx better-auth-pulse --scan

# Export configuration only
npx better-auth-pulse --export
```

### CLI Options

| Option | Description | Example |
|--------|-------------|---------|
| `-f, --file=<path>` | Specify auth.ts file path | `--file=lib/auth.ts` |
| `-p, --port=<number>` | Set studio port (default: 3001) | `--port=4000` |
| `-s, --scan` | Deep scan entire project | `--scan` |
| `-a, --auto` | Auto-select if only one file found | `--auto` |
| `-e, --export` | Export JSON config only | `--export` |
| `-h, --help` | Show help information | `--help` |
| `-v, --version` | Show version | `--version` |

## 🎨 Studio Interface

### Supported Node Types

#### **Database & Adapters**
- `database` - Database configuration
- `prisma` - Prisma adapter
- `drizzle` - Drizzle adapter  
- `provider` - Database provider
- `sqlite` / `postgresql` / `mysql` - Database types

#### **Authentication**
- `emailAuth` - Email and password authentication
- `emailVerification` - Email verification flow
- `emailResend` - Resend email service
- `socialLogin` - Social authentication hub
- `oauthGoogle` / `oauthGithub` - OAuth providers

#### **Advanced Features**
- `account` - Account linking and management
- `rateLimit` - Rate limiting configuration
- `advanced` - Security and cookie options
- `eventHandler` - Custom event handling

### Visual Workflow

1. **Start** - Begin with the `authStarter` node
2. **Connect** - Drag and connect authentication components
3. **Configure** - Set parameters for each component
4. **Generate** - Create production-ready TypeScript code
5. **Export** - Save configuration and generated files

## 📁 Generated Files

When you use Better Auth Pulse, it creates:

- **`.better-auth-pulse.config.json`** - Full visual configuration
- **`auth-config.json`** - JSON configuration for integration
- **Updated `auth.ts`** - Your Better Auth configuration
- **Environment template** - Required environment variables

## 🔧 Configuration Examples

### Email & Password Authentication
```typescript
// Generated auth.ts
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: true,
    autoSignIn: true,
  },
  // ... more configuration
});
```

### Social Login with Google
```typescript
export const auth = betterAuth({
>>>>>>> 8ed2b73e298527aef85b102b2e3cf32a15cb4a58
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
<<<<<<< HEAD
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
=======
    },
  },
  // ... more configuration
});
```

### Advanced Security Setup
```typescript
export const auth = betterAuth({
  rateLimit: {
    window: 60,
    max: 100,
    customRules: {
      "/api/auth/sign-in": { window: 60, max: 5 }
    }
  },
  advanced: {
    useSecureCookies: true,
    cookiePrefix: "better-auth",
  },
  // ... more configuration
});
```

## 🛠 Development

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- TypeScript

### Setup
```bash
# Clone the repository
git clone https://github.com/your-username/better-auth-pulse.git
cd better-auth-pulse

# Install dependencies
npm install

# Start development server
npm run dev
```

### Project Structure
```
better-auth-pulse/
├── cli/                 # CLI tool
├── app/                 # Next.js application
├── component/           # React components
├── lib/                 # Utilities and services
├── utils/               # Helper functions
└── public/              # Static assets
>>>>>>> 8ed2b73e298527aef85b102b2e3cf32a15cb4a58
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

<<<<<<< HEAD
### Development Setup

=======
### Development Workflow
>>>>>>> 8ed2b73e298527aef85b102b2e3cf32a15cb4a58
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

<<<<<<< HEAD
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
=======
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Better Auth](https://better-auth.com) - The amazing authentication library
- [React Flow](https://reactflow.dev) - The visual flow editor
- [Next.js](https://nextjs.org) - The React framework
- [Tailwind CSS](https://tailwindcss.com) - The CSS framework

## 📞 Support

- 📖 [Documentation](https://github.com/your-username/better-auth-pulse#readme)
- 🐛 [Report Issues](https://github.com/your-username/better-auth-pulse/issues)
- 💬 [Discussions](https://github.com/your-username/better-auth-pulse/discussions)

---

<div align="center">
  <strong>Built with ❤️ for the Better Auth community</strong>
</div>
>>>>>>> 8ed2b73e298527aef85b102b2e3cf32a15cb4a58
